import { Router } from "express";

import {
  get_c_bancos,
  get_c_bancos_id,
  get_c_bancos_activos,
  crear_c_bancos,
  eliminar_c_banco,
  actualizar_banco,
} from "../controllers/bancos.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";

const router = Router();

router.get("/bancos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_bancos);

router.get("/bancos/activos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_bancos_activos);

router.get("/bancos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_bancos_id);

router.post("/bancos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_bancos);

router.delete("/bancos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_banco);

router.put("/bancos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_banco);

export default router;
