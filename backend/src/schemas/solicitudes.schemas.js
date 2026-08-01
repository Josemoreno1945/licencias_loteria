import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const base_solicitud_schema = z.object({
  id_persona: uuidSchema,

  id_comercializador: uuidSchema.optional().nullable(),

  id_operadora: uuidSchema.optional().nullable(),

  tipo_tramite: z.enum(
    ["Licencia", "Participacion", "Autorizacion_especial", "Otro"],
    { required_error: "El tipo de tramite es requerido" }
  ),

  categoria_licencia: z
    .enum([
      "Operador",
      "Comercializador",
      "Centro_de_apuesta",
      "Responsable_de_programa_informatico",
    ])
    .optional()
    .nullable(),

  estado: z.enum(["Pendiente", "Aprobado", "Rechazada"]).default("Pendiente"),

  descripcion_tramite: z.string().min(1, "La descripcion no puede estar vacia").optional().nullable(),

  observaciones: z.string().min(1, "Las observaciones no pueden estar vacias").optional().nullable(),

  justificacion_no_logrado: z
    .string()
    .min(1, "La justificacion no puede estar vacia")
    .optional()
    .nullable(),

  registrado_por: uuidSchema,
});

export const crear_solicitud_schema = base_solicitud_schema;

export const actualizar_solicitud_schema = base_solicitud_schema.omit({ registrado_por: true });
