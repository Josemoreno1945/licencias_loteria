import {
  get_licencias,
  get_licencias_id,
  get_licencias_vigentes,
  actualizar_licencia_id,
  buscar_licencias_por_persona,
  buscar_licencias_por_categoria,
  buscar_licencias_por_comercializador,
  buscar_licencias_por_numero_lot,
  buscar_licencias_proximas_a_vencer,
} from "../models/licencias.models.js";

import { get_personas_id } from "../models/personas.models.js";
import { get_comercializadores_id } from "../models/comercializadores.models.js";
import { get_centros_apuesta_id } from "../models/centros_de_apuesta.models.js";

import { crear_licencia_completa } from "../services/licencias.service.js";
import { errors, throwError, zodValidationError } from "../utils/errors.js";
import {
  crear_licencia_completa_schema,
  actualizar_licencia_schema,
} from "../schemas/licencias.schemas.js";

//get----------------------------------------------------------
export const get_c_licencias = async (req, res, next) => {
  try {
    const rows = await get_licencias();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_licencias_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_licencias_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.licencia_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_licencias_vigentes = async (req, res, next) => {
  try {
    const rows = await get_licencias_vigentes();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_licencia = async (req, res, next) => {
  try {
    const data = req.body;

    const parseL = crear_licencia_completa_schema.safeParse(data);
    if (!parseL.success) {
      return next(zodValidationError(parseL.error));
    }

    const result = await crear_licencia_completa(data);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const crear_c_licencia_completa = async (req, res, next) => {
  try {
    const data = req.body;

    const parseL = crear_licencia_completa_schema.safeParse(data);
    if (!parseL.success) {
      return next(zodValidationError(parseL.error));
    }

    const result = await crear_licencia_completa(data);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_licencia = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseL = actualizar_licencia_schema.safeParse(data);
    if (!parseL.success) {
      return next(zodValidationError(parseL.error));
    }

    // OBTENEMOS LA LICENCIA ACTUAL PRIMERO
    const licenciaActualArray = await get_licencias_id(id);
    if (!licenciaActualArray || licenciaActualArray.length === 0) {
      throwError(errors.licencia_no_encontrada);
    }

    const parsed = parseL.data;

    // VALIDAMOS EXISTENCIA DE ENTIDADES RELACIONADAS
    if (parsed.id_persona) {
      const personaExiste = await get_personas_id(parsed.id_persona);
      if (!personaExiste || personaExiste.length === 0) {
        throwError(errors.persona_no_encontrada);
      }
    }

    if (parsed.id_comercializador) {
      const comercializadorExiste = await get_comercializadores_id(parsed.id_comercializador);
      if (!comercializadorExiste || comercializadorExiste.length === 0) {
        throwError(errors.comercializadora_no_encontrada);
      }
    }

    if (parsed.id_centro) {
      const centroExiste = await get_centros_apuesta_id(parsed.id_centro);
      if (!centroExiste || centroExiste.length === 0) {
        throwError(errors.centros_apuesta_no_encontrada);
      }
    }

    if (parsed.id_representante) {
      const representanteExiste = await get_personas_id(parsed.id_representante);
      if (!representanteExiste || representanteExiste.length === 0) {
        throwError(errors.persona_no_encontrada);
      }
    }

    const rows = await actualizar_licencia_id(id, parsed);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//busquedas avanzadas------------------------------------------
export const buscar_c_licencias_por_persona = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_licencias_por_persona(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_licencias_por_categoria = async (req, res, next) => {
  try {
    const categoria = req.params.categoria;
    const categoriasValidas = [
      "Operador",
      "Comercializador",
      "Centro_de_apuesta",
      "Responsable_de_programa_informatico",
    ];
    if (!categoriasValidas.includes(categoria)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_licencias_por_categoria(categoria);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_licencias_por_comercializador = async (
  req,
  res,
  next,
) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await buscar_licencias_por_comercializador(id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_licencias_por_numero_lot = async (req, res, next) => {
  try {
    const numero_lot = req.params.numero_lot;
    const rows = await buscar_licencias_por_numero_lot(numero_lot);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const buscar_c_licencias_proximas_a_vencer = async (req, res, next) => {
  try {
    const rows = await buscar_licencias_proximas_a_vencer();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
