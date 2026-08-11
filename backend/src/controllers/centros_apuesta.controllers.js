import {
  get_centros_apuesta,
  get_centros_apuesta_id,
  get_centros_apuesta_activos,
  crear_centros_apuesta,
  eliminar_centros_apuesta_id,
  actualizar_centros_apuesta_id,
  get_centros_apuesta_nombre,
} from "../models/centros_de_apuesta.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";

import {
  crear_centros_apuesta_schema,
  actualizar_centros_apuesta_schema,
} from "../schemas/centros_apuesta.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// get ----------------------------------------------------------
export const get_c_centros_apuesta = async (req, res, next) => {
  try {
    const rows = await get_centros_apuesta();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_centros_apuesta_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_centros_apuesta_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.centros_apuesta_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_centros_apuesta_activos = async (req, res, next) => {
  try {
    const rows = await get_centros_apuesta_activos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// post ---------------------------------------------------------
export const crear_c_centros_apuesta = async (req, res, next) => {
  try {
    const data = req.body;

    const parseCA = crear_centros_apuesta_schema.safeParse(data);
    if (!parseCA.success) {
      return next(zodValidationError(parseCA.error));
    }

    const duplicado = await get_centros_apuesta_nombre(data.nombre_agencia);
    if (duplicado) {
      throwError(errors.centros_apuesta_nombre_duplicado);
    }

    const rows = await crear_centros_apuesta(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_centros_apuesta = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_centros_apuesta_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.centros_apuesta_no_encontrada);
    } else {
      return res.json({
        message: "Centro de apuestas eliminado (inactivo) exitosamente",
        centro_apuesta: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

// put ------------------------------------------------------
export const actualizar_c_centros_apuesta = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseCA = actualizar_centros_apuesta_schema.safeParse(data);

    if (!parseCA.success) {
      return next(zodValidationError(parseCA.error));
    }

    const centroActualArray = await get_centros_apuesta_id(id);
    if (!centroActualArray || centroActualArray.length === 0) {
      throwError(errors.centros_apuesta_no_encontrada);
    }

    const rows = await actualizar_centros_apuesta_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
