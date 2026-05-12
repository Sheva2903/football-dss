DROP TABLE IF EXISTS mart.player_features;

CREATE TABLE mart.player_features AS
WITH season_order AS (
    SELECT DISTINCT season AS season_year
    FROM warehouse.fact_matches
    WHERE season IS NOT NULL
),
season_rank AS (
    SELECT
        season_year,
        DENSE_RANK() OVER (ORDER BY season_year DESC) AS season_rank
    FROM season_order
),
performance_base AS (
    SELECT
        p.player_id,
        p.name,
        p.position,
        COUNT(*) AS appearances_count,
        SUM(fpp.minutes_played) AS total_minutes,
        SUM(fpp.goals) AS total_goals,
        SUM(fpp.assists) AS total_assists,
        SUM(fpp.yellow_cards) AS yellow_cards,
        SUM(fpp.red_cards) AS red_cards
    FROM warehouse.dim_players p
    JOIN warehouse.fact_player_performance fpp ON p.player_id = fpp.player_id
    GROUP BY p.player_id, p.name, p.position
),
performance_features AS (
    SELECT
        player_id,
        name,
        position,
        appearances_count,
        total_minutes,
        total_goals,
        total_assists,
        total_goals + total_assists AS goal_contributions,
        yellow_cards,
        red_cards,
        ROUND(total_minutes::NUMERIC / NULLIF(appearances_count, 0), 1) AS minutes_per_appearance,
        ROUND(((total_goals + total_assists)::NUMERIC * 90) / NULLIF(total_minutes, 0), 3) AS attacking_contribution_per_90,
        ROUND(((yellow_cards + (red_cards * 3))::NUMERIC * 90) / NULLIF(total_minutes, 0), 3) AS discipline_risk_per_90
    FROM performance_base
),
recent_window_features AS (
    SELECT
        fpp.player_id,
        COALESCE(SUM(CASE WHEN sr.season_rank <= 1 THEN fpp.minutes_played ELSE 0 END), 0) AS recent_minutes_last_season,
        COALESCE(COUNT(*) FILTER (WHERE sr.season_rank <= 1), 0) AS recent_appearances_last_season,
        COALESCE(SUM(CASE WHEN sr.season_rank <= 3 THEN fpp.minutes_played ELSE 0 END), 0) AS recent_minutes_last_3_seasons,
        COALESCE(COUNT(*) FILTER (WHERE sr.season_rank <= 3), 0) AS recent_appearances_last_3_seasons,
        COALESCE(SUM(CASE WHEN sr.season_rank <= 5 THEN fpp.minutes_played ELSE 0 END), 0) AS recent_minutes_last_5_seasons,
        COALESCE(COUNT(*) FILTER (WHERE sr.season_rank <= 5), 0) AS recent_appearances_last_5_seasons
    FROM warehouse.fact_player_performance fpp
    JOIN warehouse.fact_matches fm
        ON fpp.match_id = fm.match_id
    JOIN season_rank sr
        ON sr.season_year = fm.season
    GROUP BY fpp.player_id
),
latest_valuations AS (
    SELECT player_id, market_value_eur, date_id AS latest_value_date
    FROM (
        SELECT
            player_id,
            market_value_eur,
            date_id,
            ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY date_id DESC) AS rn
        FROM warehouse.fact_player_valuations
        WHERE market_value_eur IS NOT NULL
    ) ranked_values
    WHERE rn = 1
),
peak_valuations AS (
    SELECT
        player_id,
        MAX(market_value_eur) AS peak_market_value_eur
    FROM warehouse.fact_player_valuations
    WHERE market_value_eur IS NOT NULL
    GROUP BY player_id
)
SELECT
    pf.player_id,
    pf.name,
    pf.position,
    pf.appearances_count,
    pf.total_minutes,
    pf.minutes_per_appearance,
    pf.total_goals,
    pf.total_assists,
    pf.goal_contributions,
    pf.attacking_contribution_per_90,
    pf.yellow_cards,
    pf.red_cards,
    pf.discipline_risk_per_90,
    COALESCE(rwf.recent_minutes_last_season, 0) AS recent_minutes_last_season,
    COALESCE(rwf.recent_appearances_last_season, 0) AS recent_appearances_last_season,
    COALESCE(rwf.recent_minutes_last_3_seasons, 0) AS recent_minutes_last_3_seasons,
    COALESCE(rwf.recent_appearances_last_3_seasons, 0) AS recent_appearances_last_3_seasons,
    COALESCE(rwf.recent_minutes_last_5_seasons, 0) AS recent_minutes_last_5_seasons,
    COALESCE(rwf.recent_appearances_last_5_seasons, 0) AS recent_appearances_last_5_seasons,
    lv.market_value_eur,
    pv.peak_market_value_eur,
    lv.latest_value_date,
    ROUND(
        pf.attacking_contribution_per_90 /
        NULLIF(GREATEST(lv.market_value_eur, 250000)::NUMERIC / 10000000.0, 0),
        3
    ) AS value_efficiency_index,
    ROUND(lv.market_value_eur / NULLIF(pv.peak_market_value_eur, 0), 3) AS value_retention_ratio
FROM performance_features pf
LEFT JOIN recent_window_features rwf ON pf.player_id = rwf.player_id
LEFT JOIN latest_valuations lv ON pf.player_id = lv.player_id
LEFT JOIN peak_valuations pv ON pf.player_id = pv.player_id;
