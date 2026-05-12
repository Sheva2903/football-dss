import pool from "../../src/db/pool.js";
import sequelize from "../../src/db/sequelize.js";
import logger from "../../src/config/logger.js";
import { refreshWarehouse } from "../etl/refresh-warehouse.js";
import { refreshMart } from "../mart/refresh-mart.js";

async function refreshAll() {
  logger.info({ script: "pipeline-refresh" }, "Starting full pipeline refresh");
  await refreshWarehouse();
  await refreshMart();
  logger.info({ script: "pipeline-refresh" }, "Full pipeline refresh completed successfully");
}

refreshAll()
  .catch((error) => {
    logger.error({ err: error }, "Full pipeline refresh failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
    await sequelize.close();
  });
