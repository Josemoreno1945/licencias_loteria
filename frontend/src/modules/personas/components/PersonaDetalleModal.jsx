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

const PersonaDetalleModal = ({ idPersona, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idPersona) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/personas/${idPersona}`)
        setData(res.data[0]) // asumiendo que devuelve un array con 1 elemento
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle de la persona')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idPersona])

  if (!idPersona) return null

  return (
    <CModal visible={!!idPersona} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle de la Persona</CModalTitle>
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
            <h5 className="text-primary fw-semibold mb-3">Información Principal</h5>
            <CRow className="gy-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">CI / RIF</CFormLabel>
                <CFormInput type="text" value={data.ci_rif || ''} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Nombre / Razón Social</CFormLabel>
                <CFormInput type="text" value={data.razon_social || ''} readOnly className="bg-light fw-semibold" />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Tipo de Persona</CFormLabel>
                <div>
                  <CBadge color={data.tipo_persona === 'natural' ? 'info' : 'warning'} className="fs-6 px-3 py-2">
                    {data.tipo_persona === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}
                  </CBadge>
                </div>
              </CCol>
            </CRow>

            <hr className="text-muted opacity-25 my-4" />

            <h5 className="text-primary fw-semibold mb-3">Datos de Contacto</h5>
            <CRow className="gy-3 mb-2">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Teléfono</CFormLabel>
                <CFormInput type="text" value={data.telefono || 'No registrado'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Email</CFormLabel>
                <CFormInput type="text" value={data.email || 'No registrado'} readOnly className="bg-light" />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Dirección Fiscal</CFormLabel>
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

export default PersonaDetalleModal
