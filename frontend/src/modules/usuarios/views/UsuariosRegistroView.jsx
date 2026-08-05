import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../personas/components/FeedbackModal'
import UsuariosForm from '../components/UsuariosForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const UsuariosRegistroView = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    email: '',
    password: '',
    rol: '',
    estado: 'activo',
  })

  // Estados para los modales
  const [modalState, setModalState] = useState({
    visible: false,
    type: '', // 'loading', 'success', 'error'
    message: '',
  })

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
      message: 'Registrando usuario...',
    })

    try {
      const response = await axiosInstance.post('/usuarios', formData)

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Usuario registrado exitosamente.',
      })

      // Limpiar formulario tras exito
      setFormData({
        nombre_usuario: '',
        email: '',
        password: '',
        rol: '',
        estado: 'activo',
      })
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar el usuario.');

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
          <h4 className="mb-3 text-primary">Registro de Usuarios</h4>
          <p className="text-muted small">
            Cree un nuevo usuario para el sistema con su rol correspondiente.
          </p>
        </CCardHeader>
        <CCardBody>
          <UsuariosForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default UsuariosRegistroView
