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

  // Opcional: no todos los registros tienen dirección fiscal en la primera carga
  direccion_fiscal: z
    .string()
    .max(200, "La direccion no puede exceder los 200 caracteres")
    .optional()
    .nullable(),

  // Acepta formatos venezolanos: 04141234567, 0414-123-4567, +58 414 1234567
  telefono: z
    .string()
    .regex(
      /^[\d\s\-\+\(\)]+$/,
      "El teléfono solo puede contener dígitos, espacios, guiones y el signo +",
    )
    .min(7, "El teléfono debe tener al menos 7 caracteres")
    .max(20, "El teléfono no puede exceder los 20 caracteres")
    .optional()
    .nullable(),

  email: z.string().email("Solo email valido").optional().nullable(),
});

// 2. Esquema para ACTUALIZAR (todos los campos opcionales -> actualización parcial)
export const actualizar_persona_schema = persona_schema.partial();
