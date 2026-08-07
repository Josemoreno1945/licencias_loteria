import { Router } from "express";

import {
  get_c_licencias,
  get_c_licencias_id,
  get_c_licencias_vigentes,
  crear_c_licencia,
  crear_c_licencia_completa,
  actualizar_licencia,
  buscar_c_licencias_por_persona,
  buscar_c_licencias_por_categoria,
  buscar_c_licencias_por_comercializador,
  buscar_c_licencias_por_numero_lot,
  buscar_c_licencias_proximas_a_vencer,
} from "../controllers/licencias.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/licencias", get_c_licencias);

router.get("/licencias/vigentes", get_c_licencias_vigentes);

router.get(
  "/licencias/proximas-a-vencer",
  buscar_c_licencias_proximas_a_vencer,
);

router.get("/licencias/por-persona/:id", buscar_c_licencias_por_persona);

router.get(
  "/licencias/por-categoria/:categoria",
  buscar_c_licencias_por_categoria,
);

router.get(
  "/licencias/por-comercializador/:id",
  buscar_c_licencias_por_comercializador,
);

router.get(
  "/licencias/por-numero-lot/:numero_lot",
  buscar_c_licencias_por_numero_lot,
);

// Ruta explícita para evitar que un GET accidental a /licencias/emitir
// sea interpretado por la ruta "/licencias/:id". Devuelve 405 (solo POST).
router.get("/licencias/emitir", (req, res) => {
  res
    .status(405)
    .json({ error: "Method GET not allowed on /licencias/emitir. Use POST." });
});

router.get("/licencias/:id", get_c_licencias_id);

router.post("/licencias", crear_c_licencia);
router.post("/licencias/emitir", crear_c_licencia_completa);

router.put("/licencias/:id", actualizar_licencia);

export default router;
