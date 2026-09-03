import axiosInstance from "../../../api/axiosInstance";

export const getPagos = async () => {
  const { data } = await axiosInstance.get("/pagos");
  return data;
};

export const getPagoById = async (id) => {
  const { data } = await axiosInstance.get(`/pagos/${id}`);
  return Array.isArray(data) ? data[0] : data;
};