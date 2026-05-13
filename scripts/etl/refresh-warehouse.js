import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import csv from "csv-parser";
import pool from "../../src/db/pool.js";
import logger from "../../src/config/logger.js";
import { sourceDataDir } from "../../src/config/paths.js";

const REQUIRED_FILES = [
  "players.csv",
  "player_valuations.csv",
  "appearances.csv",
  "games.csv",
  "clubs.csv",
  "competitions.csv",
];

const INSERT_BATCH_SIZE = 20000;

function normalizeText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}

function toNumber(value) {
  const normalized = normalizeText(value);
  if (normalized === null) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value, fallback = null) {
  const parsed = toNumber(value);
  if (parsed === null) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function normalizeDate(value) {
  const normalized = normalizeText(value);
  if (normalized === null) {
    return null;
  }

  const dateInput =
    normalized.includes("T") || normalized.includes(" ")
      ? normalized.replace(" ", "T")
      : `${normalized}T00:00:00Z`;

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function getIsoWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const target = new Date(date.valueOf());
  const dayNumber = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);

  return 1 + Math.round((target - firstThursday) / 604800000);
}

function buildDimDate(dateSet) {
  return Array.from(dateSet)
    .sort()
    .map((dateString) => {
      const date = new Date(`${dateString}T00:00:00Z`);
      const month = date.getUTCMonth() + 1;

      return {
        date_id: dateString,
        year: date.getUTCFullYear(),
        month,
        day: date.getUTCDate(),
        week: getIsoWeek(dateString),
        quarter: Math.floor((month - 1) / 3) + 1,
        day_of_week: (date.getUTCDay() + 6) % 7,
      };
    });
}

function createCompetitionIdMap(rows) {
  const codes = [...new Set(rows.map((row) => normalizeText(row.competition_id)).filter(Boolean))].sort();
  return new Map(codes.map((code, index) => [code, index + 1]));
}

