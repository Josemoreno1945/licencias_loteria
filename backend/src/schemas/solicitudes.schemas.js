import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const base_solicitud_schema = z.object({
  id_persona: uuidSchema,

  id_comercializador: uuidSchema.optional().nullable(),

  tipo_tramite: z.enum(
    ["Licencia", "Participacion", "Autorizacion_especial", "Otro"],
    { required_error: "El tipo de tramite es requerido" },
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

  // Aplica cuando tipo_tramite = 'Licencia'
  tipo_emision: z.enum(["Inscripcion", "Renovacion"]).optional().nullable(),

  // Aplica cuando tipo_tramite = 'Participacion'
  numero_autorizacion_conalot: z
    .string()
    .min(1, "El número de autorización no puede estar vacío")
    .optional()
    .nullable(),

  fecha_emision_conalot: z.string().optional().nullable(),

  fecha_vencimiento_conalot: z.string().optional().nullable(),

  numero_licencia_loteriatachira: z.string().optional().nullable(),

  // Subtipo de participación
  tipo_participacion: z
    .enum(["Archivo", "Certificacion", "Rectificacion", "Nulidad"])
    .optional()
    .nullable(),

  // Aplica cuando tipo_tramite = 'Autorizacion_especial'
  tipo_autorizacion_especial: z
    .enum(["Movil", "Localidad", "Mesa"])
    .optional()
    .nullable(),

  direccion_autorizacion_especial: z.string().optional().nullable(),

  estado: z.enum(["Pendiente", "Aprobado", "Rechazada"]).default("Pendiente"),

  descripcion_tramite: z
    .string()
    .min(1, "La descripcion no puede estar vacia")
    .optional()
    .nullable(),

  observaciones: z
    .string()
    .min(1, "Las observaciones no pueden estar vacias")
    .optional()
    .nullable(),

  justificacion_no_logrado: z
    .string()
    .min(1, "La justificacion no puede estar vacia")
    .optional()
    .nullable(),

  // Juegos seleccionados (relación N:M hacia solicitud_juegos)
  id_juegos: z.array(uuidSchema).optional().default([]),

  // Centro de apuesta vinculado (relación hacia solicitud_centros)
  id_centro: uuidSchema.optional().nullable(),

  registrado_por: uuidSchema,
});

export const crear_solicitud_schema = base_solicitud_schema;

export const actualizar_solicitud_schema = base_solicitud_schema.omit({
  registrado_por: true,
});
