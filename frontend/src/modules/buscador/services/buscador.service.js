import axiosInstance from "../../../api/axiosInstance";

// Busca personas por ci_rif con paginacion y filtros opcionales
export const buscarPersonasPorCiRif = async (params = {}) => {
  const { data } = await axiosInstance.get("/buscador", {
    params: {
      ci_rif: params.ci_rif || "",
      page: params.page || 1,
      limit: params.limit || 10,
      tipo_persona: params.tipo_persona || "",
      estado_documento: params.estado_documento || "",
      categoria: params.categoria || "",
    },
  });
  return data;
};

// Obtiene el detalle completo de una persona por su id_persona
export const getDetallePersona = async (id_persona) => {
  const { data } = await axiosInstance.get(`/buscador/${id_persona}`);
  return data;
};