async function readCsvRows(fileName, onRow) {
  const filePath = path.join(sourceDataDir, fileName);

  await fs.promises.access(filePath, fs.constants.R_OK);

  return new Promise((resolve, reject) => {
    const stream = fs
      .createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        stream.pause();

        try {
          await onRow(row);
          stream.resume();
        } catch (error) {
          stream.destroy(error);
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });
}

async function readAllCsvRows(fileName) {
  const rows = [];
  await readCsvRows(fileName, async (row) => {
    rows.push(row);
  });
  return rows;
}

async function insertRows(client, tableName, columns, rows, conflictColumns = []) {
  if (rows.length === 0) {
    return 0;
  }

  const values = [];
  const placeholders = rows
    .map((row, rowIndex) => {
      const rowPlaceholders = columns.map((column, columnIndex) => {
        values.push(row[column]);
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });

      return `(${rowPlaceholders.join(", ")})`;
    })
    .join(", ");

  const conflictClause =
    conflictColumns.length > 0 ? ` ON CONFLICT (${conflictColumns.join(", ")}) DO NOTHING` : "";

  await client.query(
    `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES ${placeholders}${conflictClause}`,
    values
  );

  return rows.length;
}

async function loadBatches(client, tableName, columns, rows, conflictColumns, loggerInstance) {
  let inserted = 0;

  for (let index = 0; index < rows.length; index += INSERT_BATCH_SIZE) {
    const batch = rows.slice(index, index + INSERT_BATCH_SIZE);
    inserted += await insertRows(client, tableName, columns, batch, conflictColumns);
  }

  loggerInstance.info({ tableName, rowCount: inserted }, "Loaded table");
  return inserted;
}

async function loadStreamedBatches(client, tableName, columns, conflictColumns, fileName, mapRow) {
  const scopedLogger = logger.child({ script: "warehouse-etl", fileName, tableName });
  let batch = [];
  let inserted = 0;

  await readCsvRows(fileName, async (row) => {
    const mappedRow = mapRow(row);
    if (!mappedRow) {
      return;
    }

    batch.push(mappedRow);

    if (batch.length >= INSERT_BATCH_SIZE) {
      inserted += await insertRows(client, tableName, columns, batch, conflictColumns);
      batch = [];
    }
  });

  if (batch.length > 0) {
    inserted += await insertRows(client, tableName, columns, batch, conflictColumns);
  }

  scopedLogger.info({ rowCount: inserted }, "Loaded table");
  return inserted;
}

function assertRequiredFilesExist() {
  for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(sourceDataDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required source file not found: ${filePath}`);
    }
  }
}

export async function refreshWarehouse() {
  const etlLogger = logger.child({ script: "warehouse-etl" });
  assertRequiredFilesExist();

  etlLogger.info({ sourceDataDir }, "Starting warehouse refresh");

  const competitionsRaw = await readAllCsvRows("competitions.csv");
  const clubsRaw = await readAllCsvRows("clubs.csv");
  const playersRaw = await readAllCsvRows("players.csv");

  const competitionIdMap = createCompetitionIdMap(competitionsRaw);
  const competitionCountries = new Map(
    competitionsRaw.map((row) => [normalizeText(row.competition_id), normalizeText(row.country_name)])
  );

  const dimCompetitions = competitionsRaw
    .map((row) => ({
      competition_id: competitionIdMap.get(normalizeText(row.competition_id)),
      name: normalizeText(row.name),
      country: normalizeText(row.country_name),
    }))
    .filter((row) => row.competition_id && row.name);

  const clubMap = new Map();
  for (const row of clubsRaw) {
    const clubId = toInteger(row.club_id);
    if (!clubId) {
      continue;
    }

    clubMap.set(clubId, {
      club_id: clubId,
      club_name: normalizeText(row.name) || `Unknown Club ${clubId}`,
      country: competitionCountries.get(normalizeText(row.domestic_competition_id)) || null,
    });
  }

  const playerMap = new Map();
  for (const row of playersRaw) {
    const playerId = toInteger(row.player_id);
    if (!playerId) {
      continue;
    }

    playerMap.set(playerId, {
      player_id: playerId,
      name: normalizeText(row.name) || `Unknown Player ${playerId}`,
      birth_date: normalizeDate(row.date_of_birth),
      position: normalizeText(row.position),
      nationality: normalizeText(row.country_of_citizenship),
    });
  }

  const extraClubsMap = new Map();
  const extraPlayersMap = new Map();
  const factMatches = [];
  const validMatchIds = new Set();
  const dateSet = new Set();

  etlLogger.info("Scanning games.csv");
  await readCsvRows("games.csv", async (row) => {
    const matchId = toInteger(row.game_id);
    const competitionId = competitionIdMap.get(normalizeText(row.competition_id));
    const dateId = normalizeDate(row.date);
    const season = toInteger(row.season);
    const homeClubId = toInteger(row.home_club_id);
    const awayClubId = toInteger(row.away_club_id);

    if (homeClubId && !clubMap.has(homeClubId) && !extraClubsMap.has(homeClubId)) {
      extraClubsMap.set(homeClubId, {
        club_id: homeClubId,
        club_name: normalizeText(row.home_club_name) || `Unknown Club ${homeClubId}`,
        country: null,
      });
    }

    if (awayClubId && !clubMap.has(awayClubId) && !extraClubsMap.has(awayClubId)) {
      extraClubsMap.set(awayClubId, {
        club_id: awayClubId,
        club_name: normalizeText(row.away_club_name) || `Unknown Club ${awayClubId}`,
        country: null,
      });
    }

    if (!matchId || !competitionId || !dateId || season === null || !homeClubId || !awayClubId) {
      return;
    }

    dateSet.add(dateId);
    validMatchIds.add(matchId);
    factMatches.push({
      match_id: matchId,
      competition_id: competitionId,
      date_id: dateId,
      season,
      home_club_id: homeClubId,
      away_club_id: awayClubId,
      home_score: toInteger(row.home_club_goals),
      away_score: toInteger(row.away_club_goals),
    });
  });

  etlLogger.info("Scanning appearances.csv for missing players and dates");
  await readCsvRows("appearances.csv", async (row) => {
    const playerId = toInteger(row.player_id);
    const dateId = normalizeDate(row.date);

    if (dateId) {
      dateSet.add(dateId);
    }

    if (!playerId || playerMap.has(playerId) || extraPlayersMap.has(playerId)) {
      return;
    }

    extraPlayersMap.set(playerId, {
      player_id: playerId,
      name: normalizeText(row.player_name) || `Unknown Player ${playerId}`,
      birth_date: null,
      position: null,
      nationality: null,
    });
  });

  etlLogger.info("Scanning player_valuations.csv for dates");
  await readCsvRows("player_valuations.csv", async (row) => {
    const dateId = normalizeDate(row.date);
    if (dateId) {
      dateSet.add(dateId);
    }
  });

  const dimClubs = [...clubMap.values(), ...extraClubsMap.values()];
  const dimPlayers = [...playerMap.values(), ...extraPlayersMap.values()];
  const dimDate = buildDimDate(dateSet);
  const validPlayerIds = new Set(dimPlayers.map((row) => row.player_id));
  const validClubIds = new Set(dimClubs.map((row) => row.club_id));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      TRUNCATE TABLE
        warehouse.fact_player_valuations,
        warehouse.fact_player_performance,
        warehouse.fact_matches,
        warehouse.dim_players,
        warehouse.dim_clubs,
        warehouse.dim_competitions,
        warehouse.dim_date
      CASCADE
    `);

    await loadBatches(client, "warehouse.dim_date", ["date_id", "year", "month", "day", "week", "quarter", "day_of_week"], dimDate, ["date_id"], etlLogger);
    await loadBatches(client, "warehouse.dim_competitions", ["competition_id", "name", "country"], dimCompetitions, ["competition_id"], etlLogger);
    await loadBatches(client, "warehouse.dim_clubs", ["club_id", "club_name", "country"], dimClubs, ["club_id"], etlLogger);
    await loadBatches(client, "warehouse.dim_players", ["player_id", "name", "birth_date", "position", "nationality"], dimPlayers, ["player_id"], etlLogger);
    await loadBatches(client, "warehouse.fact_matches", ["match_id", "competition_id", "date_id", "season", "home_club_id", "away_club_id", "home_score", "away_score"], factMatches, ["match_id"], etlLogger);

    await loadStreamedBatches(
      client,
      "warehouse.fact_player_performance",
      ["player_id", "match_id", "date_id", "minutes_played", "goals", "assists", "yellow_cards", "red_cards"],
      ["player_id", "match_id"],
      "appearances.csv",
      (row) => {
        const playerId = toInteger(row.player_id);
        const matchId = toInteger(row.game_id);
        const dateId = normalizeDate(row.date);

        if (!playerId || !matchId || !dateId || !validPlayerIds.has(playerId) || !validMatchIds.has(matchId)) {
          return null;
        }

        return {
          player_id: playerId,
          match_id: matchId,
          date_id: dateId,
          minutes_played: toInteger(row.minutes_played, 0),
          goals: toInteger(row.goals, 0),
          assists: toInteger(row.assists, 0),
          yellow_cards: toInteger(row.yellow_cards, 0),
          red_cards: toInteger(row.red_cards, 0),
        };
      }
    );

    await loadStreamedBatches(
      client,
      "warehouse.fact_player_valuations",
      ["player_id", "date_id", "market_value_eur", "club_id"],
      ["player_id", "date_id"],
      "player_valuations.csv",
      (row) => {
        const playerId = toInteger(row.player_id);
        const dateId = normalizeDate(row.date);
        const clubId = toInteger(row.current_club_id);

        if (!playerId || !dateId || !validPlayerIds.has(playerId)) {
          return null;
        }

        if (clubId !== null && !validClubIds.has(clubId)) {
          return null;
        }

        return {
          player_id: playerId,
          date_id: dateId,
          market_value_eur: toNumber(row.market_value_in_eur),
          club_id: clubId,
        };
      }
    );

    await client.query("COMMIT");
    etlLogger.info("Warehouse refresh completed successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  refreshWarehouse()
    .catch((error) => {
      logger.error({ err: error }, "Warehouse refresh failed");
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
