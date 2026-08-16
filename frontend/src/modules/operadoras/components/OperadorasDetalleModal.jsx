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

const OperadorasDetalleModal = ({ idOperadora, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idOperadora) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/operadoras/${idOperadora}`)
        setData(Array.isArray(res.data) ? res.data[0] : res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle de la operadora')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idOperadora])

  if (!idOperadora) return null

  return (
    <CModal visible={!!idOperadora} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle de la Operadora</CModalTitle>
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
            <h5 className="text-primary fw-semibold mb-3">Información de la Operadora</h5>
            <CRow className="gy-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">RIF</CFormLabel>
                <CFormInput type="text" value={data.rif || ''} readOnly className="bg-light fw-semibold" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Estado</CFormLabel>
                <div>
                  <CBadge color={data.estado === 'activo' ? 'success' : 'secondary'} className="fs-6 px-3 py-2">
                    {data.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </CBadge>
                </div>
              </CCol>
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Razón Social</CFormLabel>
                <CFormInput type="text" value={data.razon_social || ''} readOnly className="bg-light" />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Dirección Fiscal (Opcional)</CFormLabel>
                <CFormInput type="text" value={data.direccion_fiscal || 'No registrada'} readOnly className="bg-light" />
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

export default OperadorasDetalleModal
