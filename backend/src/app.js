import express from "express";
import cors from "cors";
import morgan from "morgan";

import personas_routes from "./routes/personas.routes.js";
import comercializadores_routes from "./routes/comercializadores.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use(personas_routes);
app.use(comercializadores_routes);

// Manejador de errores
app.use(errorHandler);

export default app;
