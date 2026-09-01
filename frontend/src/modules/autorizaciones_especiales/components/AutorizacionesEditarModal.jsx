import { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CAlert,
} from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../../components/FeedbackModal'
import AutorizacionesForm from './AutorizacionesForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const AutorizacionesEditarModal = ({ idAutorizacion, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null)
  
  const [solicitudes, setSolicitudes] = useState([])
  const [bancos, setBancos] = useState([])

  const [loadingData, setLoadingData] = useState(false)
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [errorData, setErrorData] = useState(null)

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: '',
    message: '',
  })

  useEffect(() => {
    if (!idAutorizacion) return

    const cargarDatos = async () => {
      setLoadingData(true)
      setLoadingDeps(true)
      setErrorData(null)
      setFormData(null)

      try {
        const [resAutorizacion, resSolicitudes, resBancos] = await Promise.all([
          axiosInstance.get(`/autorizaciones-especiales/${idAutorizacion}`),
          axiosInstance.get('/solicitudes/por-tipo/Autorizacion_especial'),
          axiosInstance.get('/bancos'),
        ])

        const autorizacion = Array.isArray(resAutorizacion.data)
          ? resAutorizacion.data[0]
          : resAutorizacion.data

        setFormData({
          id_solicitud:              autorizacion.id_solicitud || '',
          tipo:                      autorizacion.tipo || 'Mesa',
          numero_documento:          autorizacion.numero_documento || '',
          papel_seguridad:           autorizacion.papel_seguridad || '',
          tipo_emision:              autorizacion.tipo_emision || 'Inscripcion',
          id_documento_anterior:     autorizacion.id_documento_anterior || '',
          fecha_expedicion:          autorizacion.fecha_expedicion ? autorizacion.fecha_expedicion.slice(0, 10) : '',
          fecha_vencimiento:         autorizacion.fecha_vencimiento ? autorizacion.fecha_vencimiento.slice(0, 10) : '',
          direccion_establecimiento: autorizacion.direccion_establecimiento || '',
          detalles_extra:            autorizacion.detalles_extra || '',
          nro_mesa:                  autorizacion.nro_mesa || '',
          id_centro:                 autorizacion.id_centro || '',
          agencia_texto:             autorizacion.agencia_texto || '',
          numero_lot:                autorizacion.numero_lot || '',
          direccion_centro_asignado: autorizacion.direccion_centro_asignado || '',
          direccion_localidad:       autorizacion.direccion_localidad || '',
          direccion_responsable:     autorizacion.direccion_responsable || '',
          
          id_banco:           '',
          num_referencia:     autorizacion.pago_numero_referencia || '',
          monto:              autorizacion.pago_monto || '',
          tasa_dia:           autorizacion.pago_tasa_dia || '',
          fecha_pago:         autorizacion.pago_fecha_pago ? autorizacion.pago_fecha_pago.slice(0, 10) : '',
          responsable_texto:  autorizacion.pago_responsable || '',
          observaciones_pago: autorizacion.pago_observaciones || '',
        })

        setSolicitudes(resSolicitudes.data || [])
        setBancos(resBancos.data || [])
      } catch (err) {
        const msg = extractErrorMessage(err, 'Error al cargar los datos de la autorización especial')
        setErrorData(msg)
      } finally {
        setLoadingData(false)
        setLoadingDeps(false)
      }
    }

    cargarDatos()
  }, [idAutorizacion])

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
    if (!formData) return

    setFeedbackModal({
      visible: true,
      type: 'loading',
      message: 'Actualizando autorización especial...',
    })

    try {
      const payload = {}
      // En la mayoría de implementaciones, se permite actualizar ciertos campos como numero_lot, nro_mesa. 
      // Nos ajustamos a lo que el backend exponga en el PUT o enviamos solo lo actualizable.
      const editableFields = ['nro_mesa', 'agencia_texto', 'numero_lot', 'direccion_establecimiento', 'direccion_centro_asignado', 'direccion_localidad', 'direccion_responsable', 'detalles_extra']

      editableFields.forEach((key) => {
        const val = formData[key]
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val
        }
      })

      const response = await axiosInstance.put(`/autorizaciones-especiales/${idAutorizacion}`, payload)

      setFeedbackModal({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Autorización actualizada exitosamente.',
      })

      onUpdated && onUpdated()
      onClose()
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar la autorización')
      setFeedbackModal({
        visible: true,
        type: 'error',
        message: errorMsg,
      })
    }
  }

  if (!idAutorizacion) return null

  return (
    <>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idAutorizacion}
        onClose={onClose}
        alignment="center"
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Autorización Especial</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando autorización...</span>
            </div>
          )}
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
          {!loadingData && !errorData && formData && (
            <AutorizacionesForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={onClose}
              solicitudes={solicitudes}
              bancos={bancos}
              loadingDeps={loadingDeps}
              isEditMode
            />
          )}
        </CModalBody>

        <CModalFooter className="d-none" />
      </CModal>
    </>
  )
}

export default AutorizacionesEditarModal
