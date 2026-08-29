import axiosInstance from '../../../api/axiosInstance'

export const createPersona = async (data) => {
  const { data: response } = await axiosInstance.post('/personas', data)
  return response
}

export const getPersonas = async () => {
  const { data } = await axiosInstance.get('/personas')
  return data
}

export const getPersonaById = async (id) => {
  const { data } = await axiosInstance.get(`/personas/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const updatePersona = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/personas/${id}`, updateData)
  return data
}
