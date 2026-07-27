import { Router } from "express";

import {
  get_c_usuarios,
  get_c_usuarios_id,
  crear_c_usuario,
  actualizar_usuario,
} from "../controllers/usuarios.controllers";

//import { verifyToken } from "../middlewares/auth.js";
//import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/usuarios");

router.get("/usuarios/:id");

router.post("/usuarios");

//router.delete("/personas/:id");

router.put("/usuarios/:id");

export default router;
