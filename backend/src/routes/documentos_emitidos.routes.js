import { Router } from "express";

import {
  get_c_documentos_emitidos,
  get_c_documentos_emitidos_id,
  get_c_documentos_emitidos_vigentes,
  crear_c_documento_emitido,
  actualizar_documento_emitido,
  buscar_c_documentos_por_tipo,
  buscar_c_documentos_por_estado,
  buscar_c_documentos_por_numero,
  buscar_c_documentos_proximos_a_vencer,
  buscar_c_documentos_por_solicitud,
} from "../controllers/documentos_emitidos.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/documentos-emitidos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_documentos_emitidos);

router.get("/documentos-emitidos/vigentes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_documentos_emitidos_vigentes);

router.get("/documentos-emitidos/proximos-a-vencer", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_documentos_proximos_a_vencer);

router.get("/documentos-emitidos/por-tipo/:tipo", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_documentos_por_tipo);

router.get("/documentos-emitidos/por-estado/:estado", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_documentos_por_estado);

router.get("/documentos-emitidos/por-numero/:numero", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_documentos_por_numero);

router.get("/documentos-emitidos/por-solicitud/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_documentos_por_solicitud);

router.get("/documentos-emitidos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_documentos_emitidos_id);

router.post("/documentos-emitidos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_documento_emitido);

router.put("/documentos-emitidos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_documento_emitido);

export default router;
