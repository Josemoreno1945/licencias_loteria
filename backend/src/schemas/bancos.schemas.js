import { z } from "zod";

// 1. Esquema base con lo que comparten POST y PUT
const bancos_schema = z.object({
  nombre: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre no puede estar vacio")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  codigo: z
    .string({ required_error: "El codigo es requerido" })
    .min(1, "El campo no puede estar vacio")
    .max(10, "El codigo no puede exceder los 10 caracteres"),

  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export { bancos_schema };

// 2. Esquema para ACTUALIZAR (actualización parcial: nada es obligatorio)
export const actualizar_bancos_schema = bancos_schema.partial();
