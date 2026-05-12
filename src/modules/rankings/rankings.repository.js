import { QueryTypes } from "sequelize";
import sequelize from "../../db/sequelize.js";
import { EVIDENCE_WINDOWS, RELIABILITY_THRESHOLDS } from "../../shared/constants/evidence-windows.js";

const SORT_COLUMNS = {
  name: "pr.name",
  marketValueEur: "pr.market_value_eur",
  finalDssScore: "pr.final_dss_score",
};

function latestClubCte() {
  return `
    WITH latest_club AS (
      SELECT player_id, club_id
      FROM (
        SELECT
          player_id,
          club_id,
          date_id,
          ROW_NUMBER() OVER (
            PARTITION BY player_id
            ORDER BY date_id DESC
          ) AS rn
        FROM warehouse.fact_player_valuations
        WHERE club_id IS NOT NULL
      ) ranked
      WHERE rn = 1
    )
  `;
}

function buildRankingContext(filters) {
  const windowConfig = EVIDENCE_WINDOWS[filters.evidenceWindow];
  const threshold = RELIABILITY_THRESHOLDS[filters.evidenceWindow][filters.reliabilityLevel];
  const conditions = [
    `pr.${windowConfig.recentMinutesColumn} >= :threshold`,
  ];
  const replacements = {
    threshold,
  };

  if (filters.position) {
    conditions.push("pr.position = :position");
    replacements.position = filters.position;
  }

  if (filters.clubId) {
    conditions.push("dc.club_id = :clubId");
    replacements.clubId = filters.clubId;
  }

  if (filters.minAge) {
    conditions.push("EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date)) >= :minAge");
    replacements.minAge = filters.minAge;
  }

  if (filters.maxAge) {
    conditions.push("EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date)) <= :maxAge");
    replacements.maxAge = filters.maxAge;
  }

  if (filters.maxBudget) {
    conditions.push("pr.market_value_eur <= :maxBudget");
    replacements.maxBudget = filters.maxBudget;
  }

  return {
    windowConfig,
    whereClause: conditions.join(" AND "),
    replacements,
  };
}

function baseFromClause() {
  return `
    FROM mart.player_ranking pr
    LEFT JOIN warehouse.dim_players dp
      ON dp.player_id = pr.player_id
    LEFT JOIN latest_club lc
      ON lc.player_id = pr.player_id
    LEFT JOIN warehouse.dim_clubs dc
      ON dc.club_id = lc.club_id
  `;
}

function orderByClause(sortBy, sortOrder) {
  const sortColumn = SORT_COLUMNS[sortBy] ?? SORT_COLUMNS.finalDssScore;
  const order = sortOrder.toUpperCase();

  if (sortBy === "finalDssScore") {
    return `ORDER BY ${sortColumn} ${order}, pr.total_minutes DESC, pr.goal_contributions DESC, pr.player_id ASC`;
  }

  return `ORDER BY ${sortColumn} ${order}, pr.player_id ASC`;
}

function selectSql(windowConfig) {
  return `
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY pr.final_dss_score DESC, pr.total_minutes DESC, pr.goal_contributions DESC
      )::int AS rank,
      pr.player_id::int AS "playerId",
      pr.name,
      pr.position,
      EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date))::int AS age,
      dp.nationality,
      dc.club_id::int AS "clubId",
      dc.club_name AS "clubName",
      dc.country AS "clubCountry",
      pr.market_value_eur::float8 AS "marketValueEur",
      pr.final_dss_score::float8 AS "finalDssScore",
      pr.production_score::float8 AS "productionScore",
      pr.value_score::float8 AS "valueScore",
      pr.discipline_score::float8 AS "disciplineScore",
      pr.${windowConfig.recentMinutesColumn}::int AS "recentMinutes",
      pr.${windowConfig.recentAppearancesColumn}::int AS "recentAppearances",
      pr.${windowConfig.reliabilityScoreColumn}::float8 AS "reliabilityScore",
      pr.${windowConfig.smartValueIndexColumn}::float8 AS "smartValueIndex",
      pr.smart_value_index::float8 AS "baseSmartValueIndex"
  `;
}

export async function listRankings(filters) {
  const { windowConfig, whereClause, replacements } = buildRankingContext(filters);
  const itemsQuery = `
    ${latestClubCte()}
    ${selectSql(windowConfig)}
    ${baseFromClause()}
    WHERE ${whereClause}
    ${orderByClause(filters.sortBy, filters.sortOrder)}
    LIMIT :limit
    OFFSET :offset
  `;

  const countQuery = `
    ${latestClubCte()}
    SELECT COUNT(*)::int AS total
    ${baseFromClause()}
    WHERE ${whereClause}
  `;

  const items = await sequelize.query(itemsQuery, {
    replacements: {
      ...replacements,
      limit: filters.limit,
      offset: filters.offset,
    },
    type: QueryTypes.SELECT,
  });

  const [countRow] = await sequelize.query(countQuery, {
    replacements,
    type: QueryTypes.SELECT,
  });

  return {
    items,
    total: countRow.total,
  };
}

export function getDefaultShortlistQuery(query) {
  return {
    ...query,
    limit: query.limit ?? 10,
  };
}
