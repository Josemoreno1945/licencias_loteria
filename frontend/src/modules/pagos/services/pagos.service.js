import axiosInstance from "../../../api/axiosInstance";

export const createPago = async (payload) => {
  const { data } = await axiosInstance.post("/pagos", payload);
  return data;
};

export const getBancos = async () => {
  const { data } = await axiosInstance.get("/bancos/activos");
  return data;
};

export const getLicencias = async () => {
  const { data } = await axiosInstance.get("/licencias/vigentes");
  return data;
};
