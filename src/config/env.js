import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive(),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  CSV_DIR: z.string().min(1).default("data/source"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`
  );
}

const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  dbHost: parsedEnv.data.DB_HOST,
  dbPort: parsedEnv.data.DB_PORT,
  dbName: parsedEnv.data.DB_NAME,
  dbUser: parsedEnv.data.DB_USER,
  dbPassword: parsedEnv.data.DB_PASSWORD,
  csvDir: parsedEnv.data.CSV_DIR,
  logLevel: parsedEnv.data.LOG_LEVEL,
};

export default env;
