import { Router } from "express";
import { login, me } from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import loginRateLimiter from "../middlewares/loginRateLimiter.js";

const router = Router();

// Rutas públicas (sin token)
router.post("/auth/login", loginRateLimiter, login);

// Ruta protegida: devuelve el perfil del usuario autenticado
router.get("/auth/me", verifyToken, me);

// NOTA: el endpoint /auth/register fue eliminado por seguridad.
// Sistema cerrado — la creación de cuentas solo la realiza el
// Gerente/SuperAdmin desde el panel interno (POST /usuarios).

export default router;
