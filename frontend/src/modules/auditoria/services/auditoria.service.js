import axiosInstance from "../../../api/axiosInstance"

const BASE = "/auditoria"

export const auditoriaService = {
  resumen: () =>
    axiosInstance.get(`${BASE}/resumen`).then((r) => r.data),

  topUsuarios: () =>
    axiosInstance.get(`${BASE}/top-usuarios`).then((r) => r.data),

  actividades: (limit = 100) =>
    axiosInstance
      .get(`${BASE}/actividades`, { params: { limit } })
      .then((r) => r.data),
}

export default auditoriaService
