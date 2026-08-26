import swaggerAutoGen from "swagger-autogen";

const doc = {
  info: {
    title: "Medidoc API",
    description: "Medidoc API",
    version: "1.0.0"
  },
  host: "localhost:4000/api/v1",
  schemes: ["http"]
};

const outputFile = "./src/docs/swagger.json";
const endpointsFiles = ["./src/routes/*.ts"];

swaggerAutoGen(outputFile, endpointsFiles, doc);
