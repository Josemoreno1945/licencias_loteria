import {
  buscar_personas_avanzado,
  get_detalle_persona,
} from "../models/buscador.models.js";

import { errors, throwError } from "../utils/errors.js";
import { uuidRegex } from "../utils/validators.js";

const cleanString = (val) => (val == null ? "" : String(val));

const normalizeCiRif = (val) => cleanString(val).trim().toUpperCase().replace(/\s+/g, "");

const safeInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const buscar_c_personas_ci_rif = async (req, res, next) => {
  try {
    const {
      ci_rif,
      page = 1,
      limit = 10,
      tipo_persona,
      estado_documento,
      categoria,
    } = req.query;

    const ciRifNormalizado = normalizeCiRif(ci_rif);
    if (!ciRifNormalizado) {
      throwError({
        status: 400,
        message: "Debe proporcionar una cédula o RIF para realizar la búsqueda.",
      });
    }

    const filters = {
      ci_rif: ciRifNormalizado,
      page: safeInt(page, 1),
      limit: safeInt(limit, 10),
    };

    if (tipo_persona) filters.tipo_persona = cleanString(tipo_persona);
    if (estado_documento) filters.estado_documento = cleanString(estado_documento);
    if (categoria) filters.categoria = cleanString(categoria);

    const resultado = await buscar_personas_avanzado(filters);

    return res.json({
      rows: resultado.rows,
      total: resultado.total,
      page: resultado.page,
      limit: resultado.limit,
      totalPages: resultado.totalPages,
    });
  } catch (error) {
    return next(error);
  }
};

export const get_c_detalle_persona = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !uuidRegex.test(id)) {
      throwError({
        status: 400,
        message: "Identificador de persona inválido.",
      });
    }

    const resultado = await get_detalle_persona(id);

    if (!resultado) {
      throwError(errors.persona_no_encontrada);
    }

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
};
