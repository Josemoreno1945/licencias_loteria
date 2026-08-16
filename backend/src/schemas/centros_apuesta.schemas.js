import { z } from "zod";

// 1. Esquema base con lo que comparten POST y PUT
const base_centros_apuesta_schema = z.object({
  nombre_agencia: z
    .string({ required_error: "El nombre de la agencia es requerido" })
    .min(1, "El nombre de la agencia no puede estar vacio")
    .max(200, "El nombre de la agencia no puede exceder los 200 caracteres"),

  direccion: z
    .string()
    .min(1, "La direccion no puede estar vacia")
    .optional(),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

// 2. Esquema para CREAR
export const crear_centros_apuesta_schema = base_centros_apuesta_schema;

// 3. Esquema para ACTUALIZAR (actualización parcial: nada es obligatorio)
export const actualizar_centros_apuesta_schema = base_centros_apuesta_schema.partial();
