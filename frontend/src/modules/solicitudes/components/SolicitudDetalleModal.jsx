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
  CFormInput,
  CFormLabel,
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
          <div className="px-2">
            <h5 className="text-primary fw-semibold mb-3">Información del Trámite</h5>
            <CRow className="gy-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Tipo de Trámite</CFormLabel>
                <CFormInput type="text" value={data.tipo_tramite || ''} readOnly className="bg-light fw-bold" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Estado</CFormLabel>
                <div>
                  <CBadge color={getEstadoBadge(data.estado)} className="fs-6 px-3 py-2">
                    {data.estado}
                  </CBadge>
                </div>
              </CCol>

              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Categoría (si aplica)</CFormLabel>
                <CFormInput type="text" value={data.categoria_licencia || '—'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Fecha de Creación</CFormLabel>
                <CFormInput type="text" value={data.created_at ? new Date(data.created_at).toLocaleString() : '—'} readOnly className="bg-light" />
              </CCol>

              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Descripción del Trámite</CFormLabel>
                <CFormInput type="text" value={data.descripcion_tramite || '—'} readOnly className="bg-light" />
              </CCol>
            </CRow>

            <hr className="text-muted opacity-25 my-4" />

            <h5 className="text-primary fw-semibold mb-3">Asignaciones & Observaciones</h5>
            <CRow className="gy-3 mb-2">
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Persona Titular</CFormLabel>
                <CFormInput type="text" value={`${data.ci_rif} — ${data.persona}`} readOnly className="bg-light fw-semibold" />
              </CCol>
              
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Comercializador Asociado</CFormLabel>
                <CFormInput type="text" value={data.comercializador || 'Ninguno'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Operadora Asociada</CFormLabel>
                <CFormInput type="text" value={data.operadora || 'Ninguna'} readOnly className="bg-light" />
              </CCol>

              {data.estado === 'Rechazada' && data.justificacion_no_logrado && (
                <CCol md={12}>
                  <CAlert color="danger" className="mb-0 py-2">
                    <strong>Motivo del rechazo:</strong> {data.justificacion_no_logrado}
                  </CAlert>
                </CCol>
              )}

              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Observaciones Internas</CFormLabel>
                <CFormInput type="text" value={data.observaciones || 'Sin observaciones'} readOnly className="bg-light" />
              </CCol>

              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Registrado Por</CFormLabel>
                <CFormInput type="text" value={data.registrado_por || '—'} readOnly className="bg-light" />
              </CCol>
            </CRow>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default SolicitudDetalleModal
