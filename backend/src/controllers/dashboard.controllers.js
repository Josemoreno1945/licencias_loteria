import {
  get_dashboard_resumen,
  get_dashboard_proximos_vencer,
  get_dashboard_licencias_por_categoria,
} from "../models/dashboard.models.js";
import { errors, throwError } from "../utils/errors.js";

export const get_dashboard_resumen_controller = async (req, res, next) => {
  try {
    const data = await get_dashboard_resumen();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_proximos_vencer_controller = async (req, res, next) => {
  try {
    const data = await get_dashboard_proximos_vencer();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const get_dashboard_licencias_por_categoria_controller = async (req, res, next) => {
  try {
    const data = await get_dashboard_licencias_por_categoria();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
