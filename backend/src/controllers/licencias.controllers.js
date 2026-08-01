import {
  get_licencias,
  get_licencias_id,
  get_licencias_vigentes,
  crear_licencia,
  actualizar_licencia_id,
  buscar_licencias_por_persona,
  buscar_licencias_por_categoria,
  buscar_licencias_por_comercializador,
  buscar_licencias_por_numero_lot,
  buscar_licencias_proximas_a_vencer,
} from "../models/licencias.models.js";

import { errors, throwError } from "../utils/errors.js";
import {
  crear_licencia_schema,
  actualizar_licencia_schema,
} from "../schemas/licencias.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const parseL = crear_licencia_schema.safeParse(data);
    if (!parseL.success) {
      return res.status(400).json({
        errors: parseL.error.errors,
      });
    }

    const rows = await crear_licencia(data);
    return res.json(rows);
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
      return res.status(400).json({
        errors: parseL.error.errors,
      });
    }

    // OBTENEMOS LA LICENCIA ACTUAL PRIMERO
    const licenciaActualArray = await get_licencias_id(id);
    if (!licenciaActualArray || licenciaActualArray.length === 0) {
      throwError(errors.licencia_no_encontrada);
    }

    const rows = await actualizar_licencia_id(id, data);
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

export const buscar_c_licencias_por_comercializador = async (req, res, next) => {
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
