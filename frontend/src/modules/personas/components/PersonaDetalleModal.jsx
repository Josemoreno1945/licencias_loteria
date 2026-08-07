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
          <CRow className="gy-3">
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">CI / RIF</p>
              <p className="fw-bold">{data.ci_rif}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Nombre / Razón Social</p>
              <p className="fw-bold">{data.razon_social}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Tipo de Persona</p>
              <CBadge color={data.tipo_persona === 'natural' ? 'info' : 'warning'}>
                {data.tipo_persona === 'natural' ? 'Natural' : 'Jurídica'}
              </CBadge>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Teléfono</p>
              <p>{data.telefono || '—'}</p>
            </CCol>
            <CCol md={6}>
              <p className="mb-1 text-muted small fw-semibold">Email</p>
              <p>{data.email || '—'}</p>
            </CCol>
            <CCol md={12}>
              <p className="mb-1 text-muted small fw-semibold">Dirección Fiscal</p>
              <p className="mb-0">{data.direccion_fiscal || '—'}</p>
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

export default PersonaDetalleModal
