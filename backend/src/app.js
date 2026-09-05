import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import auth_rutas from "./routes/auth.routes.js";
import usuarios_rutas from "./routes/usuarios.routes.js";
import comercializadores_rutas from "./routes/comercializadores.routes.js";
import personas_rutas from "./routes/personas.routes.js";
import bancos_rutas from "./routes/bancos.routes.js";

import comercializadores_representantes_rutas from "./routes/comercializadores_representantes.routes.js";
import centros_apuesta_rutas from "./routes/centros_apuesta.routes.js";
import juegos_rutas from "./routes/juegos.routes.js";
import permisos_juego_rutas from "./routes/permisos_juego.routes.js";
import solicitudes_rutas from "./routes/solicitudes.routes.js";
import documentos_emitidos_rutas from "./routes/documentos_emitidos.routes.js";
import documento_juegos_rutas from "./routes/documento_juegos.routes.js";
import licencias_rutas from "./routes/licencias.routes.js";
import autorizaciones_especiales_rutas from "./routes/autorizaciones_especiales.routes.js";
import participaciones_rutas from "./routes/participaciones.routes.js";
import pagos_rutas from "./routes/pagos.routes.js";
import buscador_rutas from "./routes/buscador.routes.js";
import dashboard_rutas from "./routes/dashboard.routes.js";
import auditoria_rutas from "./routes/auditoria.routes.js";

import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Seguridad: helmet primero para que sus headers se apliquen a todas las respuestas
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));

// Rutas
app.use(auth_rutas);
app.use(usuarios_rutas);
app.use(comercializadores_rutas);
app.use(personas_rutas);
app.use(bancos_rutas);

app.use(comercializadores_representantes_rutas);
app.use(centros_apuesta_rutas);
app.use(juegos_rutas);
app.use(permisos_juego_rutas);
app.use(solicitudes_rutas);
app.use(documentos_emitidos_rutas);
app.use(documento_juegos_rutas);
app.use(licencias_rutas);
app.use(autorizaciones_especiales_rutas);
app.use(participaciones_rutas);
app.use(pagos_rutas);
app.use(buscador_rutas);
app.use(dashboard_rutas);
app.use(auditoria_rutas);

// Manejador de errores
app.use(errorHandler);

export default app;
