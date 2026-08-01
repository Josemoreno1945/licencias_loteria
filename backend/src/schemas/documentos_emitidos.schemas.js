import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

export const crear_documento_emitido_schema = z.object({
  id_solicitud: uuidSchema,

  tipo: z.enum(["Licencia", "Participacion", "Autorizacion_especial"], {
    required_error: "El tipo de documento es requerido",
  }),

  tipo_emision: z.enum(["Inscripcion", "Renovacion"]).default("Inscripcion"),

  id_documento_anterior: uuidSchema.optional().nullable(),

  numero_documento: z
    .string({ required_error: "El numero de documento es requerido" })
    .min(1, "El numero de documento no puede estar vacio")
    .max(30, "El numero de documento no puede exceder los 30 caracteres"),

  papel_seguridad: z
    .string({ required_error: "El papel de seguridad es requerido" })
    .min(1, "El papel de seguridad no puede estar vacio")
    .max(30, "El papel de seguridad no puede exceder los 30 caracteres"),

  estado_documento: z
    .enum(["vigente", "vencido", "anulado", "suspendido"])
    .default("vigente"),

  fecha_expedicion: z
    .string({ required_error: "La fecha de expedicion es requerida" })
    .date("Formato de fecha inválido (YYYY-MM-DD)"),

  fecha_vencimiento: z
    .string({ required_error: "La fecha de vencimiento es requerida" })
    .date("Formato de fecha inválido (YYYY-MM-DD)"),

  fecha_emision: z
    .string({ required_error: "La fecha de emision es requerida" })
    .date("Formato de fecha inválido (YYYY-MM-DD)"),

  fecha_entrega: z.string().date("Formato de fecha inválido (YYYY-MM-DD)").optional().nullable(),

  direccion_establecimiento: z.string().min(1, "La direccion no puede estar vacia").optional().nullable(),

  detalles_extra: z.record(z.unknown()).optional().nullable(),

  emitido_por: uuidSchema,
});

export const actualizar_documento_emitido_schema = z.object({
  estado_documento: z.enum(["vigente", "vencido", "anulado", "suspendido"], {
    required_error: "El estado del documento es requerido",
  }),

  fecha_entrega: z.string().date("Formato de fecha inválido (YYYY-MM-DD)").optional().nullable(),

  direccion_establecimiento: z.string().min(1, "La direccion no puede estar vacia").optional().nullable(),

  detalles_extra: z.record(z.unknown()).optional().nullable(),
});
