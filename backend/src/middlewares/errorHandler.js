/**
 * Mapeo de códigos de error nativos de PostgreSQL a respuestas HTTP amigables.
 * Referencia: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_ERROR_MAP = {
  "23505": { status: 409, message: "Ya existe un registro con ese valor (duplicado)." },
  "23503": { status: 409, message: "No se puede completar la operación: hay una referencia a otro registro que no existe." },
  "23502": { status: 400, message: "Falta un campo obligatorio en la base de datos." },
  "23514": { status: 400, message: "El valor ingresado no cumple una restricción de integridad (check constraint)." },
  "22P02": { status: 400, message: "Formato de dato inválido (ej. UUID o número mal formado)." },
  "42703": { status: 400, message: "Error interno: columna no reconocida en la consulta." },
  "42601": { status: 500, message: "Error interno de sintaxis SQL." },
  "08006": { status: 503, message: "Error de conexión con la base de datos." },
  "08001": { status: 503, message: "Error de conexión con la base de datos." },
};

/**
 * Extrae el nombre del campo conflictivo del mensaje `detail` de PostgreSQL.
 * Ejemplo: 'Key (email)=(test@test.com) already exists.' → 'email'
 */
function extractPgConflictField(detail) {
  if (!detail) return null;
  const match = detail.match(/Key \(([^)]+)\)/);
  return match ? match[1] : null;
}

export function errorHandler(err, req, res, next) {
  // 1. Errores de validación Zod: incluye el array detallado de issues
  if (err && (err.name === "ZodError" || (Array.isArray(err.errors) && !err.code))) {
    const issues = err.errors || err.issues || [];
    console.error("[Validation Error]", issues);
    return res.status(400).json({ errors: issues });
  }

  // 2. Errores nativos de PostgreSQL (pg)
  if (err && err.code && PG_ERROR_MAP[err.code]) {
    const mapped = PG_ERROR_MAP[err.code];
    console.error(`[PostgreSQL Error ${err.code}]`, err.message, err.detail || "");

    let message = mapped.message;

    // Para duplicados (23505), intentar mostrar qué campo está duplicado
    if (err.code === "23505") {
      const field = extractPgConflictField(err.detail);
      if (field) {
        message = `Ya existe un registro con ese valor en el campo: "${field}".`;
      }
    }

    // Para FK violations (23503), intentar mostrar la tabla referenciada
    if (err.code === "23503" && err.detail) {
      const tableMatch = err.detail.match(/table "([^"]+)"/);
      if (tableMatch) {
        message = `No se puede completar la operación: el registro referenciado en "${tableMatch[1]}" no existe o está restringido.`;
      }
    }

    return res.status(mapped.status).json({ error: message });
  }

  // 3. Errores de aplicación con status explícito (throwError)
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (status >= 500) {
    console.error("[Server Error]", err);
  } else {
    console.warn(`[App Error ${status}]`, message);
  }

  res.status(status).json({ error: message });
}
