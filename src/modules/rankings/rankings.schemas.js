import { z } from "zod";

export const rankingsQuerySchema = z
  .object({
    evidenceWindow: z
      .enum(["last_season", "last_3_seasons", "last_5_seasons"])
      .default("last_3_seasons"),
    reliabilityLevel: z.enum(["Low", "Medium", "High"]).default("Medium"),
    position: z.string().min(1).optional(),
    clubId: z.coerce.number().int().positive().optional(),
    minAge: z.coerce.number().int().positive().optional(),
    maxAge: z.coerce.number().int().positive().optional(),
    maxBudget: z.coerce.number().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
    sortBy: z.enum(["name", "marketValueEur", "finalDssScore"]).default("finalDssScore"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine((value) => value.minAge === undefined || value.maxAge === undefined || value.minAge <= value.maxAge, {
    message: "minAge must be less than or equal to maxAge",
    path: ["minAge"],
  });
