import express from "express";
import sequelize from "../../db/sequelize.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Check API and database health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API and database are reachable
 */
router.get("/health", async (request, response, next) => {
  try {
    const [rows] = await sequelize.query("SELECT NOW() AS now");

    response.json({
      status: "ok",
      database: "connected",
      now: rows[0].now,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
