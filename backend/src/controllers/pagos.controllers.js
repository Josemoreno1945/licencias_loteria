import {
  get_pagos,
  get_pagos_id,
  buscar_pagos_por_licencia,
  buscar_pagos_por_autorizacion,
  buscar_pagos_por_participacion,
  buscar_pagos_por_banco,
  buscar_pagos_por_rango_fecha,
  buscar_pago_por_referencia,
  buscar_pagos_por_usuario,
} from "../models/pagos.models.js";

import { errors, throwError } from "../utils/errors.js";
import { uuidRegex } from "../utils/validators.js";

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
// NOTA: La creacion de pagos ahora se realiza de forma unificada
// desde el modulo de Licencias (transaccion licencia + pago).
// Este endpoint se mantiene deshabilitado para evitar registros independientes.

//put------------------------------------------------------
// NOTA: La actualizacion de pagos se mantiene deshabilitada.
// Si se requiere en el futuro, debe hacerse desde el contexto
// del documento asociado (licencia/autorizacion/participacion).

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
