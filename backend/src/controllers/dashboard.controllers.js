import {
  get_dashboard_resumen,
  get_dashboard_proximos_vencer,
  get_dashboard_licencias_por_categoria,
  get_dashboard_licencias_por_estado,
  get_dashboard_licencias_por_tipo_emision,
  get_dashboard_solicitudes_por_estado,
  get_dashboard_solicitudes_por_tipo_tramite,
  get_dashboard_participaciones_por_tipo,
  get_dashboard_participaciones_por_estado,
  get_dashboard_autorizaciones_por_tipo,
  get_dashboard_autorizaciones_por_estado,
} from "../models/dashboard.models.js";

/* ============================================================
   Controladores del Dashboard
   Patrón: cada controlador es un wrapper delgado que delega al
   modelo. Sin imports muertos, sin lógica de negocio redundante.
   ============================================================ */

const send = (res, data) => res.json(data);

export const get_dashboard_resumen_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_resumen());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_proximos_vencer_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_proximos_vencer());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_licencias_por_categoria_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_licencias_por_categoria());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_licencias_por_estado_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_licencias_por_estado());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_licencias_por_tipo_emision_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_licencias_por_tipo_emision());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_solicitudes_por_estado_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_solicitudes_por_estado());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_solicitudes_por_tipo_tramite_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_solicitudes_por_tipo_tramite());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_participaciones_por_tipo_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_participaciones_por_tipo());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_participaciones_por_estado_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_participaciones_por_estado());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_autorizaciones_por_tipo_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_autorizaciones_por_tipo());
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_autorizaciones_por_estado_controller = async (req, res, next) => {
  try {
    send(res, await get_dashboard_autorizaciones_por_estado());
  } catch (error) {
    next(error);
  }
};
