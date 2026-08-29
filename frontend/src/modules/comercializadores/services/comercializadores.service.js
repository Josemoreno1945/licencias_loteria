import axiosInstance from '../../../api/axiosInstance'

export const createComercializador = async (data) => {
  const { data: response } = await axiosInstance.post('/comercializadores', data)
  return response
}

export const getComercializadores = async () => {
  const { data } = await axiosInstance.get('/comercializadores')
  return data
}

export const getComercializadorById = async (id) => {
  const { data } = await axiosInstance.get(`/comercializadores/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const updateComercializador = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/comercializadores/${id}`, updateData)
  return data
}

export const getComercializadoresActivos = async () => {
  const { data } = await axiosInstance.get('/comercializadores/activos')
  return data
}
