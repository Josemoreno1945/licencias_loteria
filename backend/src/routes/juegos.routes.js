import { Router } from "express";

import {
  get_c_juegos,
  get_c_juegos_activas,
  get_c_juegos_inactivos,
  get_c_juegos_id,
  crear_c_juegos,
  actualizar_juegos,
  eliminar_c_juegos,
} from "../controllers/juegos.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";
import { validateUuidParam } from "../middlewares/uuidValidator.js";

const router = Router();

router.param("id", validateUuidParam);

router.get("/juegos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_juegos);

// Endpoint canónico de juegos activos (el duplicado /juegos/activos fue eliminado)
router.get("/juegos/activas", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_juegos_activas);

router.get("/juegos/inactivos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_juegos_inactivos);

router.get("/juegos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_juegos_id);

router.post("/juegos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_juegos);

router.delete("/juegos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_juegos);

router.put("/juegos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_juegos);

export default router;
