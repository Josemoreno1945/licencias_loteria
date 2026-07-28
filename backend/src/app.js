import express from "express";
import cors from "cors";
import morgan from "morgan";

import usuarios_rutas from "./routes/usuarios.routes.js";
import comercializadores_rutas from "./routes/comercializadores.routes.js";
import personas_rutas from "./routes/personas.routes.js"

import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use(usuarios_rutas);
app.use(comercializadores_rutas);
app.use(personas_rutas);

// Manejador de errores
app.use(errorHandler);

export default app;
