import logger from "../config/logger.js";

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  logger.error(
    {
      err: error,
      method: request.method,
      path: request.originalUrl,
      statusCode,
    },
    "Request failed"
  );

  response.status(statusCode).json({
    message,
  });
}
