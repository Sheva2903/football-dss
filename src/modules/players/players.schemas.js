import { z } from "zod";
import {
  DEFAULT_EVIDENCE_WINDOW,
  DEFAULT_RELIABILITY_LEVEL,
  RELIABILITY_LEVELS,
} from "../../shared/constants/evidence-windows.js";

export const playerIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const scoreExplanationQuerySchema = z.object({
  evidenceWindow: z
    .enum(["last_season", "last_3_seasons", "last_5_seasons"])
    .default(DEFAULT_EVIDENCE_WINDOW),
  reliabilityLevel: z.enum(RELIABILITY_LEVELS).default(DEFAULT_RELIABILITY_LEVEL),
});

export const similarAlternativesQuerySchema = z
  .object({
    evidenceWindow: z
      .enum(["last_season", "last_3_seasons", "last_5_seasons"])
      .default(DEFAULT_EVIDENCE_WINDOW),
    reliabilityLevel: z.enum(RELIABILITY_LEVELS).default(DEFAULT_RELIABILITY_LEVEL),
    samePosition: z
      .preprocess((value) => {
        if (typeof value === "string") {
          return value !== "false";
        }

        return value;
      }, z.boolean())
      .default(true),
    minAge: z.coerce.number().int().positive().optional(),
    maxAge: z.coerce.number().int().positive().optional(),
    maxBudget: z.coerce.number().positive().optional(),
    minSimilarity: z.coerce.number().min(0).max(100).default(0),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .refine((value) => value.minAge === undefined || value.maxAge === undefined || value.minAge <= value.maxAge, {
    message: "minAge must be less than or equal to maxAge",
    path: ["minAge"],
  });

export const listPlayersQuerySchema = z
  .object({
    position: z.string().min(1).optional(),
    clubId: z.coerce.number().int().positive().optional(),
    minAge: z.coerce.number().int().positive().optional(),
    maxAge: z.coerce.number().int().positive().optional(),
    minMarketValue: z.coerce.number().nonnegative().optional(),
    maxMarketValue: z.coerce.number().nonnegative().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
    sortBy: z.enum(["name", "marketValueEur", "finalDssScore"]).default("finalDssScore"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine((value) => value.minAge === undefined || value.maxAge === undefined || value.minAge <= value.maxAge, {
    message: "minAge must be less than or equal to maxAge",
    path: ["minAge"],
  })
  .refine(
    (value) =>
      value.minMarketValue === undefined ||
      value.maxMarketValue === undefined ||
      value.minMarketValue <= value.maxMarketValue,
    {
      message: "minMarketValue must be less than or equal to maxMarketValue",
      path: ["minMarketValue"],
    }
  );
