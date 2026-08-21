import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CRow, CCol, CSpinner, CAlert } from '@coreui/react'
import { useAuth } from '../../auth/store/AuthContext'
import AutorizacionesForm from '../components/AutorizacionesForm'
import FeedbackModal from '../../../components/FeedbackModal'
import { extractErrorMessage } from '../../../utils/errorHandler'
import {
  emitirAutorizacion,
  getSolicitudesAutorizacion,
  getCentrosApuestaActivos,
  getBancos,
  getDocumentosPorTipo,
} from '../services/autorizaciones_especiales.service'

const AutorizacionesRegistroView = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    id_solicitud: '',
    tipo_emision: 'Inscripcion',
    id_documento_anterior: '',
    numero_documento: '',
    papel_seguridad: '',
    fecha_expedicion: '',
    fecha_vencimiento: '',
    direccion_establecimiento: '',
    detalles_extra: '',
    nro_mesa: '',
    id_centro: '',
    agencia_texto: '',
    id_banco: '',
    num_referencia: '',
    monto: '',
    tasa_dia: '',
    fecha_pago: '',
    responsable_texto: '',
    observaciones_pago: '',
  })
  const [solicitudes, setSolicitudes] = useState([])
  const [centrosApuesta, setCentrosApuesta] = useState([])
  const [bancos, setBancos] = useState([])
  const [documentosAnteriores, setDocumentosAnteriores] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [modalState, setModalState] = useState({ visible: false, type: '', message: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true)
      setError(null)

      try {
        const results = await Promise.allSettled([
          getSolicitudesAutorizacion(),
          getCentrosApuestaActivos(),
          getBancos(),
        ])

        const errorsList = []

        results[0].status === 'fulfilled'
          ? setSolicitudes(results[0].value || [])
          : errorsList.push(`No se pudieron cargar las solicitudes.`)

        results[1].status === 'fulfilled'
          ? setCentrosApuesta(results[1].value || [])
          : errorsList.push(`No se pudieron cargar los centros de apuesta.`)

        results[2].status === 'fulfilled'
          ? setBancos(results[2].value || [])
          : errorsList.push(`No se pudieron cargar los bancos.`)

        if (errorsList.length > 0) {
          console.error('Errores cargando dependencias:', errorsList)
          setError(errorsList.join(' '))
        }
      } finally {
        setLoadingDeps(false)
      }
    }
    loadDependencies()
  }, [])

  useEffect(() => {
    if (formData.tipo_emision === 'Renovacion') {
      setLoadingDocs(true)
      getDocumentosPorTipo('Autorizacion_especial')
        .then((data) => {
          setDocumentosAnteriores(data || [])
        })
        .catch(() => {
          setDocumentosAnteriores([])
        })
        .finally(() => {
          setLoadingDocs(false)
        })
     }
   }, [formData.tipo_emision])

   useEffect(() => {
     if (formData.tipo_emision !== 'Renovacion') {
       setFormData((prev) => ({ ...prev, id_documento_anterior: '' }))
     }
   }, [formData.tipo_emision])

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
    setModalState({ visible: true, type: 'loading', message: 'Emitiendo autorización...' })
    setError(null)

    try {
      // Validaciones cliente: campos obligatorios
      if (!user || !(user.id_usuario || user.id)) {
        setModalState({ visible: true, type: 'error', message: 'Debe iniciar sesión antes de emitir una autorización.' })
        return
      }
      const requiredFields = ['id_solicitud', 'numero_documento', 'papel_seguridad', 'fecha_expedicion', 'nro_mesa']
      for (const f of requiredFields) {
        if (!formData[f] || formData[f].toString().trim() === '') {
          setModalState({ visible: true, type: 'error', message: 'Complete todos los campos obligatorios antes de emitir.' })
          return
        }
      }

      // Validar formato UUID de id_solicitud
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(formData.id_solicitud)) {
        setModalState({ visible: true, type: 'error', message: 'El id_solicitud no tiene formato UUID válido.' })
        return
      }

      // Validar que id_documento_anterior se provee cuando tipo_emision es Renovacion
      if (formData.tipo_emision === 'Renovacion' && !formData.id_documento_anterior) {
        setModalState({ visible: true, type: 'error', message: 'Debe seleccionar un documento anterior para una renovación.' })
        return
      }

      const emitterId = user?.id_usuario ?? user?.id
      if (!uuidRegex.test(emitterId)) {
        setModalState({ visible: true, type: 'error', message: 'El usuario autenticado no tiene un id válido para `emitido_por`.' })
        return
      }

      // Validar que los campos de pago esten completos
      const requiredPagoFields = ['id_banco', 'num_referencia', 'monto', 'tasa_dia', 'fecha_pago']
      const missingPagoFields = requiredPagoFields.filter((f) => !formData[f] || formData[f].toString().trim() === '')
      if (missingPagoFields.length > 0) {
        const labels = {
          id_banco: 'Banco',
          num_referencia: 'Número de Referencia',
          monto: 'Monto',
          tasa_dia: 'Tasa del Día',
          fecha_pago: 'Fecha de Pago',
        }
        const missingLabels = missingPagoFields.map((f) => labels[f] || f).join(', ')
        setModalState({ visible: true, type: 'error', message: `Complete los campos obligatorios del pago: ${missingLabels}` })
        return
      }

      // Construimos el payload explícitamente: solo incluimos campos opcionales
      // cuando tienen un valor real (evita enviar strings vacíos al backend).
      const payload = {
        id_solicitud: formData.id_solicitud,
        emitido_por: emitterId,
        numero_documento: formData.numero_documento,
        papel_seguridad: formData.papel_seguridad,
        tipo_emision: formData.tipo_emision || 'Inscripcion',
        fecha_expedicion: formData.fecha_expedicion,
        nro_mesa: parseFloat(formData.nro_mesa),
        // Opcionales: solo se incluyen si tienen valor
        ...(formData.id_documento_anterior?.trim()
          ? { id_documento_anterior: formData.id_documento_anterior }
          : {}),
        ...(formData.fecha_vencimiento
          ? { fecha_vencimiento: formData.fecha_vencimiento }
          : {}),
        ...(formData.direccion_establecimiento?.trim()
          ? { direccion_establecimiento: formData.direccion_establecimiento }
          : {}),
        ...(formData.detalles_extra?.trim()
          ? { detalles_extra: formData.detalles_extra }
          : {}),
        ...(formData.id_centro?.trim()
          ? { id_centro: formData.id_centro }
          : {}),
        ...(formData.agencia_texto?.trim()
          ? { agencia_texto: formData.agencia_texto }
          : {}),
        pago: {
          id_banco: formData.id_banco,
          num_referencia: formData.num_referencia,
          monto: parseFloat(formData.monto),
          tasa_dia: parseFloat(formData.tasa_dia),
          fecha_pago: formData.fecha_pago,
          ...(formData.responsable_texto?.trim()
            ? { responsable_texto: formData.responsable_texto }
            : {}),
          ...(formData.observaciones_pago?.trim()
            ? { observaciones: formData.observaciones_pago }
            : {}),
        },
      }

      console.log('Payload autorizacion:', JSON.stringify(payload, null, 2))
      await emitirAutorizacion(payload)
      setModalState({ visible: true, type: 'success', message: 'Autorización emitida correctamente.' })
      setFormData({
        id_solicitud: '',
        tipo_emision: 'Inscripcion',
        id_documento_anterior: '',
        numero_documento: '',
        papel_seguridad: '',
        fecha_expedicion: '',
        fecha_vencimiento: '',
        direccion_establecimiento: '',
        detalles_extra: '',
        nro_mesa: '',
        id_centro: '',
        agencia_texto: '',
        id_banco: '',
        num_referencia: '',
        monto: '',
        tasa_dia: '',
        fecha_pago: '',
        responsable_texto: '',
        observaciones_pago: '',
      })
    } catch (err) {
      console.error('Error emitir autorizacion:', err)
      let errorMsg = 'Ocurrió un error al emitir la autorización.'
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.map((e) => (e.path ? `${e.path}: ${e.message}` : e.message)).join(' | ')
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.message) {
        errorMsg = extractErrorMessage(err)
      }
      setModalState({ visible: true, type: 'error', message: errorMsg })
    }
  }

  return (
    <CContainer fluid>
      <FeedbackModal
        visible={modalState.visible}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({ ...modalState, visible: false })}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0">
          <h4 className="mb-3 text-primary">Emisión de Autorización Especial</h4>
          <p className="text-muted small">
            Complete los datos de emisión para generar el documento emitido y la autorización especial.
          </p>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          <AutorizacionesForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
            solicitudes={solicitudes}
            centrosApuesta={centrosApuesta}
            bancos={bancos}
            documentosAnteriores={documentosAnteriores}
            loadingDeps={loadingDeps}
            loadingDocs={loadingDocs}
          />
          {loadingDeps && (
            <div className="text-center py-3">
              <CSpinner className="me-2" /> Cargando solicitudes y centros...
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default AutorizacionesRegistroView
