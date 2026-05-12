import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sequelize from "../../src/db/sequelize.js";
import logger from "../../src/config/logger.js";
import {
  DEFAULT_EVIDENCE_WINDOW,
  EVIDENCE_WINDOWS,
} from "../../src/shared/constants/evidence-windows.js";

const martLogger = logger.child({ script: "mart-refresh" });

async function readSqlFile(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  return fs.readFile(absolutePath, "utf8");
}

async function validateMart() {
  const [featureCountRows] = await sequelize.query("SELECT COUNT(*)::int AS count FROM mart.player_features");
  const [rankingCountRows] = await sequelize.query("SELECT COUNT(*)::int AS count FROM mart.player_ranking");
  const [duplicateRows] = await sequelize.query(`
    SELECT COUNT(*)::int AS count
    FROM (
      SELECT player_id
      FROM mart.player_ranking
      GROUP BY player_id
      HAVING COUNT(*) > 1
    ) duplicates
  `);
  const [invalidRows] = await sequelize.query(`
    SELECT COUNT(*)::int AS count
    FROM mart.player_ranking
    WHERE final_dss_score IS NULL
       OR smart_value_index IS NULL
       OR market_value_eur IS NULL
       OR total_minutes IS NULL
       OR production_score IS NULL
       OR value_score IS NULL
       OR reliability_score_last_season IS NULL
       OR reliability_score_last_3_seasons IS NULL
       OR reliability_score_last_5_seasons IS NULL
       OR smart_value_index_last_season IS NULL
       OR smart_value_index_last_3_seasons IS NULL
       OR smart_value_index_last_5_seasons IS NULL
  `);

  if (featureCountRows[0].count <= 0) {
    throw new Error("mart.player_features is empty");
  }

  if (rankingCountRows[0].count <= 0) {
    throw new Error("mart.player_ranking is empty");
  }

  if (duplicateRows[0].count > 0) {
    throw new Error("mart.player_ranking contains duplicate player rows");
  }

  if (invalidRows[0].count > 0) {
    throw new Error("mart.player_ranking contains invalid key numeric fields");
  }

  const requiredColumns = [
    EVIDENCE_WINDOWS.last_season.recentMinutesColumn,
    EVIDENCE_WINDOWS.last_3_seasons.recentMinutesColumn,
    EVIDENCE_WINDOWS.last_5_seasons.recentMinutesColumn,
    EVIDENCE_WINDOWS.last_season.reliabilityScoreColumn,
    EVIDENCE_WINDOWS.last_3_seasons.reliabilityScoreColumn,
    EVIDENCE_WINDOWS.last_5_seasons.reliabilityScoreColumn,
    EVIDENCE_WINDOWS.last_season.smartValueIndexColumn,
    EVIDENCE_WINDOWS.last_3_seasons.smartValueIndexColumn,
    EVIDENCE_WINDOWS.last_5_seasons.smartValueIndexColumn,
    "final_dss_score",
    "smart_value_index",
  ];

  const [columnRows] = await sequelize.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'mart' AND table_name = 'player_ranking'
  `);

  const existingColumns = new Set(columnRows.map((row) => row.column_name));
  const missingColumns = requiredColumns.filter((column) => !existingColumns.has(column));

  if (missingColumns.length > 0) {
    throw new Error(`mart.player_ranking is missing required columns: ${missingColumns.join(", ")}`);
  }

  const [topRankedRows] = await sequelize.query(`
    SELECT final_dss_score
    FROM mart.player_ranking
    ORDER BY final_dss_score DESC, total_minutes DESC, goal_contributions DESC
    LIMIT 5
  `);

  const sortedScores = topRankedRows.map((row) => Number(row.final_dss_score));
  for (let index = 1; index < sortedScores.length; index += 1) {
    if (sortedScores[index] > sortedScores[index - 1]) {
      throw new Error("mart.player_ranking is not sorted by final_dss_score as expected");
    }
  }

  martLogger.info(
    {
      featureRows: featureCountRows[0].count,
      rankingRows: rankingCountRows[0].count,
      defaultEvidenceWindow: DEFAULT_EVIDENCE_WINDOW,
    },
    "Mart validation passed"
  );
}

export async function refreshMart() {
  martLogger.info("Starting mart refresh");

  const buildPlayerFeaturesSql = await readSqlFile("database/sql/mart/build-player-features.sql");
  const buildPlayerRankingSql = await readSqlFile("database/sql/mart/build-player-ranking.sql");

  const transaction = await sequelize.transaction();

  try {
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS mart", { transaction });
    await sequelize.query(buildPlayerFeaturesSql, { transaction });
    await sequelize.query(buildPlayerRankingSql, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  await validateMart();
  martLogger.info("Mart refresh completed successfully");
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  refreshMart()
    .catch((error) => {
      logger.error({ err: error }, "Mart refresh failed");
      process.exitCode = 1;
    })
    .finally(async () => {
      await sequelize.close();
    });
}
