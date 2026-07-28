import { z } from "zod";

export const login_schema = z.object({
  email: z
    .string({ required_error: "El email es requerido" })
    .email("Debe ser un email válido"),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(1, "La contraseña no puede estar vacía"),
});
