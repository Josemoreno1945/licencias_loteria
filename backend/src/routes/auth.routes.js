import { Router } from "express";
import { login, register, me } from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import loginRateLimiter from "../middlewares/loginRateLimiter.js";

const router = Router();

// Rutas públicas (sin token)
router.post("/auth/login", loginRateLimiter, login);
router.post("/auth/register", register);

// Ruta protegida: devuelve el perfil del usuario autenticado
router.get("/auth/me", verifyToken, me);

export default router;
