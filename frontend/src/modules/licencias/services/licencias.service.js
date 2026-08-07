import axiosInstance from "../../../api/axiosInstance";

export const emitirLicencia = async (payload) => {
  // Hacemos que la petición resuelva incluso en 4xx para leer el body,
  // y normalizamos el error para que el caller tenga access a response.data
  const resp = await axiosInstance.post("/licencias/emitir", payload, {
    validateStatus: () => true,
  });

  if (resp.status >= 400) {
    const err = new Error(`Request failed with status ${resp.status}`);
    err.response = resp;
    throw err;
  }

  return resp.data;
};

export const getSolicitudesLicencia = async () => {
  const { data } = await axiosInstance.get("/solicitudes/por-tipo/Licencia");
  return data;
};

export const getJuegosActivos = async () => {
  const { data } = await axiosInstance.get("/juegos/activas");
  return data;
};
