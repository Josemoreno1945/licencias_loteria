import { Router } from "express";

import {
  get_c_usuarios,
  get_c_usuarios_id,
  crear_c_usuario,
  actualizar_usuario,
  eliminar_c_usuario,
} from "../controllers/usuarios.controllers.js";

import { verifyToken, soloAdmins } from "../middlewares/auth.js";

const router = Router();

router.get("/usuarios", verifyToken, soloAdmins, get_c_usuarios);

router.get("/usuarios/:id", verifyToken, soloAdmins, get_c_usuarios_id);

router.post("/usuarios", verifyToken, soloAdmins, crear_c_usuario);

router.delete("/usuarios/:id", verifyToken, soloAdmins, eliminar_c_usuario);

router.put("/usuarios/:id", verifyToken, soloAdmins, actualizar_usuario);

export default router;
