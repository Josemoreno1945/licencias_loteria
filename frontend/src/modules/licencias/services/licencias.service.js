import axiosInstance from "../../../api/axiosInstance";

export const emitirLicencia = async (payload) => {
  const resp = await axiosInstance.post("/licencias/emitir", payload);
  return resp.data;
};

export const getSolicitudesLicencia = async () => {
  const { data } = await axiosInstance.get("/solicitudes/por-tipo/Licencia");
  return data;
};

export const getSolicitudDetalle = async (id_solicitud) => {
  const { data } = await axiosInstance.get(`/solicitudes/${id_solicitud}`);
  return Array.isArray(data) ? data[0] : data;
};

export const getJuegosActivos = async () => {
  const { data } = await axiosInstance.get("/juegos/activas");
  return data;
};

export const getBancos = async () => {
  const { data } = await axiosInstance.get("/bancos");
  return data;
};

export const getCentrosApuestaActivos = async () => {
  const { data } = await axiosInstance.get("/centros_apuesta/activos");
  return data;
};

export const getCentrosPorComercializador = async (id_comercializador) => {
  const { data } = await axiosInstance.get(`/centros_apuesta/por-comercializador/${id_comercializador}`);
  return data;
};

export const getRepresentantes = async () => {
  const { data } = await axiosInstance.get("/representantes");
  return data;
};

export const getPermisosJuegosPorComercializador = async (id_comercializador) => {
  const { data } = await axiosInstance.get(`/permisos-juego/por-comercializador/${id_comercializador}`);
  return data;
};
