import {
  get_usuarios,
  get_usuarios_id,
  get_usuarios_activos,
  crear_usuario,
  eliminar_usuario_id,
  actualizar_usuario_id,
  get_nombre_de_usuario,
  get_usuario_email,
} from "../models/usuarios.models.js";

import bcrypt from "bcryptjs";
import { errors, throwError, zodValidationError } from "../utils/errors.js";
import { uuidRegex } from "../utils/validators.js";
import {
  crear_usuario_schema,
  actualizar_usuario_schema,
} from "../schemas/usuarios.schemas.js";

//get----------------------------------------------------------
export const get_c_usuarios = async (req, res, next) => {
  try {
    const rows = await get_usuarios();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const get_c_usuarios_id = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const rows = await get_usuarios_id(id);

    if (!rows || rows.length == 0) {
      throwError(errors.usuario_no_encontrado);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post---------------------------------------------------------
export const crear_c_usuario = async (req, res, next) => {
  try {
    const data = req.body;

    const parseU = crear_usuario_schema.safeParse(data);
    if (!parseU.success) {
      return next(zodValidationError(parseU.error));
    }

    const emailExiste = await get_usuario_email(parseU.data.email);
    if (emailExiste) {
      throwError(errors.usuario_email_duplicado);
    }

    const usernameExiste = await get_nombre_de_usuario(parseU.data.nombre_usuario);
    if (usernameExiste) {
      throwError(errors.usuario_duplicado);
    }

    const hashedPassword = await bcrypt.hash(parseU.data.password, 8);
    const userData = { ...parseU.data, password_hash: hashedPassword };
    const rows = await crear_usuario(userData);
    return res.status(201).json(rows);
  } catch (error) {
    next(error);
  }
};

// delete (borrado lógico) --------------------------------------
export const eliminar_c_usuario = async (req, res, next) => {
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

//put------------------------------------------------------
export const actualizar_usuario = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!uuidRegex.test(id)) {
      throwError(errors.invalidData);
    }

    const data = req.body;
    const parseU = actualizar_usuario_schema.safeParse(data);

    if (!parseU.success) {
      return next(zodValidationError(parseU.error));
    }

    // OBTENEMOS EL USUARIO ACTUAL PRIMERO
    const usuarioActualArray = await get_usuarios_id(id);
    if (!usuarioActualArray || usuarioActualArray.length === 0) {
      throwError(errors.usuario_no_encontrado);
    }
    const usuarioActual = usuarioActualArray[0];

    // VERIFICAMOS DUPLICADOS SOLO SI EL CAMPO CAMBIÓ Y SE ENVÍA
    if (data.email && data.email !== usuarioActual.email) {
      const emailExiste = await get_usuario_email(data.email);
      if (emailExiste) throwError(errors.usuario_email_duplicado);
    }

    if (data.nombre_usuario && data.nombre_usuario !== usuarioActual.nombre_usuario) {
      const usernameExiste = await get_nombre_de_usuario(data.nombre_usuario);
      if (usernameExiste) throwError(errors.usuario_duplicado);
    }

    // Construimos los datos a actualizar (actualización parcial)
    const userData = { ...data };
    delete userData.password;
    // HASHEAMOS LA CONTRASEÑA SOLO SI SE ENVÍA UNA NUEVA, SI NO LA DEJAMOS INTACTA
    if (data.password) {
      userData.password_hash = await bcrypt.hash(data.password, 8);
    }

    const rows = await actualizar_usuario_id(id, userData);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
