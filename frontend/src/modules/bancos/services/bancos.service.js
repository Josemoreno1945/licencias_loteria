import axiosInstance from '../../../api/axiosInstance'

export const createBanco = async (data) => {
  const { data: response } = await axiosInstance.post('/bancos', data)
  return response
}

export const getBancos = async () => {
  const { data } = await axiosInstance.get('/bancos')
  return data
}

export const getBancoById = async (id) => {
  const { data } = await axiosInstance.get(`/bancos/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const updateBanco = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/bancos/${id}`, updateData)
  return data
}
