import {
  get_documentos_emitidos,
  get_documentos_emitidos_id,
  get_documentos_emitidos_vigentes,
  crear_documento_emitido,
  actualizar_documento_emitido_id,
  get_documento_numero,
  get_documento_papel,
  buscar_documentos_por_tipo,
  buscar_documentos_por_estado,
  buscar_documentos_por_numero,
  buscar_documentos_proximos_a_vencer,
  buscar_documentos_por_solicitud,
} from "../models/documentos_emitidos.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";
import {
  crear_documento_emitido_schema,
  actualizar_documento_emitido_schema,
} from "../schemas/documentos_emitidos.schemas.js";
import { uuidRegex } from "../utils/validators.js";

//get----------------------------------------------------------
export const get_c_documentos_emitidos = async (req, res, next) => {
  try {
    const rows = await get_documentos_emitidos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_documentos_emitidos_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_documentos_emitidos_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.documento_emitido_no_encontrado);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_documentos_emitidos_vigentes = async (req, res, next) => {
  try {
    const rows = await get_documentos_emitidos_vigentes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_documento_emitido = async (req, res, next) => {
  try {
    const data = req.body;

    const parseDE = crear_documento_emitido_schema.safeParse(data);
    if (!parseDE.success) {
      return next(zodValidationError(parseDE.error));
    }

    const numeroExiste = await get_documento_numero(parseDE.data.numero_documento);
    if (numeroExiste) {
      throwError(errors.documento_numero_duplicado);
    }

    const papelExiste = await get_documento_papel(parseDE.data.papel_seguridad);
    if (papelExiste) {
      throwError(errors.documento_papel_duplicado);
    }

    const rows = await crear_documento_emitido(parseDE.data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_documento_emitido = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseDE = actualizar_documento_emitido_schema.safeParse(data);

    if (!parseDE.success) {
      return next(zodValidationError(parseDE.error));
    }

    // OBTENEMOS EL DOCUMENTO ACTUAL PRIMERO
    const documentoActualArray = await get_documentos_emitidos_id(id);
    if (!documentoActualArray || documentoActualArray.length === 0) {
      throwError(errors.documento_emitido_no_encontrado);
    }

    const rows = await actualizar_documento_emitido_id(id, parseDE.data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_documentos_por_tipo = async (req, res, next) => {
  try {
    const tipo = req.params.tipo;
    const tiposValidos = ["Licencia", "Participacion", "Autorizacion_especial"];
    if (!tiposValidos.includes(tipo)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_documentos_por_tipo(tipo);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_documentos_por_estado = async (req, res, next) => {
  try {
    const estado = req.params.estado;
    const estadosValidos = ["vigente", "vencido", "anulado", "suspendido"];
    if (!estadosValidos.includes(estado)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_documentos_por_estado(estado);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_documentos_por_numero = async (req, res, next) => {
  try {
    const numero = req.params.numero;
    const rows = await buscar_documentos_por_numero(numero);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_documentos_proximos_a_vencer = async (req, res, next) => {
  try {
    const rows = await buscar_documentos_proximos_a_vencer();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_documentos_por_solicitud = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_documentos_por_solicitud(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
