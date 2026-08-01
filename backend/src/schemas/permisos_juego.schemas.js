import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

const base_permiso_juego_schema = z.object({
  id_juego: uuidSchema,

  id_comercializador: uuidSchema.optional().nullable(),

  id_centro: uuidSchema.optional().nullable(),

  nivel: z.enum(["comercializador", "centro_apuesta"], {
    required_error: "El nivel es requerido",
  }),

  estado: z.enum(["activo", "inactivo"]).default("activo"),

  fecha_inicio: z
    .string({ required_error: "La fecha de inicio es requerida" })
    .date("Formato de fecha inválido (YYYY-MM-DD)"),

  fecha_fin: z.string().date("Formato de fecha inválido (YYYY-MM-DD)").optional().nullable(),
});

export const crear_permiso_juego_schema = base_permiso_juego_schema;

export const actualizar_permiso_juego_schema = base_permiso_juego_schema;
