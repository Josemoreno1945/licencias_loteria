import {
  get_solicitudes,
  get_solicitudes_id,
  get_solicitudes_pendientes,
  crear_solicitud,
  actualizar_solicitud_id,
  buscar_solicitudes_por_persona,
  buscar_solicitudes_por_tipo,
  buscar_solicitudes_por_estado,
  buscar_solicitudes_por_comercializador,
  buscar_solicitudes_por_usuario,
} from "../models/solicitudes.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";
import { uuidRegex } from "../utils/validators.js";
import {
  crear_solicitud_schema,
  actualizar_solicitud_schema,
} from "../schemas/solicitudes.schemas.js";

//get----------------------------------------------------------
export const get_c_solicitudes = async (req, res, next) => {
  try {
    const rows = await get_solicitudes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_solicitudes_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_solicitudes_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.solicitud_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_solicitudes_pendientes = async (req, res, next) => {
  try {
    const rows = await get_solicitudes_pendientes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_solicitud = async (req, res, next) => {
  try {
    const data = req.body;

    const parseS = crear_solicitud_schema.safeParse(data);
    if (!parseS.success) {
      return next(zodValidationError(parseS.error));
    }

    const rows = await crear_solicitud(parseS.data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_solicitud = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseS = actualizar_solicitud_schema.safeParse(data);

    if (!parseS.success) {
      return next(zodValidationError(parseS.error));
    }

    // OBTENEMOS LA SOLICITUD ACTUAL PRIMERO
    const solicitudActualArray = await get_solicitudes_id(id);
    if (!solicitudActualArray || solicitudActualArray.length === 0) {
      throwError(errors.solicitud_no_encontrada);
    }

    const rows = await actualizar_solicitud_id(id, parseS.data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_solicitudes_por_persona = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_solicitudes_por_persona(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_solicitudes_por_tipo = async (req, res, next) => {
  try {
    const tipo = req.params.tipo;
    const tiposValidos = ["Licencia", "Participacion", "Autorizacion_especial", "Otro"];
    if (!tiposValidos.includes(tipo)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_solicitudes_por_tipo(tipo);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_solicitudes_por_estado = async (req, res, next) => {
  try {
    const estado = req.params.estado;
    const estadosValidos = ["Pendiente", "Aprobado", "Rechazada"];
    if (!estadosValidos.includes(estado)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_solicitudes_por_estado(estado);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_solicitudes_por_comercializador = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_solicitudes_por_comercializador(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_solicitudes_por_usuario = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_solicitudes_por_usuario(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
