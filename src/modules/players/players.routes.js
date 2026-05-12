import express from "express";
import {
  getPlayerById,
  getPlayerScoreExplanation,
  getSimilarAlternatives,
  listPlayers,
} from "./players.repository.js";
import {
  listPlayersQuerySchema,
  playerIdParamsSchema,
  scoreExplanationQuerySchema,
  similarAlternativesQuerySchema,
} from "./players.schemas.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/players:
 *   get:
 *     summary: List ranked players
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *       - in: query
 *         name: clubId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minMarketValue
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxMarketValue
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, marketValueEur, finalDssScore]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Players returned successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get("/players", async (request, response, next) => {
  try {
    const parsed = listPlayersQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Invalid query parameters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { items, total } = await listPlayers(parsed.data);

    response.json({
      items,
      pagination: {
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/players/{id}:
 *   get:
 *     summary: Get player detail
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player returned successfully
 *       400:
 *         description: Invalid player id
 *       404:
 *         description: Player not found
 */
router.get("/players/:id", async (request, response, next) => {
  try {
    const parsed = playerIdParamsSchema.safeParse(request.params);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Invalid player id",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const player = await getPlayerById(parsed.data.id);

    if (!player) {
      return response.status(404).json({
        message: "Player not found",
      });
    }

    response.json({ item: player });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/players/{id}/score-explanation:
 *   get:
 *     summary: Explain a player's DSS score
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: evidenceWindow
 *         schema:
 *           type: string
 *           enum: [last_season, last_3_seasons, last_5_seasons]
 *           default: last_3_seasons
 *       - in: query
 *         name: reliabilityLevel
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *           default: Medium
 *     responses:
 *       200:
 *         description: Score explanation returned successfully
 *       400:
 *         description: Invalid player id or query parameters
 *       404:
 *         description: Player not found
 */
router.get("/players/:id/score-explanation", async (request, response, next) => {
  try {
    const parsedParams = playerIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      return response.status(400).json({
        message: "Invalid player id",
        errors: parsedParams.error.flatten().fieldErrors,
      });
    }

    const parsedQuery = scoreExplanationQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return response.status(400).json({
        message: "Invalid query parameters",
        errors: parsedQuery.error.flatten().fieldErrors,
      });
    }

    const explanation = await getPlayerScoreExplanation(parsedParams.data.id, parsedQuery.data);

    if (!explanation) {
      return response.status(404).json({
        message: "Player not found",
      });
    }

    response.json({ item: explanation });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/players/{id}/similar-alternatives:
 *   get:
 *     summary: Find similar cheaper alternatives for a player
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: evidenceWindow
 *         schema:
 *           type: string
 *           enum: [last_season, last_3_seasons, last_5_seasons]
 *           default: last_3_seasons
 *       - in: query
 *         name: reliabilityLevel
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *           default: Medium
 *     responses:
 *       200:
 *         description: Similar alternatives returned successfully
 *       400:
 *         description: Invalid recommendation input
 *       404:
 *         description: Target player not found
 */
router.get("/players/:id/similar-alternatives", async (request, response, next) => {
  try {
    const parsedParams = playerIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      return response.status(400).json({
        message: "Invalid player id",
        errors: parsedParams.error.flatten().fieldErrors,
      });
    }

    const parsedQuery = similarAlternativesQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return response.status(400).json({
        message: "Invalid query parameters",
        errors: parsedQuery.error.flatten().fieldErrors,
      });
    }

    const result = await getSimilarAlternatives(parsedParams.data.id, parsedQuery.data);

    if (!result) {
      return response.status(404).json({
        message: "Player not found",
      });
    }

    response.json({
      item: result.target,
      filters: result.filters,
      alternatives: result.alternatives,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
