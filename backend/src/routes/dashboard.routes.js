import { Router } from "express";

import {
  get_dashboard_resumen_controller,
  get_dashboard_proximos_vencer_controller,
  get_dashboard_licencias_por_categoria_controller,
  get_dashboard_licencias_por_estado_controller,
  get_dashboard_licencias_por_tipo_emision_controller,
  get_dashboard_solicitudes_por_estado_controller,
  get_dashboard_solicitudes_por_tipo_tramite_controller,
  get_dashboard_participaciones_por_tipo_controller,
  get_dashboard_participaciones_por_estado_controller,
  get_dashboard_autorizaciones_por_tipo_controller,
  get_dashboard_autorizaciones_por_estado_controller,
} from "../controllers/dashboard.controllers.js";

import { verifyToken, hasRole } from "../middlewares/auth.js";

const router = Router();

const auth = [
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
];

router.get("/dashboard/resumen",                         auth, get_dashboard_resumen_controller);
router.get("/dashboard/proximos-vencer",                 auth, get_dashboard_proximos_vencer_controller);

// Licencias
router.get("/dashboard/licencias-por-categoria",         auth, get_dashboard_licencias_por_categoria_controller);
router.get("/dashboard/licencias-por-estado",            auth, get_dashboard_licencias_por_estado_controller);
router.get("/dashboard/licencias-por-tipo-emision",      auth, get_dashboard_licencias_por_tipo_emision_controller);

// Solicitudes
router.get("/dashboard/solicitudes-por-estado",          auth, get_dashboard_solicitudes_por_estado_controller);
router.get("/dashboard/solicitudes-por-tipo-tramite",    auth, get_dashboard_solicitudes_por_tipo_tramite_controller);

// Participaciones
router.get("/dashboard/participaciones-por-tipo",        auth, get_dashboard_participaciones_por_tipo_controller);
router.get("/dashboard/participaciones-por-estado",      auth, get_dashboard_participaciones_por_estado_controller);

// Autorizaciones especiales
router.get("/dashboard/autorizaciones-por-tipo",        auth, get_dashboard_autorizaciones_por_tipo_controller);
router.get("/dashboard/autorizaciones-por-estado",      auth, get_dashboard_autorizaciones_por_estado_controller);

export default router;
