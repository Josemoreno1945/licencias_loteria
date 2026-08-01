import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido");

export const crear_documento_juego_schema = z.object({
  id_documento: uuidSchema,

  id_juego: uuidSchema,
});
