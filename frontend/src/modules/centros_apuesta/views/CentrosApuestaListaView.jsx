import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CForm,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGamepad, cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../auth/store/AuthContext'
import FeedbackModal from '../../../components/FeedbackModal'
import { extractErrorMessage } from '../../../utils/errorHandler'

const CentrosApuestaListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: centros, loading, error, refetch } = useFetch('/centros_apuesta')

  // --- Estado para el modal de permisos ---
  const [permisosModal, setPermisosModal] = useState({ visible: false, centro: null })
  const [permisos, setPermisos] = useState([])
  const [loadingPermisos, setLoadingPermisos] = useState(false)
  const [errorPermisos, setErrorPermisos] = useState(null)

  // --- Estado para agregar permiso ---
  const [addPermisoModal, setAddPermisoModal] = useState(false)
  const [juegos, setJuegos] = useState([])
  const [permisoFormData, setPermisoFormData] = useState({ id_juego: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' })
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, type: '', message: '' })

  // --- Funciones para Permisos ---
  const handleVerPermisos = async (centro) => {
    setPermisosModal({ visible: true, centro })
    setLoadingPermisos(true)
    setErrorPermisos(null)
    try {
      const res = await axiosInstance.get(`/permisos-juego/por-centro/${centro.id_centro}`)
      setPermisos(res.data || [])
    } catch {
      setErrorPermisos('No se pudieron cargar los permisos de juegos.')
    } finally {
      setLoadingPermisos(false)
    }
  }

  const handleAbrirAgregarPermiso = async () => {
    setPermisoFormData({ id_juego: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' })
    try {
      const res = await axiosInstance.get('/juegos/activas')
      setJuegos(res.data || [])
    } catch {
      setJuegos([])
    }
    setAddPermisoModal(true)
  }

  const handlePermisoInputChange = (e) => {
    const { name, value } = e.target
    setPermisoFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitPermiso = async (e) => {
    e.preventDefault()
    setAddPermisoModal(false)
    setFeedbackModal({ visible: true, type: 'loading', message: 'Asignando permiso de juego...' })
    try {
      const payload = {
        ...permisoFormData,
        fecha_fin: permisoFormData.fecha_fin || null, // null si esta vacio
        id_comercializador: null,
        id_centro: permisosModal.centro.id_centro,
        nivel: 'centro_apuesta'
      }
      await axiosInstance.post('/permisos-juego', payload)
      setFeedbackModal({ visible: true, type: 'success', message: 'Permiso asignado exitosamente.' })
      // Recargar permisos
      const res = await axiosInstance.get(`/permisos-juego/por-centro/${permisosModal.centro.id_centro}`)
      setPermisos(res.data || [])
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al asignar el permiso.');
      setFeedbackModal({ visible: true, type: 'error', message: errorMsg })
    }
  }

  return (
    <CContainer fluid>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      {/* Modal de Permisos de Juegos */}
      <CModal
        size="lg"
        visible={permisosModal.visible}
        onClose={() => setPermisosModal({ visible: false, centro: null })}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilGamepad} className="me-2" />
            Permisos de Juegos — {permisosModal.centro?.nombre_agencia}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingPermisos && (
            <div className="d-flex justify-content-center py-4">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando permisos...</span>
            </div>
          )}
          {errorPermisos && <CAlert color="danger">{errorPermisos}</CAlert>}
          {!loadingPermisos && !errorPermisos && (
            <>
              {permisos.length === 0 ? (
                <CAlert color="info">Este centro de apuesta no tiene juegos asignados.</CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Juego</CTableHeaderCell>
                      <CTableHeaderCell>Vigencia</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {permisos.map((p, index) => (
                      <CTableRow key={p.id_permiso_juego}>
                        <CTableDataCell className="text-muted small">{index + 1}</CTableDataCell>
                        <CTableDataCell className="fw-semibold">{p.juego_nombre || '—'}</CTableDataCell>
                        <CTableDataCell>
                          <span className="d-block small">Inicio: {new Date(p.fecha_inicio).toLocaleDateString()}</span>
                          <span className="d-block small">Fin: {p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString() : 'Sin Vencimiento'}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={p.estado === 'activo' ? 'success' : 'secondary'}>
                            {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          {user?.rol !== 'supervisor' && (
            <CButton color="primary" size="sm" onClick={handleAbrirAgregarPermiso}>
              + Asignar Juego
            </CButton>
          )}
          <CButton color="secondary" variant="outline" onClick={() => setPermisosModal({ visible: false, centro: null })}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para agregar permiso */}
      <CModal visible={addPermisoModal} onClose={() => setAddPermisoModal(false)} alignment="center" backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilPlus} className="me-2" />
            Asignar Juego a Centro
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmitPermiso}>
          <CModalBody>
            <CRow>
              <CCol md={12} className="mb-3">
                <CFormLabel>Juego</CFormLabel>
                <CFormSelect
                  name="id_juego"
                  value={permisoFormData.id_juego}
                  onChange={handlePermisoInputChange}
                  required
                >
                  <option value="">Seleccione un juego...</option>
                  {juegos.map((j) => (
                    <option key={j.id_juego} value={j.id_juego}>
                      {j.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Fecha Inicio</CFormLabel>
                <CFormInput
                  type="date"
                  name="fecha_inicio"
                  value={permisoFormData.fecha_inicio}
                  onChange={handlePermisoInputChange}
                  required
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Fecha Fin (Opcional)</CFormLabel>
                <CFormInput
                  type="date"
                  name="fecha_fin"
                  value={permisoFormData.fecha_fin}
                  onChange={handlePermisoInputChange}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Estado</CFormLabel>
                <CFormSelect name="estado" value={permisoFormData.estado} onChange={handlePermisoInputChange}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setAddPermisoModal(false)}>
              Cancelar
            </CButton>
            <CButton type="submit" color="primary">
              Asignar
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Centros de Apuesta</h4>
            <p className="text-muted small mb-3">
              Agencias físicas (puntos de venta) registradas en el sistema.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/centros-apuesta/registro')}
            >
              + Nuevo Centro
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          {/* Estado de carga */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando centros de apuesta...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <CAlert color="danger" className="d-flex align-items-center gap-2">
              <span>{error}</span>
              <CButton color="danger" variant="outline" size="sm" onClick={refetch}>
                Reintentar
              </CButton>
            </CAlert>
          )}

          {/* Tabla */}
          {!loading && !error && (
            <>
              {centros && centros.length === 0 ? (
                <CAlert color="info">No hay centros de apuesta registrados aun.</CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre Agencia</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell>Encargado</CTableHeaderCell>
                      <CTableHeaderCell>Dirección</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Juegos</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {centros && centros.map((centro, index) => (
                      <CTableRow key={centro.id_centro}>
                        <CTableDataCell className="text-muted small">
                          {index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {centro.nombre_agencia}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.comercializador_razon_social || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.persona_razon_social ? (
                            <>
                              <span className="fw-semibold">{centro.persona_ci_rif}</span>
                              <br />
                              <span className="text-muted small">{centro.persona_razon_social}</span>
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.direccion || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={centro.estado === 'activo' ? 'success' : 'secondary'}>
                            {centro.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="success"
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerPermisos(centro)}
                          >
                            <CIcon icon={cilGamepad} className="me-1" />
                            Juegos
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CentrosApuestaListaView
