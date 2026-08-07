import axiosInstance from "../../../api/axiosInstance";

// Busca personas cuya ci_rif coincida con el valor dado (búsqueda parcial)
export const buscarPersonasPorCiRif = async (ci_rif) => {
  const { data } = await axiosInstance.get("/buscador", {
    params: { ci_rif },
  });
  return data;
};

// Obtiene el detalle completo de una persona por su id_persona
export const getDetallePersona = async (id_persona) => {
  const { data } = await axiosInstance.get(`/buscador/${id_persona}`);
  return data;
};
