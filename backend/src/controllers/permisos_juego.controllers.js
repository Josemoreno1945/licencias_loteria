import {
  get_permisos_juego,
  get_permisos_juego_id,
  get_permisos_juego_activos,
  crear_permiso_juego,
  eliminar_permiso_juego_id,
  actualizar_permiso_juego_id,
  buscar_permisos_por_juego,
  buscar_permisos_por_comercializador,
  buscar_permisos_por_centro,
  buscar_permisos_por_nivel,
  buscar_permisos_vencidos,
} from "../models/permisos_de_juegos.models.js";

import { errors, throwError } from "../utils/errors.js";
import {
  crear_permiso_juego_schema,
  actualizar_permiso_juego_schema,
} from "../schemas/permisos_juego.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//get----------------------------------------------------------
export const get_c_permisos_juego = async (req, res, next) => {
  try {
    const rows = await get_permisos_juego();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_permisos_juego_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_permisos_juego_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.permiso_juego_no_encontrado);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_permisos_juego_activos = async (req, res, next) => {
  try {
    const rows = await get_permisos_juego_activos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_permiso_juego = async (req, res, next) => {
  try {
    const data = req.body;

    const parsePJ = crear_permiso_juego_schema.safeParse(data);
    if (!parsePJ.success) {
      return res.status(400).json({
        errors: parsePJ.error.errors,
      });
    }

    const rows = await crear_permiso_juego(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_permiso_juego = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_permiso_juego_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.permiso_juego_no_encontrado);
    } else {
      return res.json({
        message: "Permiso de juego eliminado (inactivo) exitosamente",
        permiso_juego: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_permiso_juego = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parsePJ = actualizar_permiso_juego_schema.safeParse(data);

    if (!parsePJ.success) {
      return res.status(400).json({
        errors: parsePJ.error.errors,
      });
    }

    // OBTENEMOS EL PERMISO ACTUAL PRIMERO
    const permisoActualArray = await get_permisos_juego_id(id);
    if (!permisoActualArray || permisoActualArray.length === 0) {
      throwError(errors.permiso_juego_no_encontrado);
    }

    const rows = await actualizar_permiso_juego_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_permisos_por_juego = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_permisos_por_juego(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_permisos_por_comercializador = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_permisos_por_comercializador(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_permisos_por_centro = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_permisos_por_centro(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_permisos_por_nivel = async (req, res, next) => {
  try {
    const nivel = req.params.nivel;
    const nivelesValidos = ["comercializador", "centro_apuesta"];
    if (!nivelesValidos.includes(nivel)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_permisos_por_nivel(nivel);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_permisos_vencidos = async (req, res, next) => {
  try {
    const rows = await buscar_permisos_vencidos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
