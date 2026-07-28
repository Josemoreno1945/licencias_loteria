import { z } from "zod";

export const persona_schema = z.object({
  ci_rif: z
    .string()
    .min(1, "La cedula/rif no puede estar vacia")
    .max(30, "La cedula/rif no puede exceder los 30 caracteres"),

  razon_social: z
    .string()
    .min(1, "El campo no puede estar vacio")
    .max(
      100,
      "La razon social/nombre completo no puede exceder los 100 caracteres",
    ),

  tipo_persona: z.enum(["natural", "juridica"]),

  direccion_fiscal: z
    .string()
    .min(1, "La direccion no puede estar vacia")
    .max(100, "La direccion no puede exceder los 100 caracteres"),

  telefono: z
    .string()
    .regex(/^\d+$/, "El numero de telefono solo debe contener digitos")
    .min(11, "El numero de telefono solo puede tener minimo 11 caracteres")
    .max(15, "El numero de telefono solo puede tener maximo 15 caracteres"),

  email: z.string().email("Solo email valido"),
});
