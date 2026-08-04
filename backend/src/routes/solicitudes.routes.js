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

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/solicitudes", get_c_solicitudes);

router.get("/solicitudes/pendientes", get_c_solicitudes_pendientes);

router.get("/solicitudes/por-persona/:id", buscar_c_solicitudes_por_persona);

router.get("/solicitudes/por-tipo/:tipo", buscar_c_solicitudes_por_tipo);

router.get("/solicitudes/por-estado/:estado", buscar_c_solicitudes_por_estado);

router.get("/solicitudes/por-comercializador/:id", buscar_c_solicitudes_por_comercializador);

router.get("/solicitudes/por-usuario/:id", buscar_c_solicitudes_por_usuario);

router.get("/solicitudes/:id", get_c_solicitudes_id);

router.post("/solicitudes", crear_c_solicitud);

router.put("/solicitudes/:id", actualizar_solicitud);

export default router;
