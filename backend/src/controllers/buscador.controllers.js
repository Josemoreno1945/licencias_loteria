import {
  buscar_personas_por_ci_rif,
  get_detalle_persona,
} from "../models/buscador.models.js";

import { errors, throwError } from "../utils/errors.js";

// Regex para validar UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//get----------------------------------------------------------

// GET /buscador?ci_rif=...
// Busca personas cuya ci_rif contenga el valor enviado por query param
export const buscar_c_personas_ci_rif = async (req, res, next) => {
  try {
    const { ci_rif } = req.query;

    if (!ci_rif || ci_rif.toString().trim() === "") {
      throwError(errors.missingFields);
    }

    const rows = await buscar_personas_por_ci_rif(ci_rif.toString().trim());
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// GET /buscador/:id
// Devuelve el detalle completo de una persona: datos, licencias, solicitudes, etc.
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
