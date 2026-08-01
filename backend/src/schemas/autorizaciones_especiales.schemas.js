import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const base_autorizacion_especial_schema = z.object({
  id_documento: uuidSchema,

  nro_mesa: z
    .number({ required_error: "El numero de mesa es requerido" })
    .int("El numero de mesa debe ser entero")
    .positive("El numero de mesa debe ser positivo"),

  id_persona: uuidSchema,

  id_operadora: uuidSchema,

  id_centro: uuidSchema.optional().nullable(),

  agencia_texto: z
    .string()
    .max(200, "La agencia no puede exceder los 200 caracteres")
    .optional()
    .nullable(),
});

export const crear_autorizacion_especial_schema = base_autorizacion_especial_schema;

export const actualizar_autorizacion_especial_schema = base_autorizacion_especial_schema.omit({
  id_documento: true,
});
