import React, { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CSpinner, CAlert } from '@coreui/react'
import { useAuth } from '../../auth/store/AuthContext'
import ParticipacionesForm from '../components/ParticipacionesForm'
import FeedbackModal from '../../../components/FeedbackModal'
import {
  emitirParticipacion,
  getSolicitudesParticipacion,
  getSolicitudDetalle,
  getBancos,
  getLicenciasVigentes,
  getDocumentosPorTipo,
  getRepresentantesByComercializador,
} from '../services/participaciones.service'

const INITIAL_FORM = {
  id_solicitud:             '',
  tipo:                     '',
  numero_documento:         '',
  papel_seguridad:          '',
  tipo_emision:             'Inscripcion',
  id_documento_anterior:    '',
  fecha_expedicion:         '',
  fecha_vencimiento:        '',
  direccion_establecimiento:'',
  detalles_extra:           '',
  nro_archivo:              '',
  id_licencia:              '',
  id_representante:         '',
  id_banco:                 '',
  num_referencia:           '',
  monto:                    '',
  tasa_dia:                 '',
  fecha_pago:               '',
  responsable_texto:        '',
  observaciones_pago:       '',
}

const ParticipacionesRegistroView = () => {
  const { user } = useAuth()

  // ── Estado del formulario ──
  const [formData, setFormData] = useState(INITIAL_FORM)

  // ── Catálogos base ──
  const [solicitudes, setSolicitudes] = useState([])
  const [bancos, setBancos]           = useState([])
  const [licencias, setLicencias]     = useState([])
  const [documentosAnteriores, setDocumentosAnteriores] = useState([])

  // ── Detalle de la solicitud seleccionada (autocompletado) ──
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [loadingDetalleSolicitud, setLoadingDetalleSolicitud] = useState(false)

  // ── Representantes legales (dato propio, derivado de la solicitud) ──
  const [representantes, setRepresentantes] = useState([])
  const [loadingReps, setLoadingReps]       = useState(false)

  // ── UI ──
  const [loadingDeps, setLoadingDeps]   = useState(false)
  const [modalState, setModalState]     = useState({ visible: false, type: '', message: '' })
  const [error, setError]               = useState(null)

  // ── 1. Carga inicial de catálogos ─────────────────────────────────────────
  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true)
      setError(null)

      try {
        const results = await Promise.allSettled([
          getSolicitudesParticipacion(),
          getBancos(),
          getLicenciasVigentes(),
          getDocumentosPorTipo('Participacion'),
        ])

        const errorsList = []

        if (results[0].status === 'fulfilled') {
          // Solo mostramos solicitudes PENDIENTES de tipo Participación
          const pendientes = (results[0].value || []).filter(
            (s) => s.estado === 'Pendiente' && s.tipo_tramite === 'Participacion'
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
          setLicencias(results[2].value || [])
        } else {
          errorsList.push('No se pudieron cargar las licencias vigentes.')
        }

        if (results[3].status === 'fulfilled') {
          setDocumentosAnteriores(results[3].value || [])
        } else {
          errorsList.push('No se pudieron cargar los documentos anteriores.')
        }

        if (errorsList.length > 0) setError(errorsList.join(' '))
      } finally {
        setLoadingDeps(false)
      }
    }
    loadDependencies()
  }, [])

  // ── 2. Al seleccionar una solicitud → cargar detalle ─────
  useEffect(() => {
    if (!formData.id_solicitud) {
      setSolicitudSeleccionada(null)
      setRepresentantes([])
      return
    }

    const fetchDetalle = async () => {
      setLoadingDetalleSolicitud(true)
      try {
        const detalle = await getSolicitudDetalle(formData.id_solicitud)
        setSolicitudSeleccionada(detalle)

        // Autocompletar tipo_emision y dirección desde la solicitud
        setFormData((prev) => ({
          ...prev,
          tipo_emision: detalle.tipo_emision || prev.tipo_emision,
          direccion_establecimiento:
            detalle.comercializador_direccion || prev.direccion_establecimiento,
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

  // ── 3. Cargar representantes legales según la comercializadora de la solicitud ──
  useEffect(() => {
    const idComercializador = solicitudSeleccionada?.id_comercializador
    if (!idComercializador) {
      setRepresentantes([])
      setFormData((prev) => ({ ...prev, id_representante: '' }))
      return
    }

    let cancelled = false
    setLoadingReps(true)
    getRepresentantesByComercializador(idComercializador)
      .then((data) => {
        if (!cancelled) {
          setRepresentantes(data || [])
          const active = (data || []).find((r) => r.estado === 'activo')
          setFormData((prev) => ({
            ...prev,
            id_representante: active ? active.id_persona : ((data || [])[0]?.id_persona || ''),
          }))
        }
      })
      .catch(() => {
        if (!cancelled) setRepresentantes([])
      })
      .finally(() => {
        if (!cancelled) setLoadingReps(false)
      })
    return () => { cancelled = true }
  }, [solicitudSeleccionada])

  // ── 4. Limpiar documento anterior si no es renovación ──
  useEffect(() => {
    if (formData.tipo_emision !== 'Renovacion') {
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
    setModalState({ visible: true, type: 'loading', message: 'Emitiendo participación...' })
    setError(null)

    try {
      if (!user || !(user.id_usuario || user.id)) {
        setModalState({ visible: true, type: 'error', message: 'Debe iniciar sesión antes de emitir una participación.' })
        return
      }

      // Validaciones obligatorias
      const requiredFields = ['id_solicitud', 'tipo', 'numero_documento', 'papel_seguridad', 'fecha_expedicion', 'nro_archivo', 'id_licencia']
      for (const f of requiredFields) {
        if (!formData[f] || formData[f].toString().trim() === '') {
          setModalState({ visible: true, type: 'error', message: 'Complete todos los campos obligatorios antes de emitir.' })
          return
        }
      }

      // Validar UUID de id_solicitud e id_licencia
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(formData.id_solicitud)) {
        setModalState({ visible: true, type: 'error', message: 'La solicitud seleccionada no tiene un formato válido.' })
        return
      }
      if (!uuidRegex.test(formData.id_licencia)) {
        setModalState({ visible: true, type: 'error', message: 'Debe seleccionar una licencia de soporte válida.' })
        return
      }

      // Validar coherencia de fechas
      if (formData.fecha_vencimiento && formData.fecha_expedicion) {
        if (new Date(formData.fecha_vencimiento) <= new Date(formData.fecha_expedicion)) {
          setModalState({ visible: true, type: 'error', message: 'La fecha de vencimiento debe ser posterior a la fecha de expedición.' })
          return
        }
      }

      // Validar documento anterior en renovación
      if (formData.tipo_emision === 'Renovacion' && !formData.id_documento_anterior) {
        setModalState({ visible: true, type: 'error', message: 'Debe seleccionar un documento anterior para una renovación.' })
        return
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
        numero_documento:formData.numero_documento,
        papel_seguridad: formData.papel_seguridad,
        tipo_emision:    formData.tipo_emision || 'Inscripcion',
        fecha_expedicion:formData.fecha_expedicion,
        tipo:            formData.tipo,
        nro_archivo:     formData.nro_archivo,
        id_licencia:     formData.id_licencia,
        ...(formData.id_documento_anterior?.trim() ? { id_documento_anterior: formData.id_documento_anterior } : {}),
        ...(formData.fecha_vencimiento                   ? { fecha_vencimiento:        formData.fecha_vencimiento }        : {}),
        ...(formData.direccion_establecimiento?.trim()   ? { direccion_establecimiento: formData.direccion_establecimiento } : {}),
        ...(formData.detalles_extra?.trim()              ? { detalles_extra:           formData.detalles_extra }           : {}),
        ...(formData.id_representante?.trim()            ? { representantes: [formData.id_representante] } : {}),
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

      await emitirParticipacion(payload)
      setModalState({ visible: true, type: 'success', message: 'Participación emitida correctamente.' })
      setFormData(INITIAL_FORM)
      setSolicitudSeleccionada(null)
      setRepresentantes([])

    } catch (err) {
      console.error('Error emitir participacion:', err)
      let errorMsg = 'Ocurrió un error al emitir la participación.'
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.map((e) => (e.path ? `${e.path}: ${e.message}` : e.message)).join(' | ')
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.message) {
        errorMsg = err.message
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
          <h4 className="mb-1 text-primary">Emisión de Participación</h4>
          <p className="text-muted small mb-3">
            Seleccione una solicitud pendiente para heredar sus datos y complete los campos propios del documento.
          </p>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          <ParticipacionesForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
            solicitudes={solicitudes}
            solicitudSeleccionada={solicitudSeleccionada}
            bancos={bancos}
            licencias={licencias}
            documentosAnteriores={documentosAnteriores}
            representantes={representantes}
            loadingDeps={loadingDeps}
            loadingDetalleSolicitud={loadingDetalleSolicitud}
            loadingReps={loadingReps}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ParticipacionesRegistroView
