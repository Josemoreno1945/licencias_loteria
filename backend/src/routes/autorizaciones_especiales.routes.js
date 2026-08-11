import { Router } from "express";

import {
  get_c_autorizaciones_especiales,
  get_c_autorizaciones_especiales_id,
  get_c_autorizaciones_especiales_vigentes,
  crear_c_autorizacion_especial,
  actualizar_autorizacion_especial,
  buscar_c_autorizaciones_por_persona,
  buscar_c_autorizaciones_por_operadora,
  buscar_c_autorizaciones_por_centro,
  buscar_c_autorizaciones_por_nro_mesa,
  buscar_c_autorizaciones_proximas_a_vencer,
} from "../controllers/autorizaciones_especiales.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/autorizaciones-especiales", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_autorizaciones_especiales);

router.get("/autorizaciones-especiales/vigentes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_autorizaciones_especiales_vigentes);

router.get("/autorizaciones-especiales/proximas-a-vencer", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_autorizaciones_proximas_a_vencer);

router.get("/autorizaciones-especiales/por-persona/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_autorizaciones_por_persona);

router.get("/autorizaciones-especiales/por-operadora/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_autorizaciones_por_operadora);

router.get("/autorizaciones-especiales/por-centro/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_autorizaciones_por_centro);

router.get("/autorizaciones-especiales/por-nro-mesa/:nro_mesa", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_autorizaciones_por_nro_mesa);

router.get("/autorizaciones-especiales/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_autorizaciones_especiales_id);

router.post("/autorizaciones-especiales", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_autorizacion_especial);

router.put("/autorizaciones-especiales/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_autorizacion_especial);

export default router;
