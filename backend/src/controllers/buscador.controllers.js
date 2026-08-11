import {
  buscar_personas_por_ci_rif,
  buscar_personas_avanzado,
  get_detalle_persona,
} from "../models/buscador.models.js";

import { errors, throwError } from "../utils/errors.js";

// Regex para validar UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Normaliza el valor de ci_rif: trim, mayusculas, sin espacios
const normalizeCiRif = (val) => {
  if (!val) return ""
  return val.toString().trim().toUpperCase().replace(/\s+/g, "")
}

//get----------------------------------------------------------

// GET /buscador?ci_rif=...&page=1&limit=10&tipo_persona=natural&estado_documento=vigente&categoria=Operador
// Busca personas por ci_rif con paginacion y filtros opcionales
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

    if (!ci_rif || ci_rif.toString().trim() === "") {
      throwError(errors.missingFields);
    }

    const ciRifNormalizado = normalizeCiRif(ci_rif)

    const filters = {
      ci_rif: ciRifNormalizado,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    }

    if (tipo_persona) filters.tipo_persona = tipo_persona.toString()
    if (estado_documento) filters.estado_documento = estado_documento.toString()
    if (categoria) filters.categoria = categoria.toString()

    const resultado = await buscar_personas_avanzado(filters)
    res.json(resultado)
  } catch (error) {
    next(error);
  }
};

// GET /buscador/:id
// Devuelve el detalle completo de una persona: datos, licencias, solicitudes, representantes y centros
export const get_c_detalle_persona = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const resultado = await get_detalle_persona(id);

    if (!resultado) {
      throwError(errors.persona_no_encontrada);
    }

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};
