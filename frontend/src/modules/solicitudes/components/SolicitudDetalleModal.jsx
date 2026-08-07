import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'Aprobado':  return 'success'
    case 'Rechazada': return 'danger'
    case 'Pendiente': return 'warning'
    default:          return 'secondary'
  }
}

const SolicitudDetalleModal = ({ idSolicitud, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idSolicitud) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/solicitudes/${idSolicitud}`)
        setData(res.data[0])
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle de la solicitud')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idSolicitud])

  if (!idSolicitud) return null

  return (
    <CModal visible={!!idSolicitud} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle de la Solicitud</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading && (
          <div className="d-flex justify-content-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {error && !loading && <CAlert color="danger">{error}</CAlert>}
        {!loading && !error && data && (
          <CRow className="gy-3">
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Tipo de Trámite</p>
              <p className="fw-bold fs-5">{data.tipo_tramite}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Estado</p>
              <CBadge color={getEstadoBadge(data.estado)}>
                {data.estado}
              </CBadge>
            </CCol>

            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Categoría (si aplica)</p>
              <p>{data.categoria_licencia || '—'}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Fecha de Creación</p>
              <p>{data.created_at ? new Date(data.created_at).toLocaleString() : '—'}</p>
            </CCol>

            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold">Persona Titular</p>
              <p className="mb-0 fw-bold">{data.ci_rif} — {data.persona}</p>
            </CCol>
            
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Comercializador Asociado</p>
              <p className="mb-0">{data.comercializador || '—'}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Operadora Asociada</p>
              <p className="mb-0">{data.operadora || '—'}</p>
            </CCol>

            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold">Descripción del Trámite</p>
              <p className="mb-0">{data.descripcion_tramite || '—'}</p>
            </CCol>

            {data.estado === 'Rechazada' && data.justificacion_no_logrado && (
              <CCol md={12}>
                <CAlert color="danger" className="mb-0 py-2">
                  <strong>Motivo del rechazo:</strong> {data.justificacion_no_logrado}
                </CAlert>
              </CCol>
            )}

            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold">Observaciones Internas</p>
              <p className="mb-0">{data.observaciones || '—'}</p>
            </CCol>

            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold mt-2">Registrado Por</p>
              <p className="mb-0">{data.registrado_por}</p>
            </CCol>
          </CRow>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default SolicitudDetalleModal
