import { Router } from "express";

import {
  get_c_personas,
  get_c_personas_id,
  crear_c_personas,
  actualizar_personas,
} from "../controllers/personas.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/personas", get_c_personas);

router.get("/personas/:id", get_c_personas_id);

router.post("/personas", crear_c_personas);

router.put("/personas/:id", actualizar_personas);

export default router;
