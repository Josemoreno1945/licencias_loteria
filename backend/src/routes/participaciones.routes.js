import { Router } from "express";

import {
  get_c_participaciones,
  get_c_participaciones_id,
  get_c_participaciones_vigentes,
  crear_c_participacion,
  actualizar_participacion,
  buscar_c_participaciones_por_persona,
  buscar_c_participaciones_por_comercializador,
  buscar_c_participaciones_por_licencia,
  buscar_c_participaciones_por_nro_archivo,
  buscar_c_participaciones_proximas_a_vencer,
} from "../controllers/participaciones.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/participaciones", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_participaciones);

router.get("/participaciones/vigentes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_participaciones_vigentes);

router.get("/participaciones/proximas-a-vencer", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_participaciones_proximas_a_vencer);

router.get("/participaciones/por-persona/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_participaciones_por_persona);

router.get("/participaciones/por-comercializador/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_participaciones_por_comercializador);

router.get("/participaciones/por-licencia/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_participaciones_por_licencia);

router.get("/participaciones/por-nro-archivo/:nro_archivo", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_participaciones_por_nro_archivo);

router.get("/participaciones/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_participaciones_id);

router.post("/participaciones", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_participacion);

router.put("/participaciones/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_participacion);

export default router;
