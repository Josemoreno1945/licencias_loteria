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

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/documentos-emitidos", get_c_documentos_emitidos);

router.get("/documentos-emitidos/vigentes", get_c_documentos_emitidos_vigentes);

router.get("/documentos-emitidos/proximos-a-vencer", buscar_c_documentos_proximos_a_vencer);

router.get("/documentos-emitidos/por-tipo/:tipo", buscar_c_documentos_por_tipo);

router.get("/documentos-emitidos/por-estado/:estado", buscar_c_documentos_por_estado);

router.get("/documentos-emitidos/por-numero/:numero", buscar_c_documentos_por_numero);

router.get("/documentos-emitidos/por-solicitud/:id", buscar_c_documentos_por_solicitud);

router.get("/documentos-emitidos/:id", get_c_documentos_emitidos_id);

router.post("/documentos-emitidos", crear_c_documento_emitido);

router.put("/documentos-emitidos/:id", actualizar_documento_emitido);

export default router;
