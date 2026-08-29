import axiosInstance from '../../../api/axiosInstance'

export const createSolicitud = async (data) => {
  const { data: response } = await axiosInstance.post('/solicitudes', data)
  return response
}

export const getSolicitudes = async () => {
  const { data } = await axiosInstance.get('/solicitudes')
  return data
}

export const getSolicitudById = async (id) => {
  const { data } = await axiosInstance.get(`/solicitudes/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const getSolicitudesPorTipo = async (tipo) => {
  const { data } = await axiosInstance.get(`/solicitudes/por-tipo/${tipo}`)
  return data
}
