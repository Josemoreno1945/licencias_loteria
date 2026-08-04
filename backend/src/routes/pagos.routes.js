import { Router } from "express";

import {
  get_c_pagos,
  get_c_pagos_id,
  crear_c_pago,
  actualizar_pago,
  buscar_c_pagos_por_licencia,
  buscar_c_pagos_por_autorizacion,
  buscar_c_pagos_por_participacion,
  buscar_c_pagos_por_banco,
  buscar_c_pagos_por_rango_fecha,
  buscar_c_pago_por_referencia,
  buscar_c_pagos_por_usuario,
} from "../controllers/pagos.controllers.js";

// import { verifyToken } from "../middlewares/auth.js";
// import { isGerente } from "../middlewares/roles.js";

const router = Router();

router.get("/pagos", get_c_pagos);

router.get("/pagos/por-licencia/:id", buscar_c_pagos_por_licencia);

router.get("/pagos/por-autorizacion/:id", buscar_c_pagos_por_autorizacion);

router.get("/pagos/por-participacion/:id", buscar_c_pagos_por_participacion);

router.get("/pagos/por-banco/:id", buscar_c_pagos_por_banco);

router.get("/pagos/por-rango-fecha", buscar_c_pagos_por_rango_fecha);

router.get("/pagos/por-referencia/:referencia", buscar_c_pago_por_referencia);

router.get("/pagos/por-usuario/:id", buscar_c_pagos_por_usuario);

router.get("/pagos/:id", get_c_pagos_id);

router.post("/pagos", crear_c_pago);

router.put("/pagos/:id", actualizar_pago);

export default router;
