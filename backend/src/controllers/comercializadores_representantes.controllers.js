import {
  get_representantes,
  get_representante_id,
  get_representantes_by_persona,
  get_representantes_by_comercializador,
  crear_representante,
  eliminar_representante_id,
  actualizar_representante_id,
  check_duplicado_representante,
} from "../models/comercializadores_representantes.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";

import {
  crear_representante_schema,
  actualizar_representante_schema,
} from "../schemas/comercializadores_representantes.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// get ----------------------------------------------------------
export const get_c_representantes = async (req, res, next) => {
  try {
    const rows = await get_representantes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_representante_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_representante_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.representante_no_encontrado);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_representantes_by_persona = async (req, res, next) => {
  try {
    const id_persona = req.params.id_persona;

    if (!uuidRegex.test(id_persona)) {
      throwError(errors.invalidData);
    }

    const rows = await get_representantes_by_persona(id_persona);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_representantes_by_comercializador = async (req, res, next) => {
  try {
    const id_comercializador = req.params.id_comercializador;

    if (!uuidRegex.test(id_comercializador)) {
      throwError(errors.invalidData);
    }

    const rows = await get_representantes_by_comercializador(id_comercializador);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// post ---------------------------------------------------------
export const crear_c_representante = async (req, res, next) => {
  try {
    const data = req.body;

    const parseR = crear_representante_schema.safeParse(data);
    if (!parseR.success) {
      return next(zodValidationError(parseR.error));
    }

    const duplicado = await check_duplicado_representante(data.id_comercializador, data.id_persona);
    if (duplicado) {
      throwError(errors.representante_duplicado);
    }

    const rows = await crear_representante(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_representante = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_representante_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.representante_no_encontrado);
    } else {
      return res.json({
        message: "Representante eliminado (inactivo) exitosamente",
        representante: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

// put ------------------------------------------------------
export const actualizar_c_representante = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseR = actualizar_representante_schema.safeParse(data);

    if (!parseR.success) {
      return next(zodValidationError(parseR.error));
    }

    const representanteActualArray = await get_representante_id(id);
    if (!representanteActualArray || representanteActualArray.length === 0) {
      throwError(errors.representante_no_encontrado);
    }

    const rows = await actualizar_representante_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
