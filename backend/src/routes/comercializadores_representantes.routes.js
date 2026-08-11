import { Router } from "express";
import {
  get_c_representantes,
  get_c_representante_id,
  get_c_representantes_by_persona,
  get_c_representantes_by_comercializador,
  crear_c_representante,
  eliminar_c_representante,
  actualizar_c_representante,
} from "../controllers/comercializadores_representantes.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/representantes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_representantes);
router.get("/representantes/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_representante_id);
router.get("/representantes/persona/:id_persona", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_representantes_by_persona);
router.get("/representantes/comercializador/:id_comercializador", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_representantes_by_comercializador);

router.post("/representantes", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_representante);

router.put("/representantes/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_c_representante);

router.delete("/representantes/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_representante);

export default router;
