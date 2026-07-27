import {
  get_usuarios,
  get_usuarios_id,
  crear_usuario,
  eliminar_usuario_id,
  actualizar_usuario_id,
  get_nombre_de_usuario,
  get_usuario_email,
} from "../models/usuarios.models.js";

import bcrypt from "bcryptjs";
import { errors, throwError } from "../utils/errors.js";

//import userSchema from "../schemas/users.schemas.js";
//FALTA ESQUEMA DE USUARIOS

//get----------------------------------------------------------
export const get_c_usuarios = async (req, res) => {
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
    if (isNaN(id) || id < 0) {
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

    /*const parseU = userSchema.safeParse(data);
    if (!parseU.success) {
      return res.status(400).json({
        errors: parseU.error.errors,
      });
    }
    */
    const emailExiste = await get_usuario_email(data.email);
    if (emailExiste) {
      throwError(errors.usuario_email_duplicado);
    }

    const usernameExiste = await get_nombre_de_usuario(data.user_name);
    if (usernameExiste) {
      throwError(errors.usuario_duplicado);
    }

    const hashedPassword = await bcrypt.hash(data.password, 8);
    const userData = { ...data, password_hash: hashedPassword }; //puede dar error
    const rows = await crear_usuario(userData);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//delete-------------------- parado
/*
export const deleteUsers = async (req, res, next) => {
  try {
    const id = req.params.id;
    const rows = await deleteUserid(id);

    if (rows === 0) {
      throwError(errors.userNotFound);
    } else {
      return res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
};
*/

//put------------------------------------------------------
export const actualizar_usuario = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isNaN(id) || id < 0) {
      throwError(errors.invalidData);
    }
    const data = req.body;

    /*
    const parseU = userSchema.safeParse(data);
    if (!parseU.success) {
      return res.status(400).json({
        errors: parseU.error.errors,
      });
    }
    */

    const emailExiste = await get_usuario_email(data.email);
    if (emailExiste) {
      throwError(errors.usuario_email_duplicado);
    }

    const usernameExiste = await get_nombre_de_usuario(data.user_name);
    if (usernameExiste) {
      throwError(errors.usuario_duplicado);
    }

    const rows = await actualizar_usuario_id(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
