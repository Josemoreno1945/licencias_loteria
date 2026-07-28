import {
  get_comercializadores,
  get_comercializadores_id,
  get_comercializadores_activos,
  crear_comercializador,
  eliminar_comercializador_id,
  actualizar_comercializador_id,
  get_comercializador_email,
  get_comercializador_rif,
} from "../models/comercializadores.models.js";

import { errors, throwError } from "../utils/errors.js";
import {
  crear_comercializador_schema,
  actualizar_comercializador_schema,
} from "../schemas/comercializadores.schemas.js";

// Regex para validar que el string tiene formato UUID
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//get----------------------------------------------------------
export const get_c_comercializadores = async (req, res, next) => {
  try {
    const rows = await get_comercializadores();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_comercializadores_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_comercializadores_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.comercializadora_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_comercializadores_activos = async (req, res, next) => {
  try {
    const rows = await get_comercializadores_activos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_comercializador = async (req, res, next) => {
  try {
    const data = req.body;

    const parseC = crear_comercializador_schema.safeParse(data);
    if (!parseC.success) {
      return res.status(400).json({
        errors: parseC.error.errors,
      });
    }

    const emailExiste = await get_comercializador_email(data.email);
    if (emailExiste) {
      throwError(errors.comercializadora_email_duplicado);
    }

    const rifExiste = await get_comercializador_rif(data.rif);
    if (rifExiste) {
      throwError(errors.comercializadora_rif_duplicado);
    }

    const rows = await crear_comercializador(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_comercializador = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_comercializador_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.comercializadora_no_encontrada);
    } else {
      return res.json({
        message: "Comercializador eliminado (inactivo) exitosamente",
        comercializador: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_comercializador = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseC = actualizar_comercializador_schema.safeParse(data);

    if (!parseC.success) {
      return res.status(400).json({
        errors: parseC.error.errors,
      });
    }

    // OBTENEMOS EL COMERCIALIZADOR ACTUAL PRIMERO
    const comercializadorActualArray = await get_comercializadores_id(id);
    if (!comercializadorActualArray || comercializadorActualArray.length === 0) {
      throwError(errors.comercializadora_no_encontrada);
    }
    const comercializadorActual = comercializadorActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ
    if (data.email !== comercializadorActual.email) {
      const emailExiste = await get_comercializador_email(data.email);
      if (emailExiste) throwError(errors.comercializadora_email_duplicado);
    }

    if (data.rif !== comercializadorActual.rif) {
      const rifExiste = await get_comercializador_rif(data.rif);
      if (rifExiste) throwError(errors.comercializadora_rif_duplicado);
    }

    const rows = await actualizar_comercializador_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
