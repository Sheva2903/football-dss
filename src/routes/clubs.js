import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get('/', async(req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT name, country, league_name
      FROM clubs
      ORDER BY name ASC;
      `
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch clubs",
      error: error.message
    });
  }
});

export default router;