import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CAlert } from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../personas/components/FeedbackModal'
import CentrosApuestaForm from '../components/CentrosApuestaForm'

const CentrosApuestaRegistroView = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    id_comercializador: '',
    id_persona: '',
    nombre_agencia: '',
    direccion: '',
    estado: 'activo',
  })

  // Datos para los selects dinámicos
  const [comercializadores, setComercializadores] = useState([])
  const [personas, setPersonas] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [errorDeps, setErrorDeps] = useState(null)

  // Estado para los modales
  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
    message: '',
  })

  // Cargar comercializadores y personas en paralelo al montar el componente
  useEffect(() => {
    const cargarDependencias = async () => {
      setLoadingDeps(true)
      setErrorDeps(null)
      try {
        const [resComercializadores, resPersonas] = await Promise.all([
          axiosInstance.get('/comercializadores'),
          axiosInstance.get('/personas'),
        ])
        setComercializadores(resComercializadores.data || [])
        setPersonas(resPersonas.data || [])
      } catch {
        setErrorDeps('No se pudieron cargar los datos necesarios. Verifique la conexión con el servidor.')
      } finally {
        setLoadingDeps(false)
      }
    }

    cargarDependencias()
  }, [])

  // Manejador de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando centro de apuesta...',
    })

    try {
      const response = await axiosInstance.post('/centros_apuesta', formData)

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Centro de apuesta registrado exitosamente.',
      })

      // Limpiar formulario tras éxito
      setFormData({
        id_comercializador: '',
        id_persona: '',
        nombre_agencia: '',
        direccion: '',
        estado: 'activo',
      })
    } catch (err) {
      let errorMsg = 'Ocurrió un error inesperado al registrar el centro de apuesta.'

      if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.response?.data?.errors) {
        errorMsg = err.response.data.errors.map((issue) => issue.message || issue)
      }

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
        onClose={() => setModalState({ ...modalState, visible: false })}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0">
          <h4 className="mb-3 text-primary">Registro de Centros de Apuesta</h4>
          <p className="text-muted small">
            Registre una nueva agencia física (punto de venta) vinculada a un comercializador.
          </p>
        </CCardHeader>
        <CCardBody>
          {errorDeps ? (
            <CAlert color="danger">{errorDeps}</CAlert>
          ) : (
            <CentrosApuestaForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              comercializadores={comercializadores}
              personas={personas}
              loadingDeps={loadingDeps}
            />
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CentrosApuestaRegistroView
