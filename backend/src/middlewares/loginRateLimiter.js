import rateLimit from "express-rate-limit";

/**
 * Rate limiter para login.
 * Límite: 5 intentos por minuto por IP.
 * Previene ataques de fuerza bruta.
 */
const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 intentos por ventana
  message: {
    error: "Demasiados intentos de inicio de sesión. Por favor, intenta nuevamente en un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default loginRateLimiter;
