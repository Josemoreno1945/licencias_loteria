import { Router } from "express";

import {
  get_c_documento_juegos,
  get_c_documento_juegos_id,
  crear_c_documento_juego,
  eliminar_c_documento_juego,
  buscar_c_juegos_por_documento,
  buscar_c_documentos_por_juego,
} from "../controllers/documento_juegos.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/documento-juegos", get_c_documento_juegos);

router.get("/documento-juegos/por-documento/:id", buscar_c_juegos_por_documento);

router.get("/documento-juegos/por-juego/:id", buscar_c_documentos_por_juego);

router.get("/documento-juegos/:id", get_c_documento_juegos_id);

router.post("/documento-juegos", crear_c_documento_juego);

router.delete("/documento-juegos/:id", eliminar_c_documento_juego);

export default router;
