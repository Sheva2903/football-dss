import { Sequelize } from "sequelize";
import env from "../config/env.js";

const sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
  host: env.dbHost,
  port: env.dbPort,
  dialect: "postgres",
  logging: false,
  dialectOptions: env.dbSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: env.dbSslRejectUnauthorized,
        },
      }
    : undefined,
});

export default sequelize;
