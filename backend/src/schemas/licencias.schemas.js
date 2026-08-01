import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const base_licencia_schema = z.object({
  id_documento: uuidSchema,

  id_persona: uuidSchema,

  id_comercializador: uuidSchema.optional().nullable(),

  categoria: z.enum(
    [
      "Operador",
      "Comercializador",
      "Centro_de_apuesta",
      "Responsable_de_programa_informatico",
    ],
    { required_error: "La categoria es requerida" }
  ),

  numero_lot: z
    .string()
    .max(30, "El numero_lot no puede exceder los 30 caracteres")
    .optional()
    .nullable(),
});

export const crear_licencia_schema = base_licencia_schema;

export const actualizar_licencia_schema = base_licencia_schema.omit({ id_documento: true });
