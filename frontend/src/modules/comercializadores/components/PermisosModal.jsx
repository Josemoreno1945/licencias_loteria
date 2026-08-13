import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
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
  CFormInput,
  CFormSelect,
  CFormLabel,
  CForm,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGamepad, cilPlus } from '@coreui/icons'
import axiosInstance from '../../../api/axiosInstance'
import { extractErrorMessage } from '../../../utils/errorHandler'
import FeedbackModal from '../../../components/FeedbackModal'

const PermisosModal = ({ visible, comercializador, user, onClose, onPermisoCreado }) => {
  const [permisos, setPermisos] = React.useState([])
  const [loadingPermisos, setLoadingPermisos] = React.useState(false)
  const [errorPermisos, setErrorPermisos] = React.useState(null)

  const [addPermisoModal, setAddPermisoModal] = React.useState(false)
  const [juegos, setJuegos] = React.useState([])
  const [permisoFormData, setPermisoFormData] = React.useState({ id_juego: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' })
  const [feedbackModal, setFeedbackModal] = React.useState({ visible: false, type: '', message: '' })

  const handleVerPermisos = React.useCallback(async () => {
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
  }, [comercializador])

  React.useEffect(() => {
    if (visible && comercializador) {
      handleVerPermisos()
    }
  }, [visible, comercializador, handleVerPermisos])

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
        fecha_fin: permisoFormData.fecha_fin || null,
        id_comercializador: comercializador.id_comercializadores,
        id_centro: null,
        nivel: 'comercializador'
      }
      await axiosInstance.post('/permisos-juego', payload)
      setFeedbackModal({ visible: true, type: 'success', message: 'Permiso asignado exitosamente.' })
      const res = await axiosInstance.get(`/permisos-juego/por-comercializador/${comercializador.id_comercializadores}`)
      setPermisos(res.data || [])
      onPermisoCreado?.()
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al asignar el permiso.')
      setFeedbackModal({ visible: true, type: 'error', message: errorMsg })
    }
  }

  return (
    <>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        size="lg"
        visible={visible}
        onClose={onClose}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilGamepad} className="me-2" />
            Permisos de Juegos — {comercializador?.razon_social}
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
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

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
    </>
  )
}

export default PermisosModal
