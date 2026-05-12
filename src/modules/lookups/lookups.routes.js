import express from "express";
import { listClubs, listPositions } from "./lookups.repository.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/clubs:
 *   get:
 *     summary: List clubs for lookup filters
 *     tags:
 *       - Lookups
 *     responses:
 *       200:
 *         description: Clubs returned successfully
 */
router.get("/clubs", async (request, response, next) => {
  try {
    const items = await listClubs();

    response.json({ items });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/lookups/positions:
 *   get:
 *     summary: List rankable player positions
 *     tags:
 *       - Lookups
 *     responses:
 *       200:
 *         description: Positions returned successfully
 */
router.get("/lookups/positions", async (request, response, next) => {
  try {
    const items = await listPositions();

    response.json({ items });
  } catch (error) {
    next(error);
  }
});

export default router;
