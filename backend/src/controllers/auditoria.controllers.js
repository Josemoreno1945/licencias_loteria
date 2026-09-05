import {
  get_auditoria_resumen,
  get_auditoria_top_usuarios,
  get_auditoria_actividades,
} from "../models/auditoria.models.js";

/* ============================================================
   AUDITORÍA — Controladores
   Wrapper delgado: valida parámetros, delega al modelo y
   serializa la respuesta. Sin lógica de negocio redundante.
   ============================================================ */

const send = (res, data) => res.json(data);

export const get_auditoria_resumen_controller = async (req, res, next) => {
  try {
    send(res, await get_auditoria_resumen());
  } catch (error) {
    next(error);
  }
};

export const get_auditoria_top_usuarios_controller = async (req, res, next) => {
  try {
    send(res, await get_auditoria_top_usuarios());
  } catch (error) {
    next(error);
  }
};

export const get_auditoria_actividades_controller = async (req, res, next) => {
  try {
    const limit = req.query.limit ?? 100;
    send(res, await get_auditoria_actividades(limit));
  } catch (error) {
    next(error);
  }
};
