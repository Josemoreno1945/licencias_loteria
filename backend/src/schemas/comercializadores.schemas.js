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
const base_comercializador_schema = z.object({
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

  telefono: z
    .string()
    .regex(/^\d+$/, "El numero de telefono solo debe contener digitos")
    .min(11, "El numero de telefono solo puede tener minimo 11 caracteres")
    .max(30, "El numero de telefono solo puede tener maximo 30 caracteres")
    .optional(),

  email: z.string().email("Solo email valido").optional(),

  estado: z.enum(["activo", "inactivo"]).default("activo"),

  representantes: z
    .array(representante_schema)
    .min(1, "Debe haber al menos un representante legal"),
});

// 2. Esquema para CREAR
export const crear_comercializador_schema = base_comercializador_schema;

// 3. Esquema para ACTUALIZAR (actualización parcial: nada es obligatorio)
export const actualizar_comercializador_schema = base_comercializador_schema.partial();
