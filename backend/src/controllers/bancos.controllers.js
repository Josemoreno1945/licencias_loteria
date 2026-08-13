import {
  get_bancos,
  get_bancos_id,
  get_bancos_activos,
  crear_banco,
  eliminar_banco_id,
  actualizar_banco_id,
  get_banco_nombre,
} from "../models/bancos.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";

import { bancos_schema } from "../schemas/bancos.schemas.js";
import { uuidRegex } from "../utils/validators.js";

//get----------------------------------------------------------
export const get_c_bancos = async (req, res, next) => {
  try {
    const rows = await get_bancos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_bancos_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_bancos_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.bancos_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_bancos_activos = async (req, res, next) => {
  try {
    const rows = await get_bancos_activos();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_bancos = async (req, res, next) => {
  try {
    const data = req.body;

    const parseB = bancos_schema.safeParse(data);
    if (!parseB.success) {
      return next(zodValidationError(parseB.error));
    }

    const nombreExiste = await get_banco_nombre(data.nombre);
    if (nombreExiste) {
      throwError(errors.bancos_nombre_duplicado);
    }

    const rows = await crear_banco(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_banco = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_banco_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.bancos_no_encontrada);
    } else {
      return res.json({
        message: "Banco eliminado (inactivo) exitosamente",
        banco: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_banco = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseB = bancos_schema.safeParse(data);

    if (!parseB.success) {
      return next(zodValidationError(parseB.error));
    }

    // OBTENEMOS EL BANCO ACTUAL PRIMERO
    const bancoActualArray = await get_bancos_id(id);
    if (!bancoActualArray || bancoActualArray.length === 0) {
      throwError(errors.bancos_no_encontrada);
    }
    const bancoActual = bancoActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ
    if (data.nombre !== bancoActual.nombre) {
      const nombreExiste = await get_banco_nombre(data.nombre);
      if (nombreExiste) throwError(errors.bancos_nombre_duplicado);
    }

    const rows = await actualizar_banco_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
