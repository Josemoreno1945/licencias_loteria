import axiosInstance from '../../../api/axiosInstance'

const BASE = '/dashboard'

export const dashboardService = {
  resumen: () => axiosInstance.get(`${BASE}/resumen`).then((r) => r.data),

  proximosVencer: () =>
    axiosInstance.get(`${BASE}/proximos-vencer`).then((r) => r.data),

  licenciasPorCategoria: () =>
    axiosInstance.get(`${BASE}/licencias-por-categoria`).then((r) => r.data),

  licenciasPorEstado: () =>
    axiosInstance.get(`${BASE}/licencias-por-estado`).then((r) => r.data),

  licenciasPorTipoEmision: () =>
    axiosInstance.get(`${BASE}/licencias-por-tipo-emision`).then((r) => r.data),

  solicitudesPorEstado: () =>
    axiosInstance.get(`${BASE}/solicitudes-por-estado`).then((r) => r.data),

  solicitudesPorTipoTramite: () =>
    axiosInstance.get(`${BASE}/solicitudes-por-tipo-tramite`).then((r) => r.data),

  participacionesPorTipo: () =>
    axiosInstance.get(`${BASE}/participaciones-por-tipo`).then((r) => r.data),

  participacionesPorEstado: () =>
    axiosInstance.get(`${BASE}/participaciones-por-estado`).then((r) => r.data),

  autorizacionesPorTipo: () =>
    axiosInstance.get(`${BASE}/autorizaciones-por-tipo`).then((r) => r.data),

  autorizacionesPorEstado: () =>
    axiosInstance.get(`${BASE}/autorizaciones-por-estado`).then((r) => r.data),
}
