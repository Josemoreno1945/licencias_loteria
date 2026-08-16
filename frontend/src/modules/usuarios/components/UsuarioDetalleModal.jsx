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

const ROLE_LABELS = {
  superAdmin: 'Super Administrador',
  gerente: 'Gerente',
  gestor_de_tramites: 'Gestor de Trámites',
  supervisor: 'Supervisor',
}

const UsuarioDetalleModal = ({ idUsuario, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idUsuario) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/usuarios/${idUsuario}`)
        setData(Array.isArray(res.data) ? res.data[0] : res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle del usuario')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idUsuario])

  if (!idUsuario) return null

  return (
    <CModal visible={!!idUsuario} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle del Usuario</CModalTitle>
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
            <h5 className="text-primary fw-semibold mb-3">Información del Usuario</h5>
            <CRow className="gy-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Nombre de Usuario</CFormLabel>
                <CFormInput type="text" value={data.nombre_usuario || ''} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Correo Electrónico</CFormLabel>
                <CFormInput type="text" value={data.email || ''} readOnly className="bg-light fw-semibold" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Rol</CFormLabel>
                <div>
                  <CBadge color={['superAdmin', 'gerente'].includes(data.rol) ? 'danger' : 'info'} className="fs-6 px-3 py-2">
                    {ROLE_LABELS[data.rol] || data.rol}
                  </CBadge>
                </div>
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Estado</CFormLabel>
                <div>
                  <CBadge color={data.estado === 'activo' ? 'success' : 'secondary'} className="fs-6 px-3 py-2">
                    {data.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </CBadge>
                </div>
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

export default UsuarioDetalleModal
