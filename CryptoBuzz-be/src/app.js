import express from "express";
import cors from "cors";
import AppRoutes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const swaggerDocument = require("../swagger.json");

const app = express();

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
// app.options("*", cors());

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header( 
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
app.use("/assets", express.static("public"));
app.use("/video", express.static("./src/uploads/videos"));
// Serve static files
app.use(express.static("public"));

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCssUrl: CSS_URL }));

app.use("/api", AppRoutes);

export { app };
