import {
  get_personas,
  get_personas_id,
  crear_persona,
  actualizar_persona_id,
  get_persona_email,
  get_ci_rif,
} from "../models/personas.models.js";

import bcrypt from "bcryptjs";
import { errors, throwError, zodValidationError } from "../utils/errors.js";
import { uuidRegex } from "../utils/validators.js";
import { persona_schema, actualizar_persona_schema } from "../schemas/personas.schemas.js";

//get----------------------------------------------------------
export const get_c_personas = async (req, res, next) => {
  try {
    const rows = await get_personas();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_personas_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_personas_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.persona_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_personas = async (req, res, next) => {
  try {
    const data = req.body;

    const parseP = persona_schema.safeParse(data);
    if (!parseP.success) {
      return next(zodValidationError(parseP.error));
    }

    const emailExiste = await get_persona_email(data.email);
    if (emailExiste) {
      throwError(errors.persona_email_duplicado);
    }

    const ci_rifExiste = await get_ci_rif(data.ci_rif);
    if (ci_rifExiste) {
      throwError(errors.persona_cedula_rif_duplicado);
    }

    const rows = await crear_persona(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
/*export const eliminar_c_usuario = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_usuario_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.usuario_no_encontrado);
    } else {
      return res.json({
        message: "Usuario eliminado (inactivo) exitosamente",
        user: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};
*/
//put------------------------------------------------------
export const actualizar_personas = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseP = actualizar_persona_schema.safeParse(data);

    if (!parseP.success) {
      return next(zodValidationError(parseP.error));
    }

    // OBTENEMOS LA PERSONA ACTUAL PRIMERO
    const personaActualArray = await get_personas_id(id);
    if (!personaActualArray || personaActualArray.length === 0) {
      throwError(errors.persona_no_encontrada);
    }
    const personaActual = personaActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ Y SE ENVÍA
    if (data.email && data.email !== personaActual.email) {
      const emailExiste = await get_persona_email(data.email);
      if (emailExiste) throwError(errors.persona_email_duplicado);
    }

    if (data.ci_rif && data.ci_rif !== personaActual.ci_rif) {
      const ci_rifExiste = await get_ci_rif(data.ci_rif);
      if (ci_rifExiste) throwError(errors.persona_cedula_rif_duplicado);
    }

    const rows = await actualizar_persona_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
