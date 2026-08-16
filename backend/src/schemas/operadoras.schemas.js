import { z } from "zod";

// 1. Esquema base con lo que comparten POST y PUT
const base_operadora_schema = z.object({
  rif: z
    .string({ required_error: "El rif es requerido" })
    .min(1, "El rif no puede estar vacio")
    .max(20, "El rif no puede exceder los 20 caracteres"),

  razon_social: z
    .string({ required_error: "La razon social es requerida" })
    .min(1, "El campo no puede estar vacio")
    .max(200, "La razon social no puede exceder los 200 caracteres"),

  direccion_fiscal: z
    .string()
    .min(1, "La direccion no puede estar vacia")
    .optional(),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

// 2. Esquema para CREAR
export const crear_operadora_schema = base_operadora_schema;

// 3. Esquema para ACTUALIZAR (actualización parcial: nada es obligatorio)
export const actualizar_operadora_schema = base_operadora_schema.partial();
