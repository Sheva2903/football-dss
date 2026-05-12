import { QueryTypes } from "sequelize";
import sequelize from "../../db/sequelize.js";
import {
  EVIDENCE_WINDOWS,
  RELIABILITY_THRESHOLDS,
} from "../../shared/constants/evidence-windows.js";
import { rankSimilarAlternatives } from "./recommendations.service.js";

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

function buildPlayersWhereClause(filters) {
  const conditions = [];
  const replacements = {};

  if (filters.position) {
    conditions.push("pr.position = :position");
    replacements.position = filters.position;
  }

  if (filters.clubId) {
    conditions.push("dc.club_id = :clubId");
    replacements.clubId = filters.clubId;
  }

  if (filters.minAge) {
    conditions.push('EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date)) >= :minAge');
    replacements.minAge = filters.minAge;
  }

  if (filters.maxAge) {
    conditions.push('EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date)) <= :maxAge');
    replacements.maxAge = filters.maxAge;
  }

  if (filters.minMarketValue) {
    conditions.push("pr.market_value_eur >= :minMarketValue");
    replacements.minMarketValue = filters.minMarketValue;
  }

  if (filters.maxMarketValue) {
    conditions.push("pr.market_value_eur <= :maxMarketValue");
    replacements.maxMarketValue = filters.maxMarketValue;
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    replacements,
  };
}

