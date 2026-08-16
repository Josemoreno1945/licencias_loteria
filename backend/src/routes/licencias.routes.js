import { Router } from "express";

import {
  get_c_licencias,
  get_c_licencias_id,
  get_c_licencias_vigentes,
  crear_c_licencia_completa,
  actualizar_licencia,
  buscar_c_licencias_por_persona,
  buscar_c_licencias_por_categoria,
  buscar_c_licencias_por_comercializador,
  buscar_c_licencias_por_numero_lot,
  buscar_c_licencias_proximas_a_vencer,
} from "../controllers/licencias.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";
import { validateUuidParam } from "../middlewares/uuidValidator.js";

const router = Router();

router.param("id", validateUuidParam);

router.get("/licencias", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_licencias);

router.get("/licencias/vigentes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_licencias_vigentes);

router.get(
  "/licencias/proximas-a-vencer",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  buscar_c_licencias_proximas_a_vencer,
);

router.get("/licencias/por-persona/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_licencias_por_persona);

router.get(
  "/licencias/por-categoria/:categoria",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  buscar_c_licencias_por_categoria,
);

router.get(
  "/licencias/por-comercializador/:id",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  buscar_c_licencias_por_comercializador,
);

router.get(
  "/licencias/por-numero-lot/:numero_lot",
  verifyToken,
  hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"),
  buscar_c_licencias_por_numero_lot,
);

router.get("/licencias/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_licencias_id);

router.post("/licencias/emitir", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_licencia_completa);

router.put("/licencias/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_licencia);

export default router;
