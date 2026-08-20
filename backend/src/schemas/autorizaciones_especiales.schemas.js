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

export const actualizar_autorizacion_especial_schema = base_autorizacion_especial_schema.omit({
  id_documento: true,
});

/**
 * Schema para la emisión (alta) de una autorización especial.
 * Reproduce el patrón de emitir_licencia_schema: crea el documento
 * emitido, el pago y el detalle de autorizaciones_especiales de forma transaccional.
 */
export const emitir_autorizacion_especial_schema = z.object({
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

  nro_mesa: z
    .number({ required_error: "El numero de mesa es requerido" })
    .int("El numero de mesa debe ser entero")
    .positive("El numero de mesa debe ser positivo"),

  id_centro: optionalUuidField,

  agencia_texto: z
    .string()
    .max(200, "La agencia no puede exceder los 200 caracteres")
    .optional()
    .nullable(),

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
