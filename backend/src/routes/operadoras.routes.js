import { Router } from "express";

import {
  get_c_operadoras,
  get_c_operadoras_id,
  get_c_operadoras_activas,
  crear_c_operadora,
  eliminar_c_operadora,
  actualizar_operadora,
} from "../controllers/operadoras.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/operadoras", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_operadoras);

router.get("/operadoras/activas", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_operadoras_activas);

router.get("/operadoras/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_operadoras_id);

router.post("/operadoras", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_operadora);

router.delete("/operadoras/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_operadora);

router.put("/operadoras/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_operadora);

export default router;
