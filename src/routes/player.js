import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { position, maxAge, minMarketValue, maxMarketValue, clubId, minMinutesPlayed } = req.query;

  const conditions = [];
  const values = [];

  if (position) {
    values.push(position);
    conditions.push(`p.primary_position = $${values.length}`);
  }

  if (maxAge) {
    const parsedMaxAge = Number(maxAge);

    if (!Number.isFinite(parsedMaxAge)) {
      return res.status(400).json({ message: "maxAge must be a number" });
    }

    values.push(parsedMaxAge);
    conditions.push(`p.age <= $${values.length}`);
  }

  if (minMarketValue) {
    const parsedMinMarketValue = Number(minMarketValue);

    if (!Number.isFinite(parsedMinMarketValue)) {
      return res.status(400).json({ message: "minMarketValue must be a number" });
    }

    values.push(parsedMinMarketValue);
    conditions.push(`p.market_value_eur >= $${values.length}`);
  }

  if (maxMarketValue) {
    const parsedMaxMarketValue = Number(maxMarketValue);

    if (!Number.isFinite(parsedMaxMarketValue)) {
      return res.status(400).json({ message: "maxMarketValue must be a number" });
    }

    values.push(parsedMaxMarketValue);
    conditions.push(`p.market_value_eur <= $${values.length}`);
  }

  if (clubId) {
    const parsedClubId = Number(clubId);

    if (!Number.isInteger(parsedClubId) || parsedClubId <= 0) {
      return res.status(400).json({ message: "clubId must be a positive integer" });
    }

    values.push(parsedClubId);
    conditions.push(`p.club_id = $${values.length}`);
  }

  if (minMinutesPlayed) {
    const parsedMinMinutesPlayed = Number(minMinutesPlayed);

    if (!Number.isFinite(parsedMinMinutesPlayed)) {
      return res.status(400).json({ message: "minMinutesPlayed must be a number" });
    }

    values.push(parsedMinMinutesPlayed);
    conditions.push(`s.minutes_played >= $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.nationality,
        p.age,
        p.primary_position,
        p.market_value_eur,
        c.id AS club_id,
        c.name AS club_name,
        c.country AS club_country,
        c.league_name,
        s.season,
        s.minutes_played,
        s.appearances,
        s.goals,
        s.assists,
        s.progressive_passes,
        s.tackles,
        s.interceptions
      FROM players p
      JOIN clubs c ON c.id = p.club_id
      JOIN player_stats s ON s.player_id = p.id
      ${whereClause}
      ORDER BY p.market_value_eur DESC, p.id ASC
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch players",
      error: error.message,
    });
  }
});

router.get('/:id', async(req, res) => {
  const playerId = Number(req.params.id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return res.status(400).json({message: 'Invalid player id'});
  }

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.nationality,
        p.age,
        p.primary_position,
        p.market_value_eur,
        c.id AS club_id,
        c.name AS club_name,
        c.country AS club_country,
        c.league_name,
        s.season,
        s.minutes_played,
        s.appearances,
        s.goals,
        s.assists,
        s.progressive_passes,
        s.tackles,
        s.interceptions
      FROM players p
      JOIN clubs c ON c.id = p.club_id
      JOIN player_stats s ON s.player_id = p.id
      WHERE p.id = $1
      `,
      [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch player",
      error: error.message,
    });
  }
});

export default router;