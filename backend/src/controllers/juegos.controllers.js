import {
  get_juegos,
  get_juegos_id,
  crear_juegos,
  actualizar_juegos_id,
  eliminar_juegos_id,
  get_juegos_estado_activo,
  get_juegos_estado_inactivo,
  get_juegos_nombre,
} from "../models/juegos.models.js";

import { errors, throwError } from "../utils/errors.js";

import { juegos_schema } from "../schemas/juegos.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//get----------------------------------------------------------
export const get_c_juegos = async (req, res, next) => {
  try {
    const rows = await get_juegos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_juegos_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_juegos_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.juegos_no_encontrados);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_juegos_activas = async (req, res, next) => {
  try {
    const rows = await get_juegos_estado_activo();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_juegos_inactivos = async (req, res, next) => {
  try {
    const rows = await get_juegos_estado_inactivo();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_juegos = async (req, res, next) => {
  try {
    const data = req.body;

    const parseJ = juegos_schema.safeParse(data);
    if (!parseJ.success) {
      const issues = parseJ.error.issues.map((it) => ({
        path: Array.isArray(it.path) ? it.path.join(".") : String(it.path || ""),
        message: it.message || "Validation error",
        code: it.code || null,
      }));
      return next({ name: "ZodError", errors: issues });
    }
    const parsedData = parseJ.data;
    const nombreExiste = await get_juegos_nombre(parsedData.nombre);
    if (nombreExiste) {
      throwError(errors.juegos_nombre_duplicado);
    }
    const rows = await crear_juegos(parsedData);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_juegos = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_juegos_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.juegos_no_encontrados);
    } else {
      return res.json({
        message: "Juego eliminado (inactiva) exitosamente",
        operadora: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_juegos = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseJ = juegos_schema.safeParse(data);

    if (!parseJ.success) {
      const issues = parseJ.error.issues.map((it) => ({
        path: Array.isArray(it.path) ? it.path.join(".") : String(it.path || ""),
        message: it.message || "Validation error",
        code: it.code || null,
      }));
      return next({ name: "ZodError", errors: issues });
    }

    // OBTENEMOS EL JUEGO ACTUAL PRIMERO
    const juegosActualArray = await get_juegos_id(id);
    if (!juegosActualArray || juegosActualArray.length === 0) {
      throwError(errors.juegos_no_encontrados);
    }
    const juegosActual = juegosActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ
    if (data.nombre !== juegosActual.nombre) {
      const nombreExiste = await get_juegos_nombre(data.nombre);
      if (nombreExiste) throwError(errors.juegos_nombre_duplicado);
    }

    const rows = await actualizar_juegos_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
