import swaggerAutogen from 'swagger-autogen';

const swagger = swaggerAutogen();

const doc = {
  info: {
    title: "Crypto Buzz platform API",
    description: "It's backend for an online Trading analysis .",
  },
  host: "localhost:8000",
};

const outputFile = "./swagger.json";
const routes = ["./src/app.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swagger(outputFile, routes, doc);