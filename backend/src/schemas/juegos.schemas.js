import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

export const juegos_schema = z.object({
  nombre: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre no puede estar vacio")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

// 2. Esquema para ACTUALIZAR (actualización parcial: nada es obligatorio)
export const actualizar_juegos_schema = juegos_schema.partial();
