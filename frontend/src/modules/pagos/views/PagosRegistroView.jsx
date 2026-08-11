import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CSpinner, CAlert } from '@coreui/react'
import { useAuth } from '../../auth/store/AuthContext'
import FeedbackModal from '../../../components/FeedbackModal'
import PagosForm from '../components/PagosForm'
import { extractErrorMessage } from '../../../utils/errorHandler'
import { createPago, getBancos, getLicencias } from '../services/pagos.service'

const PagosRegistroView = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    id_banco: '',
    num_referencia: '',
    fecha_pago: '',
    monto: '',
    tasa_dia: '',
    responsable_texto: '',
    id_licencia: '',
    observaciones: '',
  })
  const [bancos, setBancos] = useState([])
  const [licencias, setLicencias] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(false)
  const [modalState, setModalState] = useState({ visible: false, type: '', message: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true)
      try {
        const [bancosData, licenciasData] = await Promise.all([getBancos(), getLicencias()])
        setBancos(bancosData || [])
        setLicencias(licenciasData || [])
      } catch (err) {
        setError('No se pudieron cargar los bancos o licencias. Intente de nuevo.')
      } finally {
        setLoadingDeps(false)
      }
    }
    loadDependencies()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalState({ visible: true, type: 'loading', message: 'Registrando pago...' })
    setError(null)

    try {
      const payload = {
        ...formData,
        monto: Number(formData.monto),
        tasa_dia: Number(formData.tasa_dia),
        registrado_por: user?.id_usuario ?? user?.id,
      }
      await createPago(payload)
      setModalState({ visible: true, type: 'success', message: 'Pago registrado correctamente.' })
      setFormData({
        id_banco: '',
        num_referencia: '',
        fecha_pago: '',
        monto: '',
        tasa_dia: '',
        responsable_texto: '',
        id_licencia: '',
        observaciones: '',
      })
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error al registrar el pago.')
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
          <h4 className="mb-3 text-primary">Registro de Pago</h4>
          <p className="text-muted small">Registre pagos únicamente para licencias por ahora.</p>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          <PagosForm
            formData={formData}
            handleInputChange={handleInputChange}
            bancos={bancos}
            licencias={licencias}
            loadingDeps={loadingDeps}
            onSubmit={handleSubmit}
          />
          {loadingDeps && (
            <div className="text-center py-3">
              <CSpinner /> Cargando bancos y licencias...
            </div>
          )}
          {!loadingDeps && bancos.length === 0 && (
            <CAlert color="warning">No hay bancos activos disponibles para registrar pagos.</CAlert>
          )}
          {!loadingDeps && licencias.length === 0 && (
            <CAlert color="info">No hay licencias vigentes disponibles para asignar al pago.</CAlert>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default PagosRegistroView
