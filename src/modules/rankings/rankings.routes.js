import express from "express";
import { listRankings, getDefaultShortlistQuery } from "./rankings.repository.js";
import { rankingsQuerySchema } from "./rankings.schemas.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/rankings:
 *   get:
 *     summary: List ranked DSS candidates
 *     tags:
 *       - Rankings
 */
router.get("/rankings", async (request, response, next) => {
  try {
    const parsed = rankingsQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Invalid query parameters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { items, total } = await listRankings(parsed.data);

    response.json({
      items,
      pagination: {
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        total,
      },
      filters: {
        evidenceWindow: parsed.data.evidenceWindow,
        reliabilityLevel: parsed.data.reliabilityLevel,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/shortlists:
 *   get:
 *     summary: Get recruiting shortlists
 *     tags:
 *       - Rankings
 */
router.get("/shortlists", async (request, response, next) => {
  try {
    const parsed = rankingsQuerySchema.safeParse(getDefaultShortlistQuery(request.query));

    if (!parsed.success) {
      return response.status(400).json({
        message: "Invalid query parameters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { items, total } = await listRankings(parsed.data);

    response.json({
      items,
      pagination: {
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        total,
      },
      filters: {
        evidenceWindow: parsed.data.evidenceWindow,
        reliabilityLevel: parsed.data.reliabilityLevel,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
