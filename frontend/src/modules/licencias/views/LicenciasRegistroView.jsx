import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CRow, CCol, CSpinner, CAlert } from '@coreui/react'
import { useAuth } from '../../auth/store/AuthContext'
import LicenciasForm from '../components/LicenciasForm'
import FeedbackModal from '../../../components/FeedbackModal'
import { extractErrorMessage } from '../../../utils/errorHandler'
import { emitirLicencia, getSolicitudesLicencia, getJuegosActivos, getBancos, getCentrosApuestaActivos, getRepresentantes, getPermisosJuegosPorComercializador } from '../services/licencias.service'

const LicenciasRegistroView = () => {
  const { user } = useAuth()
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
    id_representante: '',
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
  const [loadingDeps, setLoadingDeps] = useState(false)
  const [modalState, setModalState] = useState({ visible: false, type: '', message: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true)
      setError(null)

      try {
        const results = await Promise.allSettled([
          getSolicitudesLicencia(),
          getJuegosActivos(),
          getBancos(),
          getCentrosApuestaActivos(),
          getRepresentantes(),
        ])

        const errorsList = []

        results[0].status === 'fulfilled'
          ? setSolicitudes((results[0].value || []).filter((s) => s.estado === 'Pendiente'))
          : errorsList.push(`No se pudieron cargar las solicitudes.`)

        results[1].status === 'fulfilled'
          ? setJuegos(results[1].value || [])
          : errorsList.push(`No se pudieron cargar los juegos activos.`)

        results[2].status === 'fulfilled'
          ? setBancos(results[2].value || [])
          : errorsList.push(`No se pudieron cargar los bancos.`)

        results[3].status === 'fulfilled'
          ? setCentrosApuesta(results[3].value || [])
          : errorsList.push(`No se pudieron cargar los centros de apuesta.`)

        results[4].status === 'fulfilled'
          ? setRepresentantes(results[4].value || [])
          : errorsList.push(`No se pudieron cargar los representantes.`)

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

  // Filtrar juegos según los permisos del comercializador vinculado a la solicitud
  useEffect(() => {
    if (!formData.id_solicitud || juegos.length === 0) {
      setJuegosFiltrados(juegos)
      return
    }

    const solicitud = solicitudes.find((s) => s.id_solicitudes === formData.id_solicitud)
    if (!solicitud || !solicitud.id_comercializador) {
      setJuegosFiltrados(juegos)
      return
    }

    const fetchJuegosFiltrados = async () => {
      try {
        const permisos = await getPermisosJuegosPorComercializador(solicitud.id_comercializador)
        // Si el comercializador no tiene permisos de juego configurados,
        // mostramos todos los juegos disponibles como fallback (no lista vacía).
        if (!permisos || permisos.length === 0) {
          setJuegosFiltrados(juegos)
          return
        }
        const idsAutorizados = permisos.map((p) => p.id_juego)
        setJuegosFiltrados(juegos.filter((j) => idsAutorizados.includes(j.id_juego)))
      } catch {
        setJuegosFiltrados(juegos)
      }
    }
    fetchJuegosFiltrados()
  }, [formData.id_solicitud, solicitudes, juegos])

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
    setModalState({ visible: true, type: 'loading', message: 'Emitiendo licencia...' })
    setError(null)

    try {
      // Validaciones cliente: campos obligatorios
      if (!user || !(user.id_usuario || user.id)) {
        setModalState({ visible: true, type: 'error', message: 'Debe iniciar sesión antes de emitir una licencia.' })
        return
      }
      const requiredFields = ['id_solicitud', 'numero_documento', 'papel_seguridad', 'fecha_expedicion']
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

      const emitterId = user?.id_usuario ?? user?.id
      if (!uuidRegex.test(emitterId)) {
        setModalState({ visible: true, type: 'error', message: 'El usuario autenticado no tiene un id válido para `emitido_por`.' })
        return
      }

      // Validar que los campos de pago esten completos
      const requiredPagoFields = ['id_banco', 'num_referencia', 'monto', 'tasa_dia', 'fecha_pago']
      const missingPagoFields = requiredPagoFields.filter(f => !formData[f] || formData[f].toString().trim() === '')
      if (missingPagoFields.length > 0) {
        const labels = {
          id_banco: 'Banco',
          num_referencia: 'Número de Referencia',
          monto: 'Monto',
          tasa_dia: 'Tasa del Día',
          fecha_pago: 'Fecha de Pago'
        }
        const missingLabels = missingPagoFields.map(f => labels[f] || f).join(', ')
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
        id_centro: formData.id_centro || undefined,
        id_representante: formData.id_representante || undefined,
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
        ...(formData.numero_lot?.trim()
          ? { numero_lot: formData.numero_lot }
          : {}),
        ...(formData.juegos.length > 0
          ? { juegos: formData.juegos }
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

      console.log('Payload licencia:', JSON.stringify(payload, null, 2))
      await emitirLicencia(payload)
      setModalState({ visible: true, type: 'success', message: 'Licencia emitida correctamente.' })
      setFormData({
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
        id_representante: '',
        id_banco: '',
        num_referencia: '',
        monto: '',
        tasa_dia: '',
        fecha_pago: '',
        responsable_texto: '',
        observaciones_pago: '',
      })
    } catch (err) {
      console.error('Error emitir licencia:', err)
      let errorMsg = 'Ocurrió un error al emitir la licencia.'
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.map(e => e.path ? `${e.path}: ${e.message}` : e.message).join(' | ')
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.message) {
        errorMsg = err.message
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
          <h4 className="mb-3 text-primary">Emisión de Licencia</h4>
          <p className="text-muted small">
            Complete los datos de emisión para generar el documento emitido y la licencia.
          </p>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
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
          />
          {loadingDeps && (
            <div className="text-center py-3">
              <CSpinner className="me-2" /> Cargando solicitudes y juegos...
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default LicenciasRegistroView
