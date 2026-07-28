import { z } from "zod";

// 1. Esquema base con lo que comparten POST y PUT
const base_usuario_schema = z.object({
  nombre_usuario: z
    .string({ required_error: "El nombre de usuario es requerido" })
    .min(1, "El nombre de usuario no puede estar vacio")
    .max(50, "El nombre de usuario no puede exceder los 50 caracteres"),
  email: z
    .string({ required_error: "El email es requerido" })
    .email("Solo email valido"),

  rol: z.enum(["admin", "empleado"]).default("empleado"),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

// 2. Esquema para CREAR (La contraseña es OBLIGATORIA)
export const crear_usuario_schema = base_usuario_schema.extend({
  password: z
    .string({ required_error: "La contraseña es obligatoria para registrarse" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// 3. Esquema para ACTUALIZAR (La contraseña es OPCIONAL)
export const actualizar_usuario_schema = base_usuario_schema.extend({
  password: z
    .string()
    .min(6, "Si cambias la contraseña, debe tener al menos 6 caracteres")
    .optional(),
});
