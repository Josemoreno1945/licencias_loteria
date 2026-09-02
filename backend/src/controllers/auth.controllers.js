import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { get_usuario_para_login } from "../models/auth.models.js";

import { JWT_SECRET } from "../config.js";
import { errors, throwError, zodValidationError } from "../utils/errors.js";
import { login_schema } from "../schemas/auth.schemas.js";

// ---------------------------------------------------------------
// Hash "dummy" pre-computado para mitigar timing attacks.
// bcrypt.compare siempre tardará ~mismo tiempo exista o no el usuario.
// ---------------------------------------------------------------
const DUMMY_HASH = bcrypt.hashSync("__no_user_dummy__", 12);

// ---------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    // 1. Validar body con Zod
    const parseResult = login_schema.safeParse(req.body);
    if (!parseResult.success) {
      return next(zodValidationError(parseResult.error));
    }

    const { email, password } = parseResult.data;

    // 2. Buscar el usuario en la BD
    const usuario = await get_usuario_para_login(email);

    // 3. Si el usuario no existe, hacer bcrypt.compare con hash dummy
    //    para igualar el tiempo de respuesta y evitar enumeración por timing.
    if (!usuario) {
      await bcrypt.compare(password, DUMMY_HASH);
      throwError(errors.InvalidPassword);
    }

    // 4. Verificar que el usuario esté activo
    if (usuario.estado !== "activo") {
      await bcrypt.compare(password, DUMMY_HASH);
      throwError(errors.InvalidPassword);
    }

    // 5. Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      throwError(errors.InvalidPassword);
    }

    // 6. Generar JWT (8h)
    const payload = {
      id_usuario:     usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      rol:            usuario.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    // 7. Responder
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
// POST /auth/register  →  ELIMINADO (sistema cerrado de 4 usuarios).
// La creación de cuentas se realiza únicamente desde el módulo
// interno de gestión de usuarios (POST /usuarios con verifyToken
// + soloAdmins). Ver backend/src/routes/auth.routes.js
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// GET /auth/me  (ruta protegida)
// ---------------------------------------------------------------
export const me = async (req, res, next) => {
  try {
    return res.status(200).json({ usuario: req.user });
  } catch (error) {
    next(error);
  }
};
