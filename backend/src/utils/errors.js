export function throwError(errorObj) {
  const error = new Error(errorObj.message);
  error.status = errorObj.status;
  // Attach a consistent `errors` array for clients (useful for 400s)
  if (errorObj.errors && Array.isArray(errorObj.errors)) {
    error.errors = errorObj.errors;
  } else if (errorObj.status === 400) {
    error.errors = [{ message: errorObj.message }];
  }
  throw error;
}

export function zodValidationError(zodError) {
  const issues = (zodError.issues || zodError.errors || []).map((it) => ({
    path: Array.isArray(it.path) ? it.path.join(".") : String(it.path || ""),
    message: it.message || "Validation error",
    code: it.code || null,
  }));
  const error = new Error("Validation failed");
  error.name = "ZodError";
  error.status = 400;
  error.errors = issues;
  return error;
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

  // Representantes
  representante_no_encontrado: {
    status: 404,
    message: "Representante no encontrado",
  },
  representante_duplicado: {
    status: 409,
    message: "La persona ya es representante de este comercializador",
  },

  // Operadoras
  operadora_no_encontrada: {
    status: 404,
    message: "Operadora no encontrada",
  },
  operadora_rif_duplicado: {
    status: 409,
    message: "El rif esta duplicado",
  },

  // bancos
  bancos_no_encontrada: {
    status: 404,
    message: "Banco no encontrado",
  },
  bancos_nombre_duplicado: {
    status: 409,
    message: "El nombre esta duplicado",
  },

  // centros de apuestas
  centros_apuesta_no_encontrada: {
    status: 404,
    message: "Centro de apuestas no encontrado",
  },
  centros_apuesta_nombre_duplicado: {
    status: 409,
    message: "El nombre esta duplicado",
  },

  // Juegos
  juegos_no_encontrados: {
    status: 404,
    message: "Juego no encontrado",
  },
  juegos_nombre_duplicado: {
    status: 409,
    message: "El nombre esta duplicado",
  },

  // Permisos de juego
  permiso_juego_no_encontrado: {
    status: 404,
    message: "Permiso de juego no encontrado",
  },
  permiso_juego_duplicado: {
    status: 409,
    message: "Ya existe un permiso para ese juego con ese nivel",
  },

  // Solicitudes
  solicitud_no_encontrada: {
    status: 404,
    message: "Solicitud no encontrada",
  },

  // Documentos emitidos
  documento_emitido_no_encontrado: {
    status: 404,
    message: "Documento emitido no encontrado",
  },
  documento_numero_duplicado: {
    status: 409,
    message: "El numero de documento ya esta registrado",
  },
  documento_papel_duplicado: {
    status: 409,
    message: "El papel de seguridad ya esta registrado",
  },

  // Documento juegos
  documento_juego_no_encontrado: {
    status: 404,
    message: "Relacion documento-juego no encontrada",
  },
  documento_juego_duplicado: {
    status: 409,
    message: "El juego ya esta registrado en ese documento",
  },

  // Licencias
  licencia_no_encontrada: {
    status: 404,
    message: "Licencia no encontrada",
  },
  solicitud_no_es_licencia: {
    status: 400,
    message: "La solicitud no corresponde a un tramite de Licencia",
  },
  solicitud_rechazada: {
    status: 400,
    message: "No se puede emitir una licencia para una solicitud rechazada",
  },
  solicitud_sin_categoria_licencia: {
    status: 400,
    message: "La solicitud de licencia debe tener una categoria de licencia",
  },
  solicitud_con_documento_emitido: {
    status: 409,
    message: "La solicitud ya tiene un documento emitido asociado",
  },

  // Autorizaciones especiales
  autorizacion_no_encontrada: {
    status: 404,
    message: "Autorizacion especial no encontrada",
  },

  // Participaciones
  participacion_no_encontrada: {
    status: 404,
    message: "Participacion no encontrada",
  },

  // Pagos
  pago_no_encontrado: {
    status: 404,
    message: "Pago no encontrado",
  },
  pago_referencia_duplicada: {
    status: 409,
    message: "El numero de referencia ya esta registrado",
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
    message: "Invalid data or id",
  },
};
