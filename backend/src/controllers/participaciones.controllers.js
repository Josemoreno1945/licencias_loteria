import {
  get_participaciones,
  get_participaciones_id,
  get_participaciones_vigentes,
  crear_participacion,
  actualizar_participacion_id,
  buscar_participaciones_por_persona,
  buscar_participaciones_por_comercializador,
  buscar_participaciones_por_licencia,
  buscar_participaciones_por_nro_archivo,
  buscar_participaciones_proximas_a_vencer,
} from "../models/participaciones.models.js";

import { errors, throwError } from "../utils/errors.js";
import {
  crear_participacion_schema,
  actualizar_participacion_schema,
} from "../schemas/participaciones.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//get----------------------------------------------------------
export const get_c_participaciones = async (req, res, next) => {
  try {
    const rows = await get_participaciones();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_participaciones_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_participaciones_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.participacion_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_participaciones_vigentes = async (req, res, next) => {
  try {
    const rows = await get_participaciones_vigentes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_participacion = async (req, res, next) => {
  try {
    const data = req.body;

    const parsePar = crear_participacion_schema.safeParse(data);
    if (!parsePar.success) {
      return res.status(400).json({
        errors: parsePar.error.errors,
      });
    }

    const rows = await crear_participacion(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_participacion = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parsePar = actualizar_participacion_schema.safeParse(data);

    if (!parsePar.success) {
      return res.status(400).json({
        errors: parsePar.error.errors,
      });
    }

    // OBTENEMOS LA PARTICIPACION ACTUAL PRIMERO
    const parActualArray = await get_participaciones_id(id);
    if (!parActualArray || parActualArray.length === 0) {
      throwError(errors.participacion_no_encontrada);
    }

    const rows = await actualizar_participacion_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_participaciones_por_persona = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_participaciones_por_persona(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_participaciones_por_comercializador = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_participaciones_por_comercializador(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_participaciones_por_licencia = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_participaciones_por_licencia(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_participaciones_por_nro_archivo = async (req, res, next) => {
  try {
    const nro_archivo = req.params.nro_archivo;
    const rows = await buscar_participaciones_por_nro_archivo(nro_archivo);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_participaciones_proximas_a_vencer = async (req, res, next) => {
  try {
    const rows = await buscar_participaciones_proximas_a_vencer();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
