import { Router } from "express";

import {
  get_c_comercializadores,
  get_c_comercializadores_id,
  get_c_comercializadores_activos,
  crear_c_comercializador,
  eliminar_c_comercializador,
  actualizar_comercializador,
  get_c_comercializador_detalle_completo,
} from "../controllers/comercializadores.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";
import { validateUuidParam } from "../middlewares/uuidValidator.js";

const router = Router();

router.param("id", validateUuidParam);

router.get("/comercializadores", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_comercializadores);

router.get("/comercializadores/activos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_comercializadores_activos);

router.get("/comercializadores/:id/detalle-completo", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_comercializador_detalle_completo);

router.get("/comercializadores/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_comercializadores_id);

router.post("/comercializadores", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_comercializador);

router.delete("/comercializadores/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_comercializador);

router.put("/comercializadores/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_comercializador);

export default router;
