import { Router } from "express";

import {
    get_c_centros_apuesta,
    get_c_centros_apuesta_id,
    get_c_centros_apuesta_activos,
    crear_c_centros_apuesta,
    eliminar_c_centros_apuesta,
    actualizar_c_centros_apuesta
} from "../controllers/centros_apuesta.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/centros_apuesta", get_c_centros_apuesta);

router.get("/centros_apuesta/activos", get_c_centros_apuesta_activos);

router.get("/centros_apuesta/:id", get_c_centros_apuesta_id);

router.post("/centros_apuesta", crear_c_centros_apuesta);

router.delete("/centros_apuesta/:id", eliminar_c_centros_apuesta);

router.put("/centros_apuesta/:id", actualizar_c_centros_apuesta);

export default router;
