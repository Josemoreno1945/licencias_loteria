import { Router } from "express";

import {
  get_c_juegos,
  get_c_juegos_activas,
  get_c_juegos_id,
  get_c_juegos_inactivos,
  crear_c_juegos,
  actualizar_juegos,
  eliminar_c_juegos,
} from "../controllers/juegos.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/juegos", get_c_juegos);

router.get("/juegos/activas", get_c_juegos_activas);

router.get("/juegos/:id", get_c_juegos_id);

router.post("/juegos", crear_c_juegos);

router.delete("/juegos/:id", eliminar_c_juegos);

router.put("/juegos/:id", actualizar_juegos);

export default router;
