import { Router } from "express";

import {
  get_c_usuarios,
  get_c_usuarios_id,
  crear_c_usuario,
  actualizar_usuario,
  eliminar_c_usuario,
} from "../controllers/usuarios.controllers.js";

//import { verifyToken } from "../middlewares/auth.js";
//import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/usuarios", get_c_usuarios);

router.get("/usuarios/:id", get_c_usuarios_id);

router.post("/usuarios", crear_c_usuario);

router.delete("/usuarios/:id", eliminar_c_usuario);

router.put("/usuarios/:id", actualizar_usuario);

export default router;
