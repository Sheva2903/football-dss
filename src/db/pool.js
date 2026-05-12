import pg from "pg";
import env from "../config/env.js";

const { Pool } = pg;

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
});

export default pool;