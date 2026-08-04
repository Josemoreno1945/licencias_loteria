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
