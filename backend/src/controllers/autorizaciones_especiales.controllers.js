import {
  get_autorizaciones_especiales,
  get_autorizaciones_especiales_id,
  get_autorizaciones_especiales_vigentes,
  crear_autorizacion_especial,
  actualizar_autorizacion_especial_id,
  buscar_autorizaciones_por_persona,
  buscar_autorizaciones_por_operadora,
  buscar_autorizaciones_por_centro,
  buscar_autorizaciones_por_nro_mesa,
  buscar_autorizaciones_proximas_a_vencer,
} from "../models/autorizaciones_especiales.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";
import {
  crear_autorizacion_especial_schema,
  actualizar_autorizacion_especial_schema,
} from "../schemas/autorizaciones_especiales.schemas.js";
import { uuidRegex } from "../utils/validators.js";

//get----------------------------------------------------------
export const get_c_autorizaciones_especiales = async (req, res, next) => {
  try {
    const rows = await get_autorizaciones_especiales();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_autorizaciones_especiales_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_autorizaciones_especiales_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.autorizacion_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_autorizaciones_especiales_vigentes = async (req, res, next) => {
  try {
    const rows = await get_autorizaciones_especiales_vigentes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_autorizacion_especial = async (req, res, next) => {
  try {
    const data = req.body;

    const parseAE = crear_autorizacion_especial_schema.safeParse(data);
    if (!parseAE.success) {
      return next(zodValidationError(parseAE.error));
    }

    const rows = await crear_autorizacion_especial(parseAE.data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_autorizacion_especial = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseAE = actualizar_autorizacion_especial_schema.safeParse(data);

    if (!parseAE.success) {
      return next(zodValidationError(parseAE.error));
    }

    // OBTENEMOS LA AUTORIZACION ACTUAL PRIMERO
    const autActualArray = await get_autorizaciones_especiales_id(id);
    if (!autActualArray || autActualArray.length === 0) {
      throwError(errors.autorizacion_no_encontrada);
    }

    const rows = await actualizar_autorizacion_especial_id(id, parseAE.data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_autorizaciones_por_persona = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_autorizaciones_por_persona(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_autorizaciones_por_operadora = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_autorizaciones_por_operadora(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_autorizaciones_por_centro = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_autorizaciones_por_centro(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_autorizaciones_por_nro_mesa = async (req, res, next) => {
  try {
    const nro_mesa = parseInt(req.params.nro_mesa);
    if (isNaN(nro_mesa) || nro_mesa <= 0) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_autorizaciones_por_nro_mesa(nro_mesa);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_autorizaciones_proximas_a_vencer = async (req, res, next) => {
  try {
    const rows = await buscar_autorizaciones_proximas_a_vencer();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
