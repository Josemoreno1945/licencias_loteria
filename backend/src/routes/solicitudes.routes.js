import { Router } from "express";

import {
  get_c_solicitudes,
  get_c_solicitudes_id,
  get_c_solicitudes_pendientes,
  crear_c_solicitud,
  actualizar_solicitud,
  buscar_c_solicitudes_por_persona,
  buscar_c_solicitudes_por_tipo,
  buscar_c_solicitudes_por_estado,
  buscar_c_solicitudes_por_comercializador,
  buscar_c_solicitudes_por_usuario,
} from "../controllers/solicitudes.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/solicitudes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_solicitudes);

router.get("/solicitudes/pendientes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_solicitudes_pendientes);

router.get("/solicitudes/por-persona/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_solicitudes_por_persona);

router.get("/solicitudes/por-tipo/:tipo", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_solicitudes_por_tipo);

router.get("/solicitudes/por-estado/:estado", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_solicitudes_por_estado);

router.get("/solicitudes/por-comercializador/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_solicitudes_por_comercializador);

router.get("/solicitudes/por-usuario/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_solicitudes_por_usuario);

router.get("/solicitudes/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_solicitudes_id);

router.post("/solicitudes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_solicitud);

router.put("/solicitudes/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_solicitud);

export default router;
