import { Router } from "express";

import {
  get_c_documento_juegos,
  get_c_documento_juegos_id,
  crear_c_documento_juego,
  eliminar_c_documento_juego,
  buscar_c_juegos_por_documento,
  buscar_c_documentos_por_juego,
} from "../controllers/documento_juegos.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";
import { validateUuidParam } from "../middlewares/uuidValidator.js";

const router = Router();

router.param("id", validateUuidParam);

router.get("/documento-juegos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_documento_juegos);

router.get("/documento-juegos/por-documento/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_juegos_por_documento);

router.get("/documento-juegos/por-juego/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_documentos_por_juego);

router.get("/documento-juegos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_documento_juegos_id);

router.post("/documento-juegos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_documento_juego);

router.delete("/documento-juegos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_documento_juego);

export default router;
