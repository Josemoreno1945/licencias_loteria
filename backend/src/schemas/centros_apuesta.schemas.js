import { z } from "zod";

// Esquema para cada representante legal
const representante_schema = z.object({
  id_persona: z
    .string({ required_error: "La persona es requerida" })
    .min(1, "La persona es requerida"),
  cargo: z
    .string()
    .max(100, "El cargo no puede exceder los 100 caracteres")
    .optional(),
});

// 1. Esquema base con lo que comparten POST y PUT
const base_centros_apuesta_schema = z.object({
  nombre_agencia: z
    .string({ required_error: "El nombre de la agencia es requerido" })
    .min(1, "El nombre de la agencia no puede estar vacio")
    .max(200, "El nombre de la agencia no puede exceder los 200 caracteres"),

  id_comercializador: z
    .string({ required_error: "El comercializador es requerido" })
    .min(1, "El comercializador es requerido"),

  direccion: z
    .string()
    .min(1, "La direccion no puede estar vacia")
    .optional(),

  estado: z.enum(["activo", "inactivo"]).default("activo"),

  representantes: z
    .array(representante_schema)
    .min(1, "Debe haber al menos un representante legal"),
});

// 2. Esquema para CREAR
export const crear_centros_apuesta_schema = base_centros_apuesta_schema;

// 3. Esquema para ACTUALIZAR (actualización parcial: nada es obligatorio)
export const actualizar_centros_apuesta_schema = base_centros_apuesta_schema.partial();
