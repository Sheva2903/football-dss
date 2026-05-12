DROP TABLE IF EXISTS mart.player_ranking;

CREATE TABLE mart.player_ranking AS
WITH recent_cutoff AS (
    SELECT MAX(date_id) - INTERVAL '730 days' AS cutoff_date
    FROM warehouse.fact_player_valuations
),
eligible_players AS (
    SELECT *
    FROM mart.player_features, recent_cutoff
    WHERE appearances_count >= 10
      AND total_minutes >= 900
      AND market_value_eur IS NOT NULL
      AND attacking_contribution_per_90 IS NOT NULL
      AND latest_value_date >= cutoff_date
      AND position IS NOT NULL
      AND position <> 'Goalkeeper'
),
scored_players_base AS (
    SELECT
        player_id,
        name,
        position,
        appearances_count,
        total_minutes,
        minutes_per_appearance,
        total_goals,
        total_assists,
        goal_contributions,
        attacking_contribution_per_90,
        yellow_cards,
        red_cards,
        discipline_risk_per_90,
        recent_minutes_last_season,
        recent_appearances_last_season,
        recent_minutes_last_3_seasons,
        recent_appearances_last_3_seasons,
        recent_minutes_last_5_seasons,
        recent_appearances_last_5_seasons,
        market_value_eur,
        peak_market_value_eur,
        latest_value_date,
        value_efficiency_index,
        value_retention_ratio,
        ROUND((PERCENT_RANK() OVER (ORDER BY attacking_contribution_per_90, goal_contributions) * 100)::NUMERIC, 2) AS production_score,
        ROUND((PERCENT_RANK() OVER (ORDER BY value_efficiency_index, value_retention_ratio) * 100)::NUMERIC, 2) AS value_score,
        ROUND(((1 - PERCENT_RANK() OVER (ORDER BY discipline_risk_per_90, yellow_cards, red_cards)) * 100)::NUMERIC, 2) AS discipline_score,
        ROUND((PERCENT_RANK() OVER (ORDER BY recent_minutes_last_season, recent_appearances_last_season) * 100)::NUMERIC, 2) AS reliability_score_last_season,
        ROUND((PERCENT_RANK() OVER (ORDER BY recent_minutes_last_3_seasons, recent_appearances_last_3_seasons) * 100)::NUMERIC, 2) AS reliability_score_last_3_seasons,
        ROUND((PERCENT_RANK() OVER (ORDER BY recent_minutes_last_5_seasons, recent_appearances_last_5_seasons) * 100)::NUMERIC, 2) AS reliability_score_last_5_seasons
    FROM eligible_players
),
scored_players AS (
    SELECT
        scored_players_base.*,
        ROUND((production_score * 0.40) + (value_score * 0.35) + (reliability_score_last_season * 0.20) + (discipline_score * 0.05), 2) AS smart_value_index_last_season,
        ROUND((production_score * 0.40) + (value_score * 0.35) + (reliability_score_last_3_seasons * 0.20) + (discipline_score * 0.05), 2) AS smart_value_index_last_3_seasons,
        ROUND((production_score * 0.40) + (value_score * 0.35) + (reliability_score_last_5_seasons * 0.20) + (discipline_score * 0.05), 2) AS smart_value_index_last_5_seasons,
        ROUND((production_score * 0.40) + (value_score * 0.35) + (reliability_score_last_3_seasons * 0.20) + (discipline_score * 0.05), 2) AS final_dss_score,
        ROUND((production_score * 0.40) + (value_score * 0.35) + (reliability_score_last_3_seasons * 0.20) + (discipline_score * 0.05), 2) AS smart_value_index
    FROM scored_players_base
)
SELECT *
FROM scored_players
ORDER BY final_dss_score DESC, total_minutes DESC, goal_contributions DESC;
