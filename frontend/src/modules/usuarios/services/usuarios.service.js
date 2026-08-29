import axiosInstance from '../../../api/axiosInstance'

export const createUsuario = async (data) => {
  const { data: response } = await axiosInstance.post('/usuarios', data)
  return response
}

export const getUsuarios = async () => {
  const { data } = await axiosInstance.get('/usuarios')
  return data
}

export const getUsuarioById = async (id) => {
  const { data } = await axiosInstance.get(`/usuarios/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const updateUsuario = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/usuarios/${id}`, updateData)
  return data
}
