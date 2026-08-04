import { Router } from "express";

import {
  get_c_operadoras,
  get_c_operadoras_id,
  get_c_operadoras_activas,
  crear_c_operadora,
  eliminar_c_operadora,
  actualizar_operadora,
} from "../controllers/operadoras.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/operadoras", get_c_operadoras);

router.get("/operadoras/activas", get_c_operadoras_activas);

router.get("/operadoras/:id", get_c_operadoras_id);

router.post("/operadoras", crear_c_operadora);

router.delete("/operadoras/:id", eliminar_c_operadora);

router.put("/operadoras/:id", actualizar_operadora);

export default router;
