import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { swaggerDocument } from "./src/docs/openapi";

const outputFile = resolve(process.cwd(), "src/docs/swagger.json");
mkdirSync(dirname(outputFile), { recursive: true });

writeFileSync(outputFile, JSON.stringify(swaggerDocument, null, 2));
console.info(`OpenAPI spec generated at ${outputFile}`);
