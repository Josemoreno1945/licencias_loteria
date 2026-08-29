import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CBadge,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'

const ComercializadoresDetalleModal = ({ idComercializador, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idComercializador) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/comercializadores/${idComercializador}/detalle-completo`)
        setData(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle del comercializador')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idComercializador])

  if (!idComercializador) return null

  return (
    <CModal visible={!!idComercializador} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle del Comercializador</CModalTitle>
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
            <h5 className="text-primary fw-semibold mb-3">Información del Comercializador</h5>
            <CRow className="gy-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">RIF</CFormLabel>
                <CFormInput type="text" value={data.rif || ''} readOnly className="bg-light fw-semibold" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Estado</CFormLabel>
                <CBadge color={data.estado === 'activo' ? 'success' : 'secondary'} className="fs-6 px-3 py-2 mt-2 d-inline-block">
                  {data.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </CBadge>
              </CCol>
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Razón Social</CFormLabel>
                <CFormInput type="text" value={data.razon_social || ''} readOnly className="bg-light" />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Dirección Fiscal (Opcional)</CFormLabel>
                <CFormInput type="text" value={data.direccion_fiscal || 'No registrada'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Teléfono (Opcional)</CFormLabel>
                <CFormInput type="text" value={data.telefono || 'No registrado'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Correo Electrónico (Opcional)</CFormLabel>
                <CFormInput type="text" value={data.email || 'No registrado'} readOnly className="bg-light" />
              </CCol>
            </CRow>

            <h5 className="text-primary fw-semibold mb-3">Representante Legal</h5>
            <div className="bg-light rounded-3 border p-2 mb-4">
              {data.representantes && data.representantes.length > 0 ? (
                <CListGroup flush>
                  {data.representantes.map((rep, idx) => (
                    <CListGroupItem
                      key={rep.id_persona || idx}
                      className="d-flex justify-content-between align-items-center bg-light border-0 border-bottom"
                    >
                      <div className="d-flex flex-column">
                        <span className="fw-semibold">{rep.razon_social || '—'}</span>
                        <span className="text-muted small">{rep.ci_rif || ''}</span>
                      </div>
                      <CBadge color="info" className="px-3 py-1">
                        {rep.cargo || 'Sin cargo'}
                      </CBadge>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : (
                <span className="text-muted p-2 d-inline-block">No hay representantes registrados</span>
              )}
            </div>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ComercializadoresDetalleModal
