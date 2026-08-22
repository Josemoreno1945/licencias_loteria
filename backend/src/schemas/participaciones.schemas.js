import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");
const dateStringSchema = z
  .string()
  .min(1, "La fecha es requerida")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Formato de fecha inválido (YYYY-MM-DD)",
  });

/**
 * optionalStringField — Zod v3 compatible.
 * Convierte "", null o undefined → undefined ANTES de validar el schema interno,
 * y declara el campo como opcional/nullable en el nivel externo.
 * El inner schema recibe el valor ya transformado (nunca "").
 */
const optionalStringField = (schema) =>
  z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    schema.optional().nullable(), // ← .optional() en el inner schema (Zod v3)
  );

/**
 * optionalDateField — igual patrón: convierte vacíos a undefined antes de validar.
 */
const optionalDateField = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  dateStringSchema.optional().nullable(), // ← corrección Zod v3
);

/**
 * optionalUuidField — igual patrón para UUIDs opcionales.
 */
const optionalUuidField = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  uuidSchema.optional().nullable(), // ← corrección Zod v3
);

const optionalUuidArrayField = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.array(uuidSchema).optional().nullable(),
);

const base_participacion_schema = z.object({
  id_documento: uuidSchema,

  nro_archivo: z
    .string({ required_error: "El numero de archivo es requerido" })
    .min(1, "El numero de archivo no puede estar vacio")
    .max(30, "El numero de archivo no puede exceder los 30 caracteres"),

  id_persona: optionalUuidField,

  id_comercializador: optionalUuidField,

  id_licencia: optionalUuidField,

  id_autorizacion_previa: optionalUuidField,

  tipo: z.enum(["Archivo", "Certificacion", "Rectificacion", "Nulidad"], {
    required_error: "El tipo de participacion es requerido",
  }),

  numero_lot: optionalStringField(
    z.string().max(30, "El numero_lot no puede exceder los 30 caracteres"),
  ),

  fecha_solicitud: optionalDateField,

  territorio: optionalStringField(
    z.string().max(200, "El territorio no puede exceder los 200 caracteres"),
  ),

  observaciones: optionalStringField(
    z.string().max(500, "Las observaciones no pueden exceder los 500 caracteres"),
  ),

  representantes: optionalUuidArrayField,
});

export const actualizar_participacion_schema = base_participacion_schema.omit({
  id_documento: true,
}).partial();

/**
 * Schema para la emisión (alta) de una participación.
 * Reproduce el patrón de emitir_licencia_schema: crea el documento
 * emitido, el pago y el detalle de participaciones de forma transaccional.
 * id_persona e id_comercializador se obtienen de la solicitud asociiada.
 */
export const emitir_participacion_schema = z.object({
  id_solicitud: uuidSchema,

  emitido_por: uuidSchema,

  tipo_emision: z
    .enum(["Inscripcion", "Renovacion"])
    .optional()
    .default("Inscripcion"),

  id_documento_anterior: optionalUuidField,

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
    .optional()
    .default("vigente"),

  fecha_expedicion: dateStringSchema,

  fecha_vencimiento: optionalDateField,

  direccion_establecimiento: optionalStringField(
    z.string().min(1, "La direccion no puede estar vacia"),
  ),

  detalles_extra: optionalStringField(
    z
      .string()
      .max(500, "Las observaciones no pueden exceder los 500 caracteres"),
  ),

  nro_archivo: z
    .string({ required_error: "El numero de archivo es requerido" })
    .min(1, "El numero de archivo no puede estar vacio")
    .max(30, "El numero de archivo no puede exceder los 30 caracteres"),

  id_licencia: optionalUuidField,

  id_autorizacion_previa: optionalUuidField,

  tipo: z.enum(["Archivo", "Certificacion", "Rectificacion", "Nulidad"], {
    required_error: "El tipo de participacion es requerido",
  }),

  numero_lot: optionalStringField(
    z.string().max(30, "El numero_lot no puede exceder los 30 caracteres"),
  ),

  fecha_solicitud: optionalDateField,

  territorio: optionalStringField(
    z.string().max(200, "El territorio no puede exceder los 200 caracteres"),
  ),

  observaciones: optionalStringField(
    z.string().max(500, "Las observaciones no pueden exceder los 500 caracteres"),
  ),

  representantes: optionalUuidArrayField,

  pago: z.object({
    id_banco: uuidSchema,
    num_referencia: z
      .string()
      .min(1, "El numero de referencia es requerido")
      .max(50, "El numero de referencia no puede exceder los 50 caracteres"),
    fecha_pago: dateStringSchema,
    monto: z.number().positive("El monto debe ser mayor a cero"),
    tasa_dia: z.number().positive("La tasa del dia debe ser mayor a cero"),
    responsable_texto: z
      .string()
      .max(200, "El responsable no puede exceder los 200 caracteres")
      .optional()
      .nullable(),
    observaciones: z
      .string()
      .min(1, "Las observaciones no pueden estar vacias")
      .optional()
      .nullable(),
  }),
});
