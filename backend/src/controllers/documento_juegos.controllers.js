import {
  get_documento_juegos,
  get_documento_juegos_id,
  crear_documento_juego,
  eliminar_documento_juego_id,
  buscar_juegos_por_documento,
  buscar_documentos_por_juego,
  get_documento_juego_duplicado,
} from "../models/documento_juegos.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";
import { crear_documento_juego_schema } from "../schemas/documento_juegos.schemas.js";
import { uuidRegex } from "../utils/validators.js";

//get----------------------------------------------------------
export const get_c_documento_juegos = async (req, res, next) => {
  try {
    const rows = await get_documento_juegos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_documento_juegos_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_documento_juegos_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.documento_juego_no_encontrado);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_documento_juego = async (req, res, next) => {
  try {
    const data = req.body;

    const parseDJ = crear_documento_juego_schema.safeParse(data);
    if (!parseDJ.success) {
      return next(zodValidationError(parseDJ.error));
    }

    const duplicado = await get_documento_juego_duplicado(data.id_documento, data.id_juego);
    if (duplicado) {
      throwError(errors.documento_juego_duplicado);
    }

    const rows = await crear_documento_juego(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (real) ------------------------------------------------
export const eliminar_c_documento_juego = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_documento_juego_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.documento_juego_no_encontrado);
    } else {
      return res.json({
        message: "Relacion documento-juego eliminada exitosamente",
        documento_juego: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_juegos_por_documento = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_juegos_por_documento(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_documentos_por_juego = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_documentos_por_juego(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
