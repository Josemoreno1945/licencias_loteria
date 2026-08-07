import { Router } from "express";

import {
  buscar_c_personas_ci_rif,
  get_c_detalle_persona,
} from "../controllers/buscador.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Búsqueda de personas por ci_rif (query param: ?ci_rif=...)
router.get("/buscador", buscar_c_personas_ci_rif);

// Detalle completo de una persona por id_persona
router.get("/buscador/:id", get_c_detalle_persona);

export default router;
