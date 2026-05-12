import express from "express";
import healthRouter from "../modules/health/health.routes.js";
import lookupsRouter from "../modules/lookups/lookups.routes.js";
import playersRouter from "../modules/players/players.routes.js";
import rankingsRouter from "../modules/rankings/rankings.routes.js";

const router = express.Router();

router.use(healthRouter);
router.use(lookupsRouter);
router.use(playersRouter);
router.use(rankingsRouter);

export default router;
