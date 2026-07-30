import express from "express";
import cors from "cors";
import morgan from "morgan";

import auth_rutas from "./routes/auth.routes.js";
import usuarios_rutas from "./routes/usuarios.routes.js";
import comercializadores_rutas from "./routes/comercializadores.routes.js";
import personas_rutas from "./routes/personas.routes.js";
import bancos_rutas from "./routes/bancos.routes.js";
import operadoras_rutas from "./routes/operadoras.routes.js";
import comercializadores_representantes_rutas from "./routes/comercializadores_representantes.routes.js";
import centros_apuesta_rutas from "./routes/centros_apuesta.routes.js";
import juegos_rutas from "./routes/juegos.routes.js";

import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use(auth_rutas);
app.use(usuarios_rutas);
app.use(comercializadores_rutas);
app.use(personas_rutas);
app.use(bancos_rutas);
app.use(operadoras_rutas);
app.use(comercializadores_representantes_rutas);
app.use(centros_apuesta_rutas);
app.use(juegos_rutas);

// Manejador de errores
app.use(errorHandler);

export default app;
