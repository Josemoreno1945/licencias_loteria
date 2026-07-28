import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { get_usuario_para_login } from "../models/auth.models.js";
import { crear_usuario } from "../models/usuarios.models.js";
import { get_usuario_email, get_nombre_de_usuario } from "../models/usuarios.models.js";

import { JWT_SECRET } from "../config.js";
import { errors, throwError } from "../utils/errors.js";
import { login_schema } from "../schemas/auth.schemas.js";
import { crear_usuario_schema } from "../schemas/usuarios.schemas.js";

// ---------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    // 1. Validar body con Zod
    const parseResult = login_schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    const { email, password } = parseResult.data;

    // 2. Buscar el usuario en la BD (con password_hash)
    const usuario = await get_usuario_para_login(email);
    if (!usuario) {
      // No revelamos si el email existe o no (seguridad)
      throwError(errors.InvalidPassword);
    }

    // 3. Verificar que el usuario esté activo
    if (usuario.estado !== "activo") {
      throwError(errors.InvalidPassword);
    }

    // 4. Comparar contraseña ingresada contra el hash almacenado
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      throwError(errors.InvalidPassword);
    }

    // 5. Generar el JWT
    const payload = {
      id_usuario:     usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      rol:            usuario.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    // 6. Responder con el token y datos básicos del usuario
    return res.status(200).json({
      message: "Login exitoso",
      token,
      usuario: {
        id_usuario:     usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        email:          usuario.email,
        rol:            usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// POST /auth/register
// Registra un usuario nuevo y devuelve su token directamente.
// (El admin también puede crear usuarios vía POST /usuarios)
// ---------------------------------------------------------------
export const register = async (req, res, next) => {
  try {
    // 1. Validar body con Zod (mismo esquema que crear usuario)
    const parseResult = crear_usuario_schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    const data = parseResult.data;

    // 2. Verificar duplicados
    const emailExiste = await get_usuario_email(data.email);
    if (emailExiste) throwError(errors.usuario_email_duplicado);

    const usernameExiste = await get_nombre_de_usuario(data.nombre_usuario);
    if (usernameExiste) throwError(errors.usuario_duplicado);

    // 3. Hashear contraseña
    const password_hash = await bcrypt.hash(data.password, 8);
    const userData = { ...data, password_hash };

    // 4. Insertar en BD
    const rows = await crear_usuario(userData);
    const nuevoUsuario = rows[0];

    // 5. Generar JWT para que el usuario quede autenticado de inmediato
    const payload = {
      id_usuario:     nuevoUsuario.id_usuario,
      nombre_usuario: nuevoUsuario.nombre_usuario,
      rol:            nuevoUsuario.rol,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      usuario: {
        id_usuario:     nuevoUsuario.id_usuario,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        email:          nuevoUsuario.email,
        rol:            nuevoUsuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /auth/me  (ruta protegida de ejemplo)
// Devuelve el perfil del usuario autenticado según el JWT.
// ---------------------------------------------------------------
export const me = async (req, res, next) => {
  try {
    // req.user viene del middleware verifyToken
    return res.status(200).json({ usuario: req.user });
  } catch (error) {
    next(error);
  }
};
