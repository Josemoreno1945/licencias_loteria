import React, { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CSpinner, CAlert } from '@coreui/react'
import { useAuth } from '../../auth/store/AuthContext'
import AutorizacionesForm from '../components/AutorizacionesForm'
import FeedbackModal from '../../../components/FeedbackModal'
import { extractErrorMessage } from '../../../utils/errorHandler'
import {
  emitirAutorizacion,
  getSolicitudesAutorizacion,
  getSolicitudDetalle,
  getBancos,
  getOperadoras,
  getDocumentosPorTipo,
} from '../services/autorizaciones_especiales.service'

const INITIAL_FORM = {
  id_solicitud:             '',
  id_operadora:             '',
  tipo:                     'Mesa',
  numero_documento:         '',
  papel_seguridad:          '',
  tipo_emision:             'Inscripcion',
  id_documento_anterior:    '',
  fecha_expedicion:         '',
  fecha_vencimiento:        '',
  direccion_establecimiento:'',
  detalles_extra:           '',
  nro_mesa:                 '',
  id_centro:                '',
  agencia_texto:            '',
  numero_lot:               '',
  direccion_centro_asignado:'',
  direccion_localidad:      '',
  direccion_responsable:    '',
  id_banco:                 '',
  num_referencia:           '',
  monto:                    '',
  tasa_dia:                 '',
  fecha_pago:               '',
  responsable_texto:        '',
  observaciones_pago:       '',
}

