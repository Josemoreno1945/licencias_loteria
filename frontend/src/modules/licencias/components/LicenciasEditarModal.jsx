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
} from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../../components/FeedbackModal'
import LicenciasForm from './LicenciasForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const LicenciasEditarModal = ({ idLicencia, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    id_solicitud: '',
    numero_documento: '',
    papel_seguridad: '',
    tipo_emision: 'Inscripcion',
    id_documento_anterior: '',
    fecha_expedicion: '',
    fecha_vencimiento: '',
    direccion_establecimiento: '',
    detalles_extra: '',
    numero_lot: '',
    juegos: [],
    id_centro: '',
    representantes: [],
    id_banco: '',
    num_referencia: '',
    monto: '',
    tasa_dia: '',
    fecha_pago: '',
    responsable_texto: '',
    observaciones_pago: '',
  })

  const [solicitudes, setSolicitudes] = useState([])
  const [juegos, setJuegos] = useState([])
  const [juegosFiltrados, setJuegosFiltrados] = useState([])
  const [bancos, setBancos] = useState([])
  const [centrosApuesta, setCentrosApuesta] = useState([])
  const [representantes, setRepresentantes] = useState([])

  const [loadingData, setLoadingData] = useState(false)
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [errorData, setErrorData] = useState(null)
  const [errorDeps, setErrorDeps] = useState(null)

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: '',
    message: '',
  })

  useEffect(() => {
    if (!idLicencia) return

    const cargarDatos = async () => {
      setLoadingData(true)
      setLoadingDeps(true)
      setErrorData(null)
      setErrorDeps(null)

      try {
        const [resLicencia, resSolicitudes, resJuegos, resBancos, resCentros, resRepresentantes] = await Promise.all([
          axiosInstance.get(`/licencias/${idLicencia}`),
          axiosInstance.get('/solicitudes/por-tipo/Licencia'),
          axiosInstance.get('/juegos/activas'),
          axiosInstance.get('/bancos'),
          axiosInstance.get('/centros_apuesta/activos'),
          axiosInstance.get('/representantes'),
        ])

        const licencia = Array.isArray(resLicencia.data) ? resLicencia.data[0] : resLicencia.data

        setFormData({
          id_solicitud: licencia.id_solicitud || '',
          numero_documento: licencia.numero_documento || '',
          papel_seguridad: licencia.papel_seguridad || '',
          tipo_emision: licencia.tipo_emision || 'Inscripcion',
          id_documento_anterior: licencia.id_documento_anterior || '',
          fecha_expedicion: licencia.fecha_expedicion ? licencia.fecha_expedicion.slice(0, 10) : '',
          fecha_vencimiento: licencia.fecha_vencimiento ? licencia.fecha_vencimiento.slice(0, 10) : '',
          direccion_establecimiento: licencia.direccion_establecimiento || '',
          detalles_extra: licencia.detalles_extra || '',
          numero_lot: licencia.numero_lot || '',
          juegos: licencia.juegos || [],
          id_centro: licencia.id_centro || '',
          representantes: Array.isArray(licencia.representantes)
            ? licencia.representantes.map(r => r.id_persona).filter(Boolean)
            : [],
           observaciones_documento: licencia.observaciones_documento || '',
          id_banco: '',
          num_referencia: licencia.pago_numero_referencia || '',
          monto: licencia.pago_monto || '',
          tasa_dia: licencia.pago_tasa_dia || '',
          fecha_pago: licencia.pago_fecha_pago ? licencia.pago_fecha_pago.slice(0, 10) : '',
          responsable_texto: licencia.pago_responsable || '',
          observaciones_pago: licencia.pago_observaciones || '',
        })

        setSolicitudes(resSolicitudes.data || [])
        setJuegos(resJuegos.data || [])
        setJuegosFiltrados(resJuegos.data || [])
        setBancos(resBancos.data || [])
        setCentrosApuesta(resCentros.data || [])
        setRepresentantes(resRepresentantes.data || [])
      } catch (err) {
        const msg = extractErrorMessage(err, 'Error al cargar los datos de la licencia')
        setErrorData(msg)
        setErrorDeps(msg)
      } finally {
        setLoadingData(false)
        setLoadingDeps(false)
      }
    }

    cargarDatos()
  }, [idLicencia])

  const handleInputChange = (e) => {
    const { name, value, selectedOptions } = e.target
    if (e.target.multiple) {
      setFormData((prev) => ({
        ...prev,
        [name]: Array.from(selectedOptions, (option) => option.value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setFeedbackModal({
      visible: true,
      type: 'loading',
      message: 'Actualizando licencia...',
    })

    try {
      const payload = {}
      const editableFields = ['numero_lot', 'id_centro']

      editableFields.forEach((key) => {
        const val = formData[key]
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val
        }
      })

      // Representantes legales (N:M): array de UUIDs
      if (Array.isArray(formData.representantes) && formData.representantes.length > 0) {
        payload.representantes = formData.representantes
      }

      const response = await axiosInstance.put(`/licencias/${idLicencia}`, payload)

      setFeedbackModal({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Licencia actualizada exitosamente.',
      })

      onUpdated && onUpdated()
      onClose()
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar la licencia')

      setFeedbackModal({
        visible: true,
        type: 'error',
        message: errorMsg,
      })
    }
  }

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idLicencia}
        onClose={onClose}
        alignment="center"
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Licencia</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando licencia...</span>
            </div>
          )}
          {errorData && !loadingData && <CAlert color="danger">{errorData}</CAlert>}
          {!loadingData && !errorData && (
            <LicenciasForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              solicitudes={solicitudes}
              juegos={juegosFiltrados}
              bancos={bancos}
              centrosApuesta={centrosApuesta}
              representantes={representantes}
              loadingDeps={loadingDeps}
              isEditMode
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </React.Fragment>
  )
}

export default LicenciasEditarModal
