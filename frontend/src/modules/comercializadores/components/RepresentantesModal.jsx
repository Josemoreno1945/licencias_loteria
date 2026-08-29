import React, { useState, useEffect, useCallback } from 'react'
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
  CInputGroup,
  CInputGroupText,
  CForm,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilAddressBook, cilBriefcase } from '@coreui/icons'
import axiosInstance from '../../../api/axiosInstance'
import { extractErrorMessage } from '../../../utils/errorHandler'
import FeedbackModal from '../../../components/FeedbackModal'

const RepresentantesModal = ({ visible, comercializador, user, onClose, onRepresentanteCreado }) => {
  const [representantes, setRepresentantes] = useState([])
  const [loadingReps, setLoadingReps] = useState(false)
  const [errorReps, setErrorReps] = useState(null)

  const [addRepModal, setAddRepModal] = useState(false)
  const [parentVisible, setParentVisible] = useState(true)
  const [personas, setPersonas] = useState([])
  const [repFormData, setRepFormData] = useState({ id_persona: '', cargo: '', estado: 'activo' })
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, type: '', message: '' })

  const handleVerRepresentantes = useCallback(async () => {
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
  }, [comercializador])

  useEffect(() => {
    if (visible && comercializador) {
      handleVerRepresentantes()
    }
  }, [visible, comercializador, handleVerRepresentantes])

  const handleAbrirAgregarRep = async () => {
    if (!comercializador) return
    setRepFormData({
      id_persona: '',
      cargo: '',
      estado: 'activo',
      id_comercializador: comercializador.id_comercializadores,
    })
    // Ocultar el modal padre mientras se abre el de asignación (evita solapamiento)
    setParentVisible(false)
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
      }
      await axiosInstance.post('/representantes', payload)
      setFeedbackModal({ visible: true, type: 'success', message: 'Representante asignado exitosamente.' })
      setAddRepModal(false)
      setParentVisible(true)
      const res = await axiosInstance.get(`/representantes/comercializador/${repFormData.id_comercializador}`)
      setRepresentantes(res.data || [])
      onRepresentanteCreado?.()
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al asignar el representante.')
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
        visible={visible && parentVisible}
        onClose={onClose}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilPeople} className="me-2" />
            Representantes — {comercializador?.razon_social}
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
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={addRepModal} onClose={() => { setAddRepModal(false); setParentVisible(true) }} alignment="center" backdrop="static" keyboard={false}>
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
            <CButton color="secondary" variant="outline" onClick={() => { setAddRepModal(false); setParentVisible(true) }}>
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

export default RepresentantesModal
