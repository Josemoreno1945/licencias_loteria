import { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CAlert } from '@coreui/react'
import { createComercializador, getComercializadoresActivos } from '../services/comercializadores.service'
import { getPersonas } from '../../personas/services/personas.service'
import FeedbackModal from '../../../components/FeedbackModal'
import ComercializadoresForm from '../components/ComercializadoresForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const ComercializadoresRegistroView = () => {
  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    direccion_fiscal: '',
    telefono: '',
    email: '',
    estado: 'activo',
    representantes: [{ id_persona: '', cargo: '' }],
  })

  const [personas, setPersonas] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [errorDeps, setErrorDeps] = useState(null)

  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
    message: '',
  })

  useEffect(() => {
    const cargarDependencias = async () => {
      setLoadingDeps(true)
      setErrorDeps(null)
      try {
        const data = await getPersonas()
        setPersonas(data || [])
      } catch {
        setErrorDeps('No se pudieron cargar los datos necesarios. Verifique la conexión con el servidor.')
      } finally {
        setLoadingDeps(false)
      }
    }

    cargarDependencias()
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando comercializador...',
    })

    try {
      const payload = {
        rif: formData.rif,
        razon_social: formData.razon_social,
        direccion_fiscal: formData.direccion_fiscal,
        telefono: formData.telefono,
        email: formData.email,
        estado: formData.estado,
        representantes: formData.representantes.filter((r) => r.id_persona),
      }

      const response = await createComercializador(payload)

      setModalState({
        visible: true,
        type: 'success',
        message: response.message || 'Comercializador registrado exitosamente.',
      })

      setFormData({
        rif: '',
        razon_social: '',
        direccion_fiscal: '',
        telefono: '',
        email: '',
        estado: 'activo',
        representantes: [{ id_persona: '', cargo: '' }],
      })
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar el comercializador.')

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
          <h4 className="mb-3 text-primary">Registro de Comercializadores</h4>
          <p className="text-muted small">
            Ingrese los datos de la empresa comercializadora para registrarla en el sistema.
          </p>
        </CCardHeader>
        <CCardBody>
          {errorDeps ? (
            <CAlert color="danger">{errorDeps}</CAlert>
          ) : (
            <ComercializadoresForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              personas={personas}
              loadingDeps={loadingDeps}
            />
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ComercializadoresRegistroView
