/**
 * Utilidades de validación compartidas para el backend.
 * Centraliza regex y helpers para evitar duplicación en controllers.
 */

/**
 * Regex para validar que el string tiene formato UUID v4.
 */
export const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Valida que un valor es un UUID válido.
 * @param {string} value - Valor a validar.
 * @returns {boolean}
 */
export const isValidUUID = (value) => {
  if (value === null || value === undefined || value === "") return false;
  return uuidRegex.test(value);
};

/**
 * Formatea una fecha a string YYYY-MM-DD usando UTC (sin problemas de timezone).
 * @param {string|Date} value - Fecha a formatear.
 * @returns {string} Fecha en formato YYYY-MM-DD.
 */
export const buildDateString = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid data or id");
  }
  return date.toISOString().slice(0, 10);
};

/**
 * Valida el formato de cédula/RIF venezolano.
 * Ejemplos válidos: V-12345678, J-12345678-9, G-1234567-8
 */
export const ciRifRegex = /^[VEJGPC]-?\d{6,8}-?\d?$/i;

;

/**
 * Valida el código BCV de banco (4 dígitos).
 */
export const bancoRegex = /^\d{4}$/;

/**
 * Valida teléfonos (máximo 30 caracteres, dígitos, +, -, paréntesis y espacios).
 */
export const telefonoRegex = /^[\+]?[\d\s\-\(\)]{7,30}$/;
