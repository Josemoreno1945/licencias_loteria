import { Router } from "express";

import {
  get_c_comercializadores,
  get_c_comercializadores_id,
  get_c_comercializadores_activos,
  crear_c_comercializador,
  eliminar_c_comercializador,
  actualizar_comercializador,
} from "../controllers/comercializadores.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/comercializadores", get_c_comercializadores);

router.get("/comercializadores/activos", get_c_comercializadores_activos);

router.get("/comercializadores/:id", get_c_comercializadores_id);

router.post("/comercializadores", crear_c_comercializador);

router.delete("/comercializadores/:id", eliminar_c_comercializador);

router.put("/comercializadores/:id", actualizar_comercializador);

export default router;
