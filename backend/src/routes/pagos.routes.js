import { Router } from "express";

import {
  get_c_pagos,
  get_c_pagos_id,
  buscar_c_pagos_por_licencia,
  buscar_c_pagos_por_autorizacion,
  buscar_c_pagos_por_participacion,
  buscar_c_pagos_por_banco,
  buscar_c_pagos_por_rango_fecha,
  buscar_c_pago_por_referencia,
  buscar_c_pagos_por_usuario,
} from "../controllers/pagos.controllers.js";

import { verifyToken, hasRole } from "../middlewares/auth.js";

const router = Router();

router.get("/pagos", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_pagos);

router.get("/pagos/por-licencia/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pagos_por_licencia);

router.get("/pagos/por-autorizacion/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pagos_por_autorizacion);

router.get("/pagos/por-participacion/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pagos_por_participacion);

router.get("/pagos/por-banco/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pagos_por_banco);

router.get("/pagos/por-rango-fecha", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pagos_por_rango_fecha);

router.get("/pagos/por-referencia/:referencia", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pago_por_referencia);

router.get("/pagos/por-usuario/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), buscar_c_pagos_por_usuario);

router.get("/pagos/:id", verifyToken, hasRole("superAdmin", "gerente", "gestor_de_tramites", "supervisor"), get_c_pagos_id);

export default router;