export async function listPlayers(filters) {
  const { whereClause, replacements } = buildPlayersWhereClause(filters);
  const sortColumn = SORT_COLUMNS[filters.sortBy];
  const sortOrder = filters.sortOrder.toUpperCase();

  const baseFromClause = `
    FROM mart.player_ranking pr
    LEFT JOIN warehouse.dim_players dp
      ON dp.player_id = pr.player_id
    LEFT JOIN latest_club lc
      ON lc.player_id = pr.player_id
    LEFT JOIN warehouse.dim_clubs dc
      ON dc.club_id = lc.club_id
  `;

  const items = await sequelize.query(
    `
      ${latestClubCte()}
      SELECT
        pr.player_id AS "playerId",
        pr.name,
        pr.position,
        EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date))::int AS age,
        dp.nationality,
        dc.club_id AS "clubId",
        dc.club_name AS "clubName",
        dc.country AS "clubCountry",
        pr.market_value_eur AS "marketValueEur",
        pr.final_dss_score AS "finalDssScore",
        pr.smart_value_index AS "smartValueIndex",
        pr.recent_minutes_last_3_seasons AS "recentMinutesLast3Seasons"
      ${baseFromClause}
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}, pr.player_id ASC
      LIMIT :limit
      OFFSET :offset
    `,
    {
      replacements: {
        ...replacements,
        limit: filters.limit,
        offset: filters.offset,
      },
      type: QueryTypes.SELECT,
    }
  );

  const [countRow] = await sequelize.query(
    `
      ${latestClubCte()}
      SELECT COUNT(*)::int AS total
      ${baseFromClause}
      ${whereClause}
    `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  return {
    items,
    total: countRow.total,
  };
}

export async function getPlayerById(playerId) {
  const rows = await sequelize.query(
    `
      ${latestClubCte()}
      SELECT
        pr.player_id AS "playerId",
        pr.name,
        pr.position,
        EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date))::int AS age,
        dp.birth_date AS "birthDate",
        dp.nationality,
        dc.club_id AS "clubId",
        dc.club_name AS "clubName",
        dc.country AS "clubCountry",
        pr.market_value_eur AS "marketValueEur",
        pr.peak_market_value_eur AS "peakMarketValueEur",
        pr.latest_value_date AS "latestValueDate",
        pr.appearances_count AS "appearancesCount",
        pr.total_minutes AS "totalMinutes",
        pr.total_goals AS "totalGoals",
        pr.total_assists AS "totalAssists",
        pr.goal_contributions AS "goalContributions",
        pr.recent_minutes_last_season AS "recentMinutesLastSeason",
        pr.recent_minutes_last_3_seasons AS "recentMinutesLast3Seasons",
        pr.recent_minutes_last_5_seasons AS "recentMinutesLast5Seasons",
        pr.production_score AS "productionScore",
        pr.value_score AS "valueScore",
        pr.discipline_score AS "disciplineScore",
        pr.final_dss_score AS "finalDssScore",
        pr.smart_value_index AS "smartValueIndex"
      FROM mart.player_ranking pr
      LEFT JOIN warehouse.dim_players dp
        ON dp.player_id = pr.player_id
      LEFT JOIN latest_club lc
        ON lc.player_id = pr.player_id
      LEFT JOIN warehouse.dim_clubs dc
        ON dc.club_id = lc.club_id
      WHERE pr.player_id = :playerId
    `,
    {
      replacements: { playerId },
      type: QueryTypes.SELECT,
    }
  );

  return rows[0] ?? null;
}

function buildScoreExplanationContext(filters) {
  const windowConfig = EVIDENCE_WINDOWS[filters.evidenceWindow];
  const thresholdMinutes = RELIABILITY_THRESHOLDS[filters.evidenceWindow][filters.reliabilityLevel];

  return {
    windowConfig,
    thresholdMinutes,
  };
}

function toContribution(score, weight) {
  return Math.round(score * weight * 100) / 100;
}

function buildScoreExplanationResponse(row, filters, thresholdMinutes) {
  return {
    player: {
      playerId: row.playerId,
      name: row.name,
      position: row.position,
      age: row.age,
      birthDate: row.birthDate,
      nationality: row.nationality,
      clubId: row.clubId,
      clubName: row.clubName,
      clubCountry: row.clubCountry,
      marketValueEur: row.marketValueEur,
      peakMarketValueEur: row.peakMarketValueEur,
      latestValueDate: row.latestValueDate,
    },
    score: {
      finalDssScore: row.finalDssScore,
      productionScore: row.productionScore,
      valueScore: row.valueScore,
      disciplineScore: row.disciplineScore,
      reliabilityScoreLast3Seasons: row.reliabilityScoreLast3Seasons,
      smartValueIndex: row.smartValueIndex,
      smartValueIndexLast3Seasons: row.smartValueIndexLast3Seasons,
    },
    components: {
      production: {
        weight: 0.4,
        score: row.productionScore,
        contribution: toContribution(row.productionScore, 0.4),
      },
      value: {
        weight: 0.35,
        score: row.valueScore,
        contribution: toContribution(row.valueScore, 0.35),
      },
      reliability: {
        weight: 0.2,
        score: row.reliabilityScoreLast3Seasons,
        contribution: toContribution(row.reliabilityScoreLast3Seasons, 0.2),
        sourceWindow: "last_3_seasons",
      },
      discipline: {
        weight: 0.05,
        score: row.disciplineScore,
        contribution: toContribution(row.disciplineScore, 0.05),
      },
    },
    evidence: {
      selectedWindow: {
        evidenceWindow: filters.evidenceWindow,
        recentMinutes: row.selectedRecentMinutes,
        recentAppearances: row.selectedRecentAppearances,
        reliabilityScore: row.selectedReliabilityScore,
        smartValueIndex: row.selectedSmartValueIndex,
      },
      lastSeason: {
        recentMinutes: row.recentMinutesLastSeason,
        recentAppearances: row.recentAppearancesLastSeason,
      },
      last3Seasons: {
        recentMinutes: row.recentMinutesLast3Seasons,
        recentAppearances: row.recentAppearancesLast3Seasons,
        reliabilityScore: row.reliabilityScoreLast3Seasons,
        smartValueIndex: row.smartValueIndexLast3Seasons,
      },
      last5Seasons: {
        recentMinutes: row.recentMinutesLast5Seasons,
        recentAppearances: row.recentAppearancesLast5Seasons,
      },
    },
    reliability: {
      level: filters.reliabilityLevel,
      thresholdMinutes,
      meetsThreshold: row.selectedRecentMinutes >= thresholdMinutes,
      evidenceWindow: filters.evidenceWindow,
    },
    formula: {
      finalDssScore: "0.40 * productionScore + 0.35 * valueScore + 0.20 * reliabilityScoreLast3Seasons + 0.05 * disciplineScore",
      weights: {
        production: 0.4,
        value: 0.35,
        reliability: 0.2,
        discipline: 0.05,
      },
      reliabilityWindow: "last_3_seasons",
    },
  };
}

export async function getPlayerScoreExplanation(playerId, filters) {
  const { windowConfig, thresholdMinutes } = buildScoreExplanationContext(filters);

  const rows = await sequelize.query(
    `
      ${latestClubCte()}
      SELECT
        pr.player_id::int AS "playerId",
        pr.name,
        pr.position,
        EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date))::int AS age,
        dp.birth_date AS "birthDate",
        dp.nationality,
        dc.club_id::int AS "clubId",
        dc.club_name AS "clubName",
        dc.country AS "clubCountry",
        pr.market_value_eur::float8 AS "marketValueEur",
        pr.peak_market_value_eur::float8 AS "peakMarketValueEur",
        pr.latest_value_date AS "latestValueDate",
        pr.appearances_count::int AS "appearancesCount",
        pr.total_minutes::int AS "totalMinutes",
        pr.total_goals::int AS "totalGoals",
        pr.total_assists::int AS "totalAssists",
        pr.goal_contributions::int AS "goalContributions",
        pr.attacking_contribution_per_90::float8 AS "attackingContributionPer90",
        pr.discipline_risk_per_90::float8 AS "disciplineRiskPer90",
        pr.yellow_cards::int AS "yellowCards",
        pr.red_cards::int AS "redCards",
        pr.recent_minutes_last_season::int AS "recentMinutesLastSeason",
        pr.recent_appearances_last_season::int AS "recentAppearancesLastSeason",
        pr.recent_minutes_last_3_seasons::int AS "recentMinutesLast3Seasons",
        pr.recent_appearances_last_3_seasons::int AS "recentAppearancesLast3Seasons",
        pr.recent_minutes_last_5_seasons::int AS "recentMinutesLast5Seasons",
        pr.recent_appearances_last_5_seasons::int AS "recentAppearancesLast5Seasons",
        pr.production_score::float8 AS "productionScore",
        pr.value_score::float8 AS "valueScore",
        pr.discipline_score::float8 AS "disciplineScore",
        pr.reliability_score_last_3_seasons::float8 AS "reliabilityScoreLast3Seasons",
        pr.smart_value_index_last_3_seasons::float8 AS "smartValueIndexLast3Seasons",
        pr.final_dss_score::float8 AS "finalDssScore",
        pr.smart_value_index::float8 AS "smartValueIndex",
        pr.${windowConfig.recentMinutesColumn}::int AS "selectedRecentMinutes",
        pr.${windowConfig.recentAppearancesColumn}::int AS "selectedRecentAppearances",
        pr.${windowConfig.reliabilityScoreColumn}::float8 AS "selectedReliabilityScore",
        pr.${windowConfig.smartValueIndexColumn}::float8 AS "selectedSmartValueIndex"
      FROM mart.player_ranking pr
      LEFT JOIN warehouse.dim_players dp
        ON dp.player_id = pr.player_id
      LEFT JOIN latest_club lc
        ON lc.player_id = pr.player_id
      LEFT JOIN warehouse.dim_clubs dc
        ON dc.club_id = lc.club_id
      WHERE pr.player_id = :playerId
    `,
    {
      replacements: { playerId },
      type: QueryTypes.SELECT,
    }
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return buildScoreExplanationResponse(row, filters, thresholdMinutes);
}

function buildRecommendationQuery(filters, target) {
  const windowConfig = EVIDENCE_WINDOWS[filters.evidenceWindow];
  const conditions = [
    "pr.player_id <> :targetPlayerId",
    "pr.market_value_eur IS NOT NULL",
    "pr.market_value_eur > 0",
    "pr.position IS NOT NULL",
    "pr.position <> 'Goalkeeper'",
    `pr.${windowConfig.recentMinutesColumn} >= :thresholdMinutes`,
    "pr.market_value_eur < :targetMarketValue",
    "pr.market_value_eur <= :targetMarketValue * 0.75",
  ];

  const replacements = {
    targetPlayerId: target.playerId,
    targetMarketValue: Number(target.marketValueEur),
    thresholdMinutes: RELIABILITY_THRESHOLDS[filters.evidenceWindow][filters.reliabilityLevel],
  };

  if (filters.samePosition) {
    conditions.push("pr.position = :targetPosition");
    replacements.targetPosition = target.position;
  }

  if (filters.minAge) {
    conditions.push('EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date)) >= :minAge');
    replacements.minAge = filters.minAge;
  }

  if (filters.maxAge) {
    conditions.push('EXTRACT(YEAR FROM AGE(pr.latest_value_date, dp.birth_date)) <= :maxAge');
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

async function loadPlayerSummary(playerId, windowConfig) {
  const rows = await sequelize.query(
    `
      ${latestClubCte()}
      SELECT
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
        pr.${windowConfig.smartValueIndexColumn}::float8 AS "smartValueIndex"
      FROM mart.player_ranking pr
      LEFT JOIN warehouse.dim_players dp
        ON dp.player_id = pr.player_id
      LEFT JOIN latest_club lc
        ON lc.player_id = pr.player_id
      LEFT JOIN warehouse.dim_clubs dc
        ON dc.club_id = lc.club_id
      WHERE pr.player_id = :playerId
    `,
    {
      replacements: { playerId },
      type: QueryTypes.SELECT,
    }
  );

  return rows[0] ?? null;
}

async function loadCandidatePool(filters, target, windowConfig, whereClause, replacements) {
  return sequelize.query(
    `
      ${latestClubCte()}
      SELECT
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
        pr.${windowConfig.smartValueIndexColumn}::float8 AS "smartValueIndex"
      FROM mart.player_ranking pr
      LEFT JOIN warehouse.dim_players dp
        ON dp.player_id = pr.player_id
      LEFT JOIN latest_club lc
        ON lc.player_id = pr.player_id
      LEFT JOIN warehouse.dim_clubs dc
        ON dc.club_id = lc.club_id
      WHERE ${whereClause}
    `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );
}

export async function getSimilarAlternatives(playerId, filters) {
  const target = await loadPlayerSummary(playerId, EVIDENCE_WINDOWS[filters.evidenceWindow]);

  if (!target) {
    return null;
  }

  const { windowConfig, whereClause, replacements } = buildRecommendationQuery(filters, target);
  const candidates = await loadCandidatePool(filters, target, windowConfig, whereClause, replacements);

  if (candidates.length === 0) {
    return {
      target,
      alternatives: [],
      filters,
    };
  }

  const alternatives = rankSimilarAlternatives(target, candidates, filters);

  return {
    target,
    alternatives,
    filters,
  };
}
