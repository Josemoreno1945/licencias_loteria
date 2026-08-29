import axiosInstance from '../../../api/axiosInstance'

export const createJuego = async (data) => {
  const { data: response } = await axiosInstance.post('/juegos', data)
  return response
}

export const getJuegos = async () => {
  const { data } = await axiosInstance.get('/juegos')
  return data
}

export const getJuegoById = async (id) => {
  const { data } = await axiosInstance.get(`/juegos/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const updateJuego = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/juegos/${id}`, updateData)
  return data
}

export const getJuegosActivos = async () => {
  const { data } = await axiosInstance.get('/juegos/activas')
  return data
}
