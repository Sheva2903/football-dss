import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import apiV1Router from "./routes/api-v1.js";
import swaggerSpec from "./config/swagger.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", apiV1Router);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
