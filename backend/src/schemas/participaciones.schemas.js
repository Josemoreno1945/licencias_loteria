import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const base_participacion_schema = z.object({
  id_documento: uuidSchema,

  nro_archivo: z
    .string({ required_error: "El numero de archivo es requerido" })
    .min(1, "El numero de archivo no puede estar vacio")
    .max(30, "El numero de archivo no puede exceder los 30 caracteres"),

  id_persona: uuidSchema,

  id_representante: uuidSchema.optional().nullable(),

  id_comercializador: uuidSchema,

  id_licencia: uuidSchema,
});

export const crear_participacion_schema = base_participacion_schema;

export const actualizar_participacion_schema = base_participacion_schema.omit({ id_documento: true });
