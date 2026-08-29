import { useState, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import { createSolicitud } from '../services/solicitudes.service'
import FeedbackModal from '../../../components/FeedbackModal'
import SolicitudesForm from '../components/SolicitudesForm'
import { useAuth } from '../../auth/store/AuthContext'
import { extractErrorMessage } from '../../../utils/errorHandler'

const INITIAL_FORM = {
  id_persona: '',
  id_comercializador: null,
  id_centro: null,
  tipo_tramite: '',
  categoria_licencia: null,
  tipo_emision: null,
  tipo_participacion: null,
  tipo_autorizacion_especial: null,
  numero_autorizacion_conalot: null,
  fecha_emision_conalot: null,
  fecha_vencimiento_conalot: null,
  numero_licencia_loteriatachira: null,
  direccion_autorizacion_especial: null,
  id_juegos: [],
  descripcion_tramite: '',
  observaciones: '',
}

const SolicitudesRegistroView = () => {
  const { user } = useAuth()

  const [formData, setFormData] = useState(INITIAL_FORM)

  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
    message: '',
  })

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const next = { ...prev, [name]: value || null }

      if (name === 'tipo_tramite') {
        next.categoria_licencia = null
        next.tipo_emision = null
        next.tipo_participacion = null
        next.tipo_autorizacion_especial = null
        next.numero_autorizacion_conalot = null
        next.fecha_emision_conalot = null
        next.fecha_vencimiento_conalot = null
        next.numero_licencia_loteriatachira = null
        next.direccion_autorizacion_especial = null
        next.id_juegos = []
      }

      if (name === 'id_comercializador') {
        next.id_centro = null
        next.id_persona = ''
      }

      return next
    })
  }, [])

  const handleJuegosChange = useCallback((nuevosJuegos) => {
    setFormData((prev) => ({ ...prev, id_juegos: nuevosJuegos }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando solicitud...',
    })

    try {
      const payload = {
        ...formData,
        registrado_por: user?.id_usuario,
        id_comercializador: formData.id_comercializador || null,
        id_centro: formData.id_centro || null,
        categoria_licencia: formData.categoria_licencia || null,
        tipo_emision: formData.tipo_emision || null,
        tipo_participacion: formData.tipo_participacion || null,
        tipo_autorizacion_especial: formData.tipo_autorizacion_especial || null,
        numero_autorizacion_conalot: formData.numero_autorizacion_conalot || null,
        fecha_emision_conalot: formData.fecha_emision_conalot || null,
        fecha_vencimiento_conalot: formData.fecha_vencimiento_conalot || null,
        numero_licencia_loteriatachira: formData.numero_licencia_loteriatachira || null,
        direccion_autorizacion_especial: formData.direccion_autorizacion_especial || null,
        descripcion_tramite: formData.descripcion_tramite || null,
        observaciones: formData.observaciones || null,
      }

      const response = await createSolicitud(payload)

      setModalState({
        visible: true,
        type: 'success',
        message: response?.message || 'Solicitud registrada exitosamente.',
      })

      setFormData(INITIAL_FORM)
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar la solicitud.')
      setModalState({
        visible: true,
        type: 'error',
        message: errorMsg,
      })
    }
  }

  return (
    <CContainer fluid>
      <FeedbackModal
        visible={modalState.visible}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, visible: false }))}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0">
          <h4 className="mb-2 text-primary">Registro de Solicitud</h4>
          <p className="text-muted small mb-3">
            Seleccione el tipo de trámite y complete los datos. Los campos del Comercializador y
            Centro de Apuesta se autocompletan automáticamente al seleccionarlos.
          </p>
        </CCardHeader>
        <CCardBody>
          <SolicitudesForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleJuegosChange={handleJuegosChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default SolicitudesRegistroView
