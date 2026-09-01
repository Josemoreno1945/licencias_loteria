import axiosInstance from "../../../api/axiosInstance";

export const createSolicitud = async (data) => {
  const { data: response } = await axiosInstance.post("/solicitudes", data);
  return response;
};

export const updateSolicitud = async (id, data) => {
  const { data: response } = await axiosInstance.put(
    `/solicitudes/${id}`,
    data,
  );
  return response;
};

export const getSolicitudes = async () => {
  const { data } = await axiosInstance.get("/solicitudes");
  return data;
};

export const getSolicitudById = async (id) => {
  const { data } = await axiosInstance.get(`/solicitudes/${id}`);
  return Array.isArray(data) ? data[0] : data;
};

export const getSolicitudesPorTipo = async (tipo) => {
  const { data } = await axiosInstance.get(`/solicitudes/por-tipo/${tipo}`);
  return data;
};

export const getSolicitudesPorEstado = async (estado) => {
  const { data } = await axiosInstance.get(`/solicitudes/por-estado/${estado}`);
  return data;
};

export const getSolicitudesPorPersona = async (id) => {
  const { data } = await axiosInstance.get(`/solicitudes/por-persona/${id}`);
  return data;
};

export const getSolicitudesPorComercializador = async (id) => {
  const { data } = await axiosInstance.get(
    `/solicitudes/por-comercializador/${id}`,
  );
  return data;
};

export const getSolicitudesPorUsuario = async (id) => {
  const { data } = await axiosInstance.get(`/solicitudes/por-usuario/${id}`);
  return data;
};

export const getSolicitudesPendientes = async () => {
  const { data } = await axiosInstance.get("/solicitudes/pendientes");
  return data;
};
