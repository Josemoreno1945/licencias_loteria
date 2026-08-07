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

const getEstadoDocColor = (estado) => {
  switch (estado) {
    case 'vigente':    return 'success'
    case 'vencido':    return 'danger'
    case 'suspendido': return 'warning'
    case 'anulado':    return 'secondary'
    default:           return 'secondary'
  }
}

const LicenciaDetalleModal = ({ idLicencia, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idLicencia) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/licencias/${idLicencia}`)
        setData(res.data[0]) // asumiendo que devuelve un array con 1 elemento
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle de la licencia')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idLicencia])

  if (!idLicencia) return null

  return (
    <CModal visible={!!idLicencia} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle de la Licencia</CModalTitle>
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
              <p className="mb-1 text-muted small fw-semibold">Número de Documento</p>
              <p className="fw-bold fs-5">{data.numero_documento}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Estado</p>
              <CBadge color={getEstadoDocColor(data.estado_documento)}>
                {data.estado_documento}
              </CBadge>
            </CCol>

            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Categoría</p>
              <p>{data.categoria}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Tipo de Emisión</p>
              <p>{data.tipo_emision}</p>
            </CCol>

            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold">Persona Titular</p>
              <p className="mb-0 fw-bold">{data.ci_rif} — {data.persona}</p>
            </CCol>
            
            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold">Comercializador Asociado</p>
              <p className="mb-0">{data.comercializador || '—'}</p>
            </CCol>

            <CCol md={4}>
              <p className="mb-1 text-muted small fw-semibold">Fecha Emisión</p>
              <p>{data.fecha_emision ? new Date(data.fecha_emision).toLocaleDateString() : '—'}</p>
            </CCol>
            <CCol md={4}>
              <p className="mb-1 text-muted small fw-semibold">Expedición</p>
              <p>{data.fecha_expedicion ? new Date(data.fecha_expedicion).toLocaleDateString() : '—'}</p>
            </CCol>
            <CCol md={4}>
              <p className="mb-1 text-muted small fw-semibold">Vencimiento</p>
              <p className="fw-bold">{data.fecha_vencimiento ? new Date(data.fecha_vencimiento).toLocaleDateString() : '—'}</p>
            </CCol>

            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Papel de Seguridad</p>
              <p>{data.papel_seguridad}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Emitido Por (Usuario)</p>
              <p>{data.emitido_por}</p>
            </CCol>
            
            {data.direccion_establecimiento && (
              <CCol md={12}>
                <p className="mb-1 text-muted small fw-semibold">Dirección del Establecimiento</p>
                <p className="mb-0">{data.direccion_establecimiento}</p>
              </CCol>
            )}
          </CRow>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default LicenciaDetalleModal
