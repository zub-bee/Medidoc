import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import env from "../configs/env";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const swaggerDocument = require("../docs/swagger.json");

export const setupSwagger = (app: Express) => {
  if (env.NODE_ENV !== "development") return;

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
