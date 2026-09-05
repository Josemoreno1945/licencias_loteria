import { Router } from "express";

import {
  get_auditoria_resumen_controller,
  get_auditoria_top_usuarios_controller,
  get_auditoria_actividades_controller,
} from "../controllers/auditoria.controllers.js";

import { verifyToken, hasRole } from "../middlewares/auth.js";

const router = Router();

/* ------------------------------------------------------------
   Acceso ESTRICTO: solo superAdmin y gerente.
   Se valida en backend vía middleware hasRole (defensa en
   profundidad, además del RoleRoute en el frontend).
   ------------------------------------------------------------ */
const soloAdmins = [verifyToken, hasRole("superAdmin", "gerente")];

router.get("/auditoria/resumen",          soloAdmins, get_auditoria_resumen_controller);
router.get("/auditoria/top-usuarios",     soloAdmins, get_auditoria_top_usuarios_controller);
router.get("/auditoria/actividades",      soloAdmins, get_auditoria_actividades_controller);

export default router;
