import { Router } from "express";

import {
  get_dashboard_resumen_controller,
  get_dashboard_proximos_vencer_controller,
  get_dashboard_licencias_por_categoria_controller,
} from "../controllers/dashboard.controllers.js";

import { verifyToken, hasRole } from "../middlewares/auth.js";

const router = Router();

router.get(
  "/dashboard/resumen",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  get_dashboard_resumen_controller
);

router.get(
  "/dashboard/proximos-vencer",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  get_dashboard_proximos_vencer_controller
);

router.get(
  "/dashboard/licencias-por-categoria",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  get_dashboard_licencias_por_categoria_controller
);

export default router;
