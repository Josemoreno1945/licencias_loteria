import React, { useState } from 'react'
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
  CInputGroup,
  CInputGroupText,
  CForm,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilAddressBook, cilBriefcase, cilGamepad, cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../auth/store/AuthContext'
import FeedbackModal from '../../personas/components/FeedbackModal'
import { extractErrorMessage } from '../../../utils/errorHandler'

const ComercializadoresListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: comercializadores, loading, error, refetch } = useFetch('/comercializadores')

  // --- Estado para el modal de representantes ---
  const [repModal, setRepModal] = useState({ visible: false, comercializador: null })
  const [representantes, setRepresentantes] = useState([])
  const [loadingReps, setLoadingReps] = useState(false)
  const [errorReps, setErrorReps] = useState(null)

  // --- Estado para agregar representante ---
  const [addRepModal, setAddRepModal] = useState(false)
  const [personas, setPersonas] = useState([])
  const [repFormData, setRepFormData] = useState({ id_persona: '', cargo: '', estado: 'activo' })
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, type: '', message: '' })

  // --- Estado para el modal de permisos ---
  const [permisosModal, setPermisosModal] = useState({ visible: false, comercializador: null })
  const [permisos, setPermisos] = useState([])
  const [loadingPermisos, setLoadingPermisos] = useState(false)
  const [errorPermisos, setErrorPermisos] = useState(null)

  // --- Estado para agregar permiso ---
  const [addPermisoModal, setAddPermisoModal] = useState(false)
  const [juegos, setJuegos] = useState([])
  const [permisoFormData, setPermisoFormData] = useState({ id_juego: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' })

  // Abrir modal de representantes y cargar datos
  const handleVerRepresentantes = async (comercializador) => {
    setRepModal({ visible: true, comercializador })
    setLoadingReps(true)
    setErrorReps(null)
    try {
      const res = await axiosInstance.get(`/representantes/comercializador/${comercializador.id_comercializadores}`)
      setRepresentantes(res.data || [])
    } catch {
      setErrorReps('No se pudieron cargar los representantes.')
    } finally {
      setLoadingReps(false)
    }
  }

  // Abrir modal de agregar representante y cargar personas
  const handleAbrirAgregarRep = async () => {
    setRepFormData({ id_persona: '', cargo: '', estado: 'activo' })
    try {
      const res = await axiosInstance.get('/personas')
      setPersonas(res.data || [])
    } catch {
      setPersonas([])
    }
    setAddRepModal(true)
  }

  const handleRepInputChange = (e) => {
    const { name, value } = e.target
    setRepFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitRep = async (e) => {
    e.preventDefault()
    setAddRepModal(false)
    setFeedbackModal({ visible: true, type: 'loading', message: 'Asignando representante...' })
    try {
      const payload = {
        ...repFormData,
        id_comercializador: repModal.comercializador.id_comercializadores,
      }
      await axiosInstance.post('/representantes', payload)
      setFeedbackModal({ visible: true, type: 'success', message: 'Representante asignado exitosamente.' })
      // Recargar representantes
      const res = await axiosInstance.get(`/representantes/comercializador/${repModal.comercializador.id_comercializadores}`)
      setRepresentantes(res.data || [])
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al asignar el representante.');
      setFeedbackModal({ visible: true, type: 'error', message: errorMsg })
    }
  }

  // --- Funciones para Permisos ---
  const handleVerPermisos = async (comercializador) => {
    setPermisosModal({ visible: true, comercializador })
    setLoadingPermisos(true)
    setErrorPermisos(null)
    try {
      const res = await axiosInstance.get(`/permisos-juego/por-comercializador/${comercializador.id_comercializadores}`)
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
        id_comercializador: permisosModal.comercializador.id_comercializadores,
        id_centro: null,
        nivel: 'comercializador'
      }
      await axiosInstance.post('/permisos-juego', payload)
      setFeedbackModal({ visible: true, type: 'success', message: 'Permiso asignado exitosamente.' })
      // Recargar permisos
      const res = await axiosInstance.get(`/permisos-juego/por-comercializador/${permisosModal.comercializador.id_comercializadores}`)
      setPermisos(res.data || [])
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al asignar el permiso.');
      setFeedbackModal({ visible: true, type: 'error', message: errorMsg })
    }
  }

  return (
    <CContainer fluid>
      {/* FeedbackModal global */}
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      {/* Modal de Representantes */}
      <CModal
        size="lg"
        visible={repModal.visible}
        onClose={() => setRepModal({ visible: false, comercializador: null })}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilPeople} className="me-2" />
            Representantes — {repModal.comercializador?.razon_social}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingReps && (
            <div className="d-flex justify-content-center py-4">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando representantes...</span>
            </div>
          )}
          {errorReps && <CAlert color="danger">{errorReps}</CAlert>}
          {!loadingReps && !errorReps && (
            <>
              {representantes.length === 0 ? (
                <CAlert color="info">Este comercializador no tiene representantes asignados.</CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>CI / Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Cargo</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {representantes.map((rep, index) => (
                      <CTableRow key={rep.id_c_representantes}>
                        <CTableDataCell className="text-muted small">{index + 1}</CTableDataCell>
                        <CTableDataCell>
                          <span className="fw-semibold">{rep.persona_ci_rif || '—'}</span>
                          <br />
                          <span className="text-muted small">{rep.persona_razon_social || '—'}</span>
                        </CTableDataCell>
                        <CTableDataCell>{rep.cargo || <span className="text-muted">—</span>}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={rep.estado === 'activo' ? 'success' : 'secondary'}>
                            {rep.estado === 'activo' ? 'Activo' : 'Inactivo'}
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
            <CButton color="primary" size="sm" onClick={handleAbrirAgregarRep}>
              + Asignar Representante
            </CButton>
          )}
          <CButton color="secondary" variant="outline" onClick={() => setRepModal({ visible: false, comercializador: null })}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para agregar representante */}
      <CModal visible={addRepModal} onClose={() => setAddRepModal(false)} alignment="center" backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilAddressBook} className="me-2" />
            Asignar Representante
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmitRep}>
          <CModalBody>
            <CRow>
              <CCol md={12} className="mb-3">
                <CFormLabel>Persona (Representante Legal)</CFormLabel>
                <CFormSelect
                  name="id_persona"
                  value={repFormData.id_persona}
                  onChange={handleRepInputChange}
                  required
                >
                  <option value="">Seleccione una persona...</option>
                  {personas.map((p) => (
                    <option key={p.id_persona} value={p.id_persona}>
                      {p.ci_rif} — {p.razon_social}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={8} className="mb-3">
                <CFormLabel>Cargo</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilBriefcase} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    name="cargo"
                    placeholder="Ej: Presidente, Director General"
                    value={repFormData.cargo}
                    onChange={handleRepInputChange}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={4} className="mb-3">
                <CFormLabel>Estado</CFormLabel>
                <CFormSelect name="estado" value={repFormData.estado} onChange={handleRepInputChange}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setAddRepModal(false)}>
              Cancelar
            </CButton>
            <CButton type="submit" color="primary">
              Asignar
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Modal de Permisos de Juegos */}
      <CModal
        size="lg"
        visible={permisosModal.visible}
        onClose={() => setPermisosModal({ visible: false, comercializador: null })}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilGamepad} className="me-2" />
            Permisos de Juegos — {permisosModal.comercializador?.razon_social}
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
                <CAlert color="info">Este comercializador no tiene juegos asignados.</CAlert>
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
          <CButton color="secondary" variant="outline" onClick={() => setPermisosModal({ visible: false, comercializador: null })}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para agregar permiso */}
      <CModal visible={addPermisoModal} onClose={() => setAddPermisoModal(false)} alignment="center" backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilPlus} className="me-2" />
            Asignar Juego a Comercializador
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

      {/* Tabla principal */}
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Comercializadores</h4>
            <p className="text-muted small mb-3">
              Empresas autorizadas a comercializar juegos de azar.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/comercializadores/registro')}
            >
              + Nuevo Comercializador
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando comercializadores...</span>
            </div>
          )}

          {error && !loading && (
            <CAlert color="danger" className="d-flex align-items-center gap-2">
              <span>{error}</span>
              <CButton color="danger" variant="outline" size="sm" onClick={refetch}>
                Reintentar
              </CButton>
            </CAlert>
          )}

          {!loading && !error && (
            <>
              {comercializadores && comercializadores.length === 0 ? (
                <CAlert color="info">No hay comercializadores registrados aun.</CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>RIF</CTableHeaderCell>
                      <CTableHeaderCell>Razón Social</CTableHeaderCell>
                      <CTableHeaderCell>Teléfono</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Representantes</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Juegos</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {comercializadores && comercializadores.map((com, index) => (
                      <CTableRow key={com.id_comercializadores}>
                        <CTableDataCell className="text-muted small">{index + 1}</CTableDataCell>
                        <CTableDataCell className="fw-semibold">{com.rif}</CTableDataCell>
                        <CTableDataCell>{com.razon_social}</CTableDataCell>
                        <CTableDataCell>
                          {com.telefono || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {com.email || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={com.estado === 'activo' ? 'success' : 'secondary'}>
                            {com.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerRepresentantes(com)}
                          >
                            <CIcon icon={cilPeople} className="me-1" />
                            Ver
                          </CButton>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="success"
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerPermisos(com)}
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

export default ComercializadoresListaView
