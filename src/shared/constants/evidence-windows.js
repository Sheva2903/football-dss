export const EVIDENCE_WINDOWS = {
  last_season: {
    label: "Last season",
    recentMinutesColumn: "recent_minutes_last_season",
    recentAppearancesColumn: "recent_appearances_last_season",
    reliabilityScoreColumn: "reliability_score_last_season",
    smartValueIndexColumn: "smart_value_index_last_season",
  },
  last_3_seasons: {
    label: "Last 3 seasons",
    recentMinutesColumn: "recent_minutes_last_3_seasons",
    recentAppearancesColumn: "recent_appearances_last_3_seasons",
    reliabilityScoreColumn: "reliability_score_last_3_seasons",
    smartValueIndexColumn: "smart_value_index_last_3_seasons",
  },
  last_5_seasons: {
    label: "Last 5 seasons",
    recentMinutesColumn: "recent_minutes_last_5_seasons",
    recentAppearancesColumn: "recent_appearances_last_5_seasons",
    reliabilityScoreColumn: "reliability_score_last_5_seasons",
    smartValueIndexColumn: "smart_value_index_last_5_seasons",
  },
};

export const RELIABILITY_LEVELS = ["Low", "Medium", "High"];
export const DEFAULT_EVIDENCE_WINDOW = "last_3_seasons";
export const DEFAULT_RELIABILITY_LEVEL = "Medium";

export const RELIABILITY_THRESHOLDS = {
  last_season: {
    Low: 300,
    Medium: 900,
    High: 1800,
  },
  last_3_seasons: {
    Low: 900,
    Medium: 1800,
    High: 3600,
  },
  last_5_seasons: {
    Low: 1500,
    Medium: 3000,
    High: 6000,
  },
};
