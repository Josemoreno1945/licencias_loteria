import { Router } from "express";

import {
    get_c_centros_apuesta,
    get_c_centros_apuesta_id,
    get_c_centros_apuesta_activos,
    crear_c_centros_apuesta,
    eliminar_c_centros_apuesta,
    actualizar_c_centros_apuesta,
    get_c_centros_por_comercializador,
    get_c_centro_detalle_completo,
} from "../controllers/centros_apuesta.controllers.js";

import { verifyToken, hasRole, noSupervisorWrite } from "../middlewares/auth.js";
import { validateUuidParam } from "../middlewares/uuidValidator.js";

const router = Router();

router.param("id", validateUuidParam);

router.get("/centros_apuesta", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_centros_apuesta);

router.get("/centros_apuesta/activos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_centros_apuesta_activos);

router.get("/centros_apuesta/por-comercializador/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_centros_por_comercializador);

router.get("/centros_apuesta/:id/detalle-completo", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_centro_detalle_completo);

router.get("/centros_apuesta/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_centros_apuesta_id);

router.post("/centros_apuesta", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, crear_c_centros_apuesta);

router.delete("/centros_apuesta/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, eliminar_c_centros_apuesta);

router.put("/centros_apuesta/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites"), noSupervisorWrite, actualizar_c_centros_apuesta);

export default router;
