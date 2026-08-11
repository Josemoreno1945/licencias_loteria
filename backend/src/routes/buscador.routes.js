import { Router } from "express";

import {
  buscar_c_personas_ci_rif,
  get_c_detalle_persona,
} from "../controllers/buscador.controllers.js";

import { verifyToken, hasRole } from "../middlewares/auth.js";

const router = Router();

router.get("/buscador", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_personas_ci_rif);

router.get("/buscador/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_detalle_persona);

export default router;