const AutorizacionesRegistroView = () => {
  const { user } = useAuth()

  // ── Estado del formulario ──
  const [formData, setFormData] = useState(INITIAL_FORM)

  // ── Catálogos base ──
  const [solicitudes, setSolicitudes] = useState([])
  const [bancos, setBancos]           = useState([])
  const [operadoras, setOperadoras]   = useState([])
  const [documentosAnteriores, setDocumentosAnteriores] = useState([])

  // ── Detalle de la solicitud seleccionada (autocompletado) ──
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [loadingDetalleSolicitud, setLoadingDetalleSolicitud] = useState(false)

  // ── UI ──
  const [loadingDeps, setLoadingDeps]   = useState(false)
  const [loadingDocs, setLoadingDocs]   = useState(false)
  const [modalState, setModalState]     = useState({ visible: false, type: '', message: '' })
  const [error, setError]               = useState(null)

  // ── 1. Carga inicial de catálogos ─────────────────────────────────────────
  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true)
      setError(null)

      try {
        const results = await Promise.allSettled([
          getSolicitudesAutorizacion(),
          getBancos(),
          getOperadoras(),
        ])

        const errorsList = []

        if (results[0].status === 'fulfilled') {
          // Solo mostramos solicitudes PENDIENTES de tipo Autorización Especial
          const pendientes = (results[0].value || []).filter(
            (s) => s.estado === 'Pendiente' && s.tipo_tramite === 'Autorizacion_especial'
          )
          setSolicitudes(pendientes)
        } else {
          errorsList.push('No se pudieron cargar las solicitudes.')
        }

        if (results[1].status === 'fulfilled') {
          setBancos(results[1].value || [])
        } else {
          errorsList.push('No se pudieron cargar los bancos.')
        }

        if (results[2].status === 'fulfilled') {
          setOperadoras(results[2].value || [])
        } else {
          errorsList.push('No se pudieron cargar las operadoras.')
        }

        if (errorsList.length > 0) setError(errorsList.join(' '))
      } finally {
        setLoadingDeps(false)
      }
    }
    loadDependencies()
  }, [])

  // ── 2. Al seleccionar una solicitud → cargar detalle (herencia de datos) ──
  useEffect(() => {
    if (!formData.id_solicitud) {
      setSolicitudSeleccionada(null)
      return
    }

    const fetchDetalle = async () => {
      setLoadingDetalleSolicitud(true)
      try {
        const detalle = await getSolicitudDetalle(formData.id_solicitud)
        setSolicitudSeleccionada(detalle)

        // Heredar y bloquear: tipo de autorización, centro, dirección y tipo de emisión
        setFormData((prev) => ({
          ...prev,
          tipo: detalle.tipo_autorizacion_especial || prev.tipo || 'Mesa',
          id_centro: detalle.id_centro || prev.id_centro || '',
          tipo_emision: detalle.tipo_emision || prev.tipo_emision,
          direccion_establecimiento:
            detalle.centro_apuesta_direccion ||
            detalle.comercializador_direccion ||
            prev.direccion_establecimiento,
        }))
      } catch (err) {
        console.error('Error cargando detalle de solicitud:', err)
        setSolicitudSeleccionada(null)
      } finally {
        setLoadingDetalleSolicitud(false)
      }
    }

    fetchDetalle()
  }, [formData.id_solicitud])

  // ── 3. Renovación → documentos anteriores ──
  useEffect(() => {
    if (formData.tipo_emision === 'Renovacion') {
      setLoadingDocs(true)
      getDocumentosPorTipo('Autorizacion_especial')
        .then((data) => setDocumentosAnteriores(data || []))
        .catch(() => setDocumentosAnteriores([]))
        .finally(() => setLoadingDocs(false))
    } else {
      setFormData((prev) => ({ ...prev, id_documento_anterior: '' }))
    }
  }, [formData.tipo_emision])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = useCallback((e) => {
    const { name, value, selectedOptions } = e.target
    if (e.target.multiple) {
      setFormData((prev) => ({
        ...prev,
        [name]: Array.from(selectedOptions, (opt) => opt.value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalState({ visible: true, type: 'loading', message: 'Emitiendo autorización...' })
    setError(null)

    try {
      if (!user || !(user.id_usuario || user.id)) {
        setModalState({ visible: true, type: 'error', message: 'Debe iniciar sesión antes de emitir una autorización.' })
        return
      }

      const tipo = solicitudSeleccionada?.tipo_autorizacion_especial || formData.tipo || 'Mesa'

      // Validaciones obligatorias del documento
      const requiredFields = ['id_solicitud', 'numero_documento', 'papel_seguridad', 'fecha_expedicion']
      for (const f of requiredFields) {
        if (!formData[f] || formData[f].toString().trim() === '') {
          setModalState({ visible: true, type: 'error', message: 'Complete todos los campos obligatorios antes de emitir.' })
          return
        }
      }

      // nro_mesa obligatorio solo cuando el tipo heredado es 'Mesa'
      if (tipo === 'Mesa' && (!formData.nro_mesa || formData.nro_mesa.toString().trim() === '')) {
        setModalState({ visible: true, type: 'error', message: 'El N° de Mesa es obligatorio para el tipo de autorización Mesa.' })
        return
      }

      // Renovación requiere documento anterior
      if (formData.tipo_emision === 'Renovacion' && !formData.id_documento_anterior) {
        setModalState({ visible: true, type: 'error', message: 'Debe seleccionar un documento anterior para una renovación.' })
        return
      }

      // Validar UUID de id_solicitud
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(formData.id_solicitud)) {
        setModalState({ visible: true, type: 'error', message: 'La solicitud seleccionada no tiene un formato válido.' })
        return
      }

      // Validar coherencia de fechas
      if (formData.fecha_vencimiento && formData.fecha_expedicion) {
        if (new Date(formData.fecha_vencimiento) <= new Date(formData.fecha_expedicion)) {
          setModalState({ visible: true, type: 'error', message: 'La fecha de vencimiento debe ser posterior a la fecha de expedición.' })
          return
        }
      }

      const emitterId = user?.id_usuario ?? user?.id
      if (!uuidRegex.test(emitterId)) {
        setModalState({ visible: true, type: 'error', message: 'El usuario autenticado no tiene un ID válido para emitido_por.' })
        return
      }

      // Validar campos de pago
      const requiredPago = ['id_banco', 'num_referencia', 'monto', 'tasa_dia', 'fecha_pago']
      const missingPago = requiredPago.filter((f) => !formData[f] || formData[f].toString().trim() === '')
      if (missingPago.length > 0) {
        const labels = { id_banco: 'Banco', num_referencia: 'N° Referencia', monto: 'Monto', tasa_dia: 'Tasa del Día', fecha_pago: 'Fecha de Pago' }
        setModalState({ visible: true, type: 'error', message: `Complete los campos del pago: ${missingPago.map((f) => labels[f] || f).join(', ')}` })
        return
      }

      // Construir payload limpio
      const payload = {
        id_solicitud:    formData.id_solicitud,
        emitido_por:     emitterId,
        tipo,
        numero_documento:formData.numero_documento,
        papel_seguridad: formData.papel_seguridad,
        tipo_emision:    formData.tipo_emision || 'Inscripcion',
        fecha_expedicion:formData.fecha_expedicion,
        // Datos heredados de la solicitud (opcionales en el documento)
        ...(formData.id_centro?.trim()        ? { id_centro:        formData.id_centro }        : {}),
        ...(formData.id_operadora?.trim()      ? { id_operadora:     formData.id_operadora }     : {}),
        // Datos propios del documento
        ...(tipo === 'Mesa' && formData.nro_mesa
          ? { nro_mesa: parseFloat(formData.nro_mesa) }
          : {}),
        ...(formData.agencia_texto?.trim()     ? { agencia_texto:    formData.agencia_texto }    : {}),
        ...(formData.numero_lot?.trim()        ? { numero_lot:       formData.numero_lot }       : {}),
        ...(formData.id_documento_anterior?.trim() ? { id_documento_anterior: formData.id_documento_anterior } : {}),
        ...(formData.fecha_vencimiento         ? { fecha_vencimiento: formData.fecha_vencimiento } : {}),
        ...(formData.direccion_establecimiento?.trim() ? { direccion_establecimiento: formData.direccion_establecimiento } : {}),
        ...(formData.direccion_centro_asignado?.trim() ? { direccion_centro_asignado: formData.direccion_centro_asignado } : {}),
        ...(formData.direccion_localidad?.trim()      ? { direccion_localidad: formData.direccion_localidad } : {}),
        ...(formData.direccion_responsable?.trim()    ? { direccion_responsable: formData.direccion_responsable } : {}),
        ...(formData.detalles_extra?.trim()    ? { detalles_extra:   formData.detalles_extra }   : {}),
        pago: {
          id_banco:       formData.id_banco,
          num_referencia: formData.num_referencia,
          monto:          parseFloat(formData.monto),
          tasa_dia:       parseFloat(formData.tasa_dia),
          fecha_pago:     formData.fecha_pago,
          ...(formData.responsable_texto?.trim() ? { responsable_texto: formData.responsable_texto } : {}),
          ...(formData.observaciones_pago?.trim() ? { observaciones:    formData.observaciones_pago } : {}),
        },
      }

      await emitirAutorizacion(payload)
      setModalState({ visible: true, type: 'success', message: 'Autorización especial emitida correctamente.' })
      setFormData(INITIAL_FORM)
      setSolicitudSeleccionada(null)

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

  // ── Render ────────────────────────────────────────────────────────────────
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
          <h4 className="mb-1 text-primary">Emisión de Autorización Especial</h4>
          <p className="text-muted small mb-3">
            Seleccione una solicitud pendiente para heredar sus datos (Operadora, Comercializadora, Centro de Apuestas, Representantes y Tipo) y complete los campos propios del documento.
          </p>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          <AutorizacionesForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
            solicitudes={solicitudes}
            solicitudSeleccionada={solicitudSeleccionada}
            bancos={bancos}
            operadoras={operadoras}
            documentosAnteriores={documentosAnteriores}
            loadingDeps={loadingDeps}
            loadingDetalleSolicitud={loadingDetalleSolicitud}
            loadingDocs={loadingDocs}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default AutorizacionesRegistroView
