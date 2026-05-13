import env from "../src/config/env.js";

const sharedConfig = {
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  host: env.dbHost,
  port: env.dbPort,
  dialect: "postgres",
  dialectOptions: env.dbSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: env.dbSslRejectUnauthorized,
        },
      }
    : undefined,
  migrationStorage: "sequelize",
  migrationStorageTableName: "sequelize_meta",
  seederStorage: "sequelize",
  seederStorageTableName: "sequelize_data",
  logging: false,
};

export default {
  development: sharedConfig,
  test: {
    ...sharedConfig,
    database: process.env.DB_NAME_TEST || `${env.dbName}_test`,
  },
  production: sharedConfig,
};
