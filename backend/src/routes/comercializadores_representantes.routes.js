import { Router } from "express";
import {
  get_c_representantes,
  get_c_representante_id,
  get_c_representantes_by_persona,
  get_c_representantes_by_comercializador,
  crear_c_representante,
  eliminar_c_representante,
  actualizar_c_representante,
} from "../controllers/comercializadores_representantes.controllers.js";

// Si hay middlewares de auth, importarlos aquí
// import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

// get
router.get("/representantes", get_c_representantes);
router.get("/representantes/:id", get_c_representante_id);
router.get("/representantes/persona/:id_persona", get_c_representantes_by_persona);
router.get("/representantes/comercializador/:id_comercializador", get_c_representantes_by_comercializador);

// post
router.post("/representantes", crear_c_representante);

// put
router.put("/representantes/:id", actualizar_c_representante);

// delete
router.delete("/representantes/:id", eliminar_c_representante);

export default router;
