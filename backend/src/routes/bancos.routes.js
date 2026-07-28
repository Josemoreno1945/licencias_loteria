import { Router } from "express";

import {
  get_c_bancos,
  get_c_bancos_id,
  get_c_bancos_activos,
  crear_c_bancos,
  eliminar_c_banco,
  actualizar_banco,
} from "../controllers/bancos.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/bancos", get_c_bancos);

router.get("/bancos/activos", get_c_bancos_activos);

router.get("/bancos/:id", get_c_bancos_id);

router.post("/bancos", crear_c_bancos);

router.delete("/bancos/:id", eliminar_c_banco);

router.put("/bancos/:id", actualizar_banco);

export default router;
