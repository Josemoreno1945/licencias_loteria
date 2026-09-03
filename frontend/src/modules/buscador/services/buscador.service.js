import axiosInstance from "../../../api/axiosInstance";

export const buscarPersonasPorCiRif = async (params = {}, config = {}) => {
  const { data } = await axiosInstance.get("/buscador", {
    params: {
      ci_rif: params.ci_rif || "",
      page: params.page || 1,
      limit: params.limit || 10,
      tipo_persona: params.tipo_persona || "",
      estado_documento: params.estado_documento || "",
      categoria: params.categoria || "",
    },
    ...config,
  });
  return data;
};

export const getDetallePersona = async (id_persona) => {
  const { data } = await axiosInstance.get(`/buscador/${id_persona}`);
  return data;
};
