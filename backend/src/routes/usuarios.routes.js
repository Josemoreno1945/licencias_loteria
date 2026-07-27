import { Router } from "express";

import {
  get_c_usuarios,
  get_c_usuarios_id,
  crear_c_usuario,
  actualizar_usuario,
} from "../controllers/usuarios.controllers.js";

//import { verifyToken } from "../middlewares/auth.js";
//import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/usuarios", get_c_usuarios);

router.get("/usuarios/:id", get_c_usuarios_id);

router.post("/usuarios", crear_c_usuario);

//router.delete("/personas/:id");

router.put("/usuarios/:id", actualizar_usuario);

export default router;
