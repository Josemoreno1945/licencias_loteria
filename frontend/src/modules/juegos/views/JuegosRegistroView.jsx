import { useState, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import { createJuego } from '../services/juegos.service'
import FeedbackModal from '../../../components/FeedbackModal'
import JuegosForm from '../components/JuegosForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const JuegosRegistroView = () => {
  const [formData, setFormData] = useState({
    nombre: '',
  })

  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
    message: '',
  })

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
      message: 'Registrando juego...',
    })

    try {
      const response = await createJuego(formData)

      setModalState({
        visible: true,
        type: 'success',
        message: response.message || 'Juego registrado exitosamente.',
      })

      setFormData({
        nombre: '',
      })
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar el juego.')

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
          <h4 className="mb-3 text-primary">Registro de Juego</h4>
          <p className="text-muted small">
            Ingrese los datos del nuevo juego de azar.
          </p>
        </CCardHeader>
        <CCardBody>
          <JuegosForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default JuegosRegistroView
