import { Router } from "express";

import {
  get_c_permisos_juego,
  get_c_permisos_juego_id,
  get_c_permisos_juego_activos,
  crear_c_permiso_juego,
  eliminar_c_permiso_juego,
  actualizar_permiso_juego,
  buscar_c_permisos_por_juego,
  buscar_c_permisos_por_comercializador,
  buscar_c_permisos_por_centro,
  buscar_c_permisos_por_nivel,
  buscar_c_permisos_vencidos,
} from "../controllers/permisos_juego.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/permisos-juego", get_c_permisos_juego);

router.get("/permisos-juego/activos", get_c_permisos_juego_activos);

router.get("/permisos-juego/vencidos", buscar_c_permisos_vencidos);

router.get("/permisos-juego/por-juego/:id", buscar_c_permisos_por_juego);

router.get("/permisos-juego/por-comercializador/:id", buscar_c_permisos_por_comercializador);

router.get("/permisos-juego/por-centro/:id", buscar_c_permisos_por_centro);

router.get("/permisos-juego/por-nivel/:nivel", buscar_c_permisos_por_nivel);

router.get("/permisos-juego/:id", get_c_permisos_juego_id);

router.post("/permisos-juego", crear_c_permiso_juego);

router.delete("/permisos-juego/:id", eliminar_c_permiso_juego);

router.put("/permisos-juego/:id", actualizar_permiso_juego);

export default router;
