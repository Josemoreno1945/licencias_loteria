import { config } from "dotenv";

config();

const requiredEnvVars = ["DB_USER", "DB_HOST", "DB_DATABASE", "DB_PASSWORD", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missingEnvVars.join(", ")}`
  );
}

export const DB_USER = process.env.DB_USER;
export const DB_HOST = process.env.DB_HOST;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT || 5432;
export const JWT_SECRET = process.env.JWT_SECRET;

export const PORT = process.env.PORT || 4000;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
