import swaggerJSDoc from "swagger-jsdoc";

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Football DSS Backend API",
      version: "1.0.0",
      description: "Foundation API for the football DSS backend rebuild.",
    },
  },
  apis: ["./src/modules/**/*.routes.js"],
});

export default swaggerSpec;
