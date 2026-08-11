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

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/permisos-juego", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_permisos_juego);

router.get("/permisos-juego/activos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_permisos_juego_activos);

router.get("/permisos-juego/vencidos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_permisos_vencidos);

router.get("/permisos-juego/por-juego/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_permisos_por_juego);

router.get("/permisos-juego/por-comercializador/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_permisos_por_comercializador);

router.get("/permisos-juego/por-centro/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_permisos_por_centro);

router.get("/permisos-juego/por-nivel/:nivel", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_permisos_por_nivel);

router.get("/permisos-juego/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_permisos_juego_id);

router.post("/permisos-juego", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_permiso_juego);

router.delete("/permisos-juego/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_permiso_juego);

router.put("/permisos-juego/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_permiso_juego);

export default router;
