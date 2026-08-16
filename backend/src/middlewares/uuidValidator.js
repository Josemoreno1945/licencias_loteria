import { isValidUUID } from "../utils/validators.js";
import { errors } from "../utils/errors.js";

/**
 * Construye un error 400 con la misma forma que `throwError(errors.invalidData)`,
 * pero devuelta como objeto para `next(err)`. Se evita lanzar (throw) dentro de un
 * callback de `router.param`, ya que no todos los flujos de Express garantizan
 * capturar ese throw y derivarlo en el errorHandler.
 */
const invalidUuidError = () => {
  const err = new Error(errors.invalidData.message);
  err.status = errors.invalidData.status;
  err.errors = [{ message: errors.invalidData.message }];
  return err;
};

/**
 * Validador de UUID reutilizable para parámetros de ruta.
 *
 * Uso recomendado (capa de ruta) — reemplaza la validación inline repetida
 * en cada controlador:
 *
 *   router.param("id", validateUuidParam);
 *
 * Rechaza con 400 (errors.invalidData) cualquier valor que no sea un UUID válido,
 * antes de que llegue al handler.
 */
export const validateUuidParam = (req, res, next, value) => {
  if (isValidUUID(value)) {
    return next();
  }
  return next(invalidUuidError());
};

/**
 * Variante como middleware clásico: valida `req.params.id` directamente.
 * Útil para cadenas de middleware explícitas:
 *   router.get("/x/:id", verifyToken, uuidValidator, handler)
 */
export const uuidValidator = (req, res, next) => {
  if (isValidUUID(req.params.id)) {
    return next();
  }
  return next(invalidUuidError());
};

export default uuidValidator;
