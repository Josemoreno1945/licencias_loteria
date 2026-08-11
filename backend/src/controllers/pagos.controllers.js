import {
  get_pagos,
  get_pagos_id,
  crear_pago,
  actualizar_pago_id,
  get_pago_referencia,
  buscar_pagos_por_licencia,
  buscar_pagos_por_autorizacion,
  buscar_pagos_por_participacion,
  buscar_pagos_por_banco,
  buscar_pagos_por_rango_fecha,
  buscar_pago_por_referencia,
  buscar_pagos_por_usuario,
} from "../models/pagos.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";
import { crear_pago_schema, actualizar_pago_schema } from "../schemas/pagos.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//get----------------------------------------------------------
export const get_c_pagos = async (req, res, next) => {
  try {
    const rows = await get_pagos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_pagos_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_pagos_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.pago_no_encontrado);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_pago = async (req, res, next) => {
  try {
    const data = req.body;

    const parseP = crear_pago_schema.safeParse(data);
    if (!parseP.success) {
      return next(zodValidationError(parseP.error));
    }

    // Verificar que al menos un documento esté vinculado
    if (!data.id_licencia && !data.id_autorizacion && !data.id_participacion) {
      return res.status(400).json({
        error: "El pago debe estar vinculado a al menos una licencia, autorizacion o participacion",
      });
    }

    const referenciaExiste = await get_pago_referencia(data.num_referencia);
    if (referenciaExiste) {
      throwError(errors.pago_referencia_duplicada);
    }

    const rows = await crear_pago(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_pago = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseP = actualizar_pago_schema.safeParse(data);

    if (!parseP.success) {
      return next(zodValidationError(parseP.error));
    }

    // Verificar que al menos un documento esté vinculado
    if (!data.id_licencia && !data.id_autorizacion && !data.id_participacion) {
      return res.status(400).json({
        error: "El pago debe estar vinculado a al menos una licencia, autorizacion o participacion",
      });
    }

    // OBTENEMOS EL PAGO ACTUAL PRIMERO
    const pagoActualArray = await get_pagos_id(id);
    if (!pagoActualArray || pagoActualArray.length === 0) {
      throwError(errors.pago_no_encontrado);
    }
    const pagoActual = pagoActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ
    if (data.num_referencia !== pagoActual.num_referencia) {
      const referenciaExiste = await get_pago_referencia(data.num_referencia);
      if (referenciaExiste) throwError(errors.pago_referencia_duplicada);
    }

    const rows = await actualizar_pago_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_pagos_por_licencia = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_pagos_por_licencia(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_pagos_por_autorizacion = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_pagos_por_autorizacion(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_pagos_por_participacion = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_pagos_por_participacion(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_pagos_por_banco = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_pagos_por_banco(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_pagos_por_rango_fecha = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      throwError(errors.missingFields);
    }
    const rows = await buscar_pagos_por_rango_fecha(fecha_inicio, fecha_fin);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_pago_por_referencia = async (req, res, next) => {
  try {
    const referencia = req.params.referencia;
    const rows = await buscar_pago_por_referencia(referencia);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_pagos_por_usuario = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_pagos_por_usuario(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
