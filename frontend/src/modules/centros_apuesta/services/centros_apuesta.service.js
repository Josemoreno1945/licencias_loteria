import axiosInstance from '../../../api/axiosInstance'

export const createCentroApuesta = async (data) => {
  const { data: response } = await axiosInstance.post('/centros_apuesta', data)
  return response
}

export const getCentrosApuesta = async () => {
  const { data } = await axiosInstance.get('/centros_apuesta')
  return data
}

export const getCentroApuestaById = async (id) => {
  const { data } = await axiosInstance.get(`/centros_apuesta/${id}`)
  return Array.isArray(data) ? data[0] : data
}

export const updateCentroApuesta = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/centros_apuesta/${id}`, updateData)
  return data
}

export const getCentrosApuestaActivos = async () => {
  const { data } = await axiosInstance.get('/centros_apuesta/activos')
  return data
}

export const getCentrosPorComercializador = async (id_comercializador) => {
  const { data } = await axiosInstance.get(`/centros_apuesta/por-comercializador/${id_comercializador}`)
  return data
}

export const getCentroDetalleCompleto = async (id) => {
  const { data } = await axiosInstance.get(`/centros_apuesta/${id}/detalle-completo`)
  return data
}

export const getPermisosJuegosPorComercializador = async (id_comercializador) => {
  const { data } = await axiosInstance.get(`/permisos-juego/por-comercializador/${id_comercializador}`)
  return data
}
