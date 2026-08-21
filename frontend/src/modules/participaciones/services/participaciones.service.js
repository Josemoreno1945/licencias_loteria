import axiosInstance from "../../../api/axiosInstance";

export const emitirParticipacion = async (payload) => {
  const resp = await axiosInstance.post("/participaciones/emitir", payload);
  return resp.data;
};

export const getSolicitudesParticipacion = async () => {
  const { data } = await axiosInstance.get("/solicitudes/por-tipo/Participacion");
  return data;
};

export const getLicenciasVigentes = async () => {
  const { data } = await axiosInstance.get("/licencias/vigentes");
  return data;
};

export const getBancos = async () => {
  const { data } = await axiosInstance.get("/bancos");
  return data;
};

export const getRepresentantes = async () => {
  const { data } = await axiosInstance.get("/representantes");
  return data;
};

export const getRepresentantesByComercializador = async (id_comercializador) => {
  const { data } = await axiosInstance.get(`/representantes/comercializador/${id_comercializador}`);
  return data;
};

export const getComercializadoresActivos = async () => {
  const { data } = await axiosInstance.get("/comercializadores/activos");
  return data;
};

export const getDocumentosPorTipo = async (tipo) => {
  const { data } = await axiosInstance.get(`/documentos-emitidos/por-tipo/${tipo}`);
  return data;
};
