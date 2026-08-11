import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const dateStringSchema = z
  .string({ required_error: "La fecha es requerida" })
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Formato de fecha inválido (YYYY-MM-DD)",
  });

const base_pago_schema = z.object({
  id_banco: z.string().min(1, "El banco es requerido"),

  num_referencia: z
    .string({ required_error: "El numero de referencia es requerido" })
    .min(1, "El numero de referencia no puede estar vacio")
    .max(50, "El numero de referencia no puede exceder los 50 caracteres"),

  fecha_pago: dateStringSchema,

  monto: z
    .number({ required_error: "El monto es requerido" })
    .positive("El monto debe ser mayor a cero"),

  tasa_dia: z
    .number({ required_error: "La tasa del dia es requerida" })
    .positive("La tasa del dia debe ser mayor a cero"),

  responsable_texto: z
    .string()
    .max(200, "El responsable no puede exceder los 200 caracteres")
    .optional()
    .nullable(),

  id_licencia: uuidSchema.optional().nullable(),

  id_autorizacion: uuidSchema.optional().nullable(),

  id_participacion: uuidSchema.optional().nullable(),

  observaciones: z
    .string()
    .min(1, "Las observaciones no pueden estar vacias")
    .optional()
    .nullable(),

  registrado_por: uuidSchema,
});

// NOTA: Estos schemas se mantienen para referencia futura.
// La creacion y actualizacion independiente de pagos esta deshabilitada.
// Los pagos ahora se crean de forma unificada desde el modulo de Licencias
// (y en el futuro desde Autorizaciones y Participaciones).
export const crear_pago_schema = base_pago_schema;

export const actualizar_pago_schema = base_pago_schema.omit({
  registrado_por: true,
});
