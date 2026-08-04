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

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/participaciones", get_c_participaciones);

router.get("/participaciones/vigentes", get_c_participaciones_vigentes);

router.get("/participaciones/proximas-a-vencer", buscar_c_participaciones_proximas_a_vencer);

router.get("/participaciones/por-persona/:id", buscar_c_participaciones_por_persona);

router.get("/participaciones/por-comercializador/:id", buscar_c_participaciones_por_comercializador);

router.get("/participaciones/por-licencia/:id", buscar_c_participaciones_por_licencia);

router.get("/participaciones/por-nro-archivo/:nro_archivo", buscar_c_participaciones_por_nro_archivo);

router.get("/participaciones/:id", get_c_participaciones_id);

router.post("/participaciones", crear_c_participacion);

router.put("/participaciones/:id", actualizar_participacion);

export default router;
