import { z } from "zod";

// 1. Esquema base
const base_representante_schema = z.object({
  id_comercializador: z
    .string({ required_error: "El id_comercializador es requerido" })
    .uuid("Debe ser un UUID valido"),

  id_persona: z
    .string({ required_error: "El id_persona es requerido" })
    .uuid("Debe ser un UUID valido"),

  cargo: z
    .string()
    .max(100, "El cargo no puede exceder los 100 caracteres")
    .optional(),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

// 2. Esquema para ACTUALIZAR
const actualizar_representante_schema = z.object({
  cargo: z
    .string()
    .max(100, "El cargo no puede exceder los 100 caracteres")
    .optional(),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export { base_representante_schema as crear_representante_schema, actualizar_representante_schema };
