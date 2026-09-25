import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import env from "../configs/env";

const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerDocument = JSON.parse(
  readFileSync(join(__dirname, "../docs/swagger.json"), "utf-8")
);

export const setupSwagger = (app: Express) => {
  if (env.NODE_ENV !== "development") return;

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
