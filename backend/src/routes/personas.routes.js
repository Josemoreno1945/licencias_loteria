import { Router } from "express";

import {
  get_c_personas,
  get_c_personas_id,
  crear_c_personas,
  actualizar_personas,
} from "../controllers/personas.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";
import { validateUuidParam } from "../middlewares/uuidValidator.js";

const router = Router();

router.param("id", validateUuidParam);

router.get("/personas", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_personas);

router.get("/personas/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_personas_id);

router.post("/personas", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_personas);

router.put("/personas/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_personas);

export default router;
