import axiosInstance from "../../../api/axiosInstance";

export const emitirAutorizacion = async (payload) => {
  const resp = await axiosInstance.post("/autorizaciones-especiales/emitir", payload);
  return resp.data;
};

export const getSolicitudesAutorizacion = async () => {
  const { data } = await axiosInstance.get("/solicitudes/por-tipo/Autorizacion_especial");
  return data;
};

export const getCentrosApuestaActivos = async () => {
  const { data } = await axiosInstance.get("/centros_apuesta/activos");
  return data;
};

export const getBancos = async () => {
  const { data } = await axiosInstance.get("/bancos");
  return data;
};
