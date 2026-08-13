import {
  get_operadoras,
  get_operadoras_id,
  get_operadoras_activas,
  crear_operadora,
  eliminar_operadora_id,
  actualizar_operadora_id,
  get_operadora_rif,
} from "../models/operadoras.models.js";

import { errors, throwError, zodValidationError } from "../utils/errors.js";
import {
  crear_operadora_schema,
  actualizar_operadora_schema,
} from "../schemas/operadoras.schemas.js";
import { uuidRegex } from "../utils/validators.js";

//get----------------------------------------------------------
export const get_c_operadoras = async (req, res, next) => {
  try {
    const rows = await get_operadoras();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_operadoras_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_operadoras_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.operadora_no_encontrada);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_operadoras_activas = async (req, res, next) => {
  try {
    const rows = await get_operadoras_activas();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_operadora = async (req, res, next) => {
  try {
    const data = req.body;

    const parseO = crear_operadora_schema.safeParse(data);
    if (!parseO.success) {
      return next(zodValidationError(parseO.error));
    }

    const rifExiste = await get_operadora_rif(data.rif);
    if (rifExiste) {
      throwError(errors.operadora_rif_duplicado);
    }

    const rows = await crear_operadora(data);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_operadora = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }
    const rows = await eliminar_operadora_id(id);

    if (!rows || rows.length === 0) {
      throwError(errors.operadora_no_encontrada);
    } else {
      return res.json({
        message: "Operadora eliminada (inactiva) exitosamente",
        operadora: rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

//put------------------------------------------------------
export const actualizar_operadora = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseO = actualizar_operadora_schema.safeParse(data);

    if (!parseO.success) {
      return next(zodValidationError(parseO.error));
    }

    // OBTENEMOS LA OPERADORA ACTUAL PRIMERO
    const operadoraActualArray = await get_operadoras_id(id);
    if (!operadoraActualArray || operadoraActualArray.length === 0) {
      throwError(errors.operadora_no_encontrada);
    }
    const operadoraActual = operadoraActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ
    if (data.rif !== operadoraActual.rif) {
      const rifExiste = await get_operadora_rif(data.rif);
      if (rifExiste) throwError(errors.operadora_rif_duplicado);
    }

    const rows = await actualizar_operadora_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
