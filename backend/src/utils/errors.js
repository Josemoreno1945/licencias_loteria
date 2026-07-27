import { token } from "morgan";

export function throwError(errorObj) {
  const error = new Error(errorObj.message);
  error.status = errorObj.status;
  throw error;
}

export const errors = {
  // Usuarios
  usuario_no_encontrado: {
    status: 404,
    message: "Usuario no encontrado",
  },
  usuario_duplicado: {
    status: 409,
    message: "El usuario ya esta registrado",
  },
  usuario_email_duplicado: {
    status: 409,
    message: "El email ya esta registrado",
  },
  // Personas
  persona_no_encontrada: {
    status: 404,
    message: "Persona no encontrada",
  },
  persona_cedula_rif_duplicado: {
    status: 409,
    message: "La cedula/rif esta duplicado",
  },
  persona_email_duplicado: {
    status: 409,
    message: "El email ya esta registrado",
  },
  // Comercializadores
  comercializadora_no_encontrada: {
    status: 404,
    message: "Comercializadora no encontrada",
  },
  comercializadora_rif_duplicado: {
    status: 409,
    message: "El rif esta duplicado",
  },
  comercializadora_email_duplicado: {
    status: 409,
    message: "El email ya esta registrado",
  },

  //login---------------------------------------------------
  InvalidPassword: {
    status: 401,
    message: "Invalid Password",
  },

  // Errores generales de base de datos / consultas---------------------------------------------------------------

  dbConnectionError: {
    status: 503,
    message: "Database connection error",
  },
  querySyntaxError: {
    status: 400,
    message: "SQL syntax error",
  },
  foreignKeyViolation: {
    status: 409,
    message: "Foreign key constraint violation",
  },
  notNullViolation: {
    status: 400,
    message: "Null value in column violates not-null constraint",
  },
  dataTypeMismatch: {
    status: 400,
    message: "Data type mismatch in query",
  },

  rowNotFound: {
    status: 404,
    message: "No data found for the query",
  },

  //Error de autenticacion o token---------------------------------------------------------
  unauthorized: {
    status: 403,
    message: "Admin-only access",
  },
  Notoken: {
    status: 401,
    message: "No token provided",
  },
  invalidToken: {
    status: 403,
    message: "Invalid token",
  },

  // Otros errores comunes
  missingFields: {
    status: 400,
    message: "Missing required fields",
  },
  invalidData: {
    status: 400,
    message: "invalid id",
  },
};
