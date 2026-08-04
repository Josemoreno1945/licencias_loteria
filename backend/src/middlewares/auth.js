import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { errors, throwError } from "../utils/errors.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(Object.assign(new Error(errors.Notoken.message), { status: errors.Notoken.status }));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id_usuario, nombre_usuario, rol, iat, exp }
    next();
  } catch (err) {
    return next(Object.assign(new Error(errors.invalidToken.message), { status: errors.invalidToken.status }));
  }
};


export const isGerente = (req, res, next) => {
  if (req.user?.rol !== "gerente" && req.user?.rol !== "superAdmin") {
    return next(Object.assign(new Error(errors.unauthorized.message), { status: errors.unauthorized.status }));
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.rol !== "superAdmin") {
    return next(Object.assign(new Error(errors.unauthorized.message), { status: errors.unauthorized.status }));
  }
  next();
};

/**
 * Middleware de roles genérico.
 * Uso: hasRole('superAdmin', 'gerente')
 * Roles disponibles: superAdmin | gerente | gestor_de_tramites | supervisor
 */
export const hasRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return next(Object.assign(new Error(errors.unauthorized.message), { status: errors.unauthorized.status }));
  }
  next();
};

/**
 * Bloquea al rol 'gestor_de_tramites' del acceso a la gestión de usuarios.
 * Roles permitidos: superAdmin y gerente.
 */
export const soloAdmins = hasRole('superAdmin', 'gerente');

/**
 * Bloquea a 'supervisor' de rutas de escritura (POST/PUT/DELETE).
 * El supervisor sólo tiene lectura.
 */
export const noSupervisorWrite = (req, res, next) => {
  const writeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (writeMethod && req.user?.rol === 'supervisor') {
    return next(Object.assign(new Error(errors.unauthorized.message), { status: errors.unauthorized.status }));
  }
  next();
};
