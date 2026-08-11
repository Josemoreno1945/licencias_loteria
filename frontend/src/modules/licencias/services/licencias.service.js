import axiosInstance from "../../../api/axiosInstance";

export const emitirLicencia = async (payload) => {
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

export const getBancos = async () => {
  const { data } = await axiosInstance.get("/bancos");
  return data;
};

export const getCentrosApuestaActivos = async () => {
  const { data } = await axiosInstance.get("/centros_apuesta/activos");
  return data;
};

export const getRepresentantes = async () => {
  const { data } = await axiosInstance.get("/representantes");
  return data;
};
