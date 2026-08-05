import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../personas/components/FeedbackModal'
import ComercializadoresForm from '../components/ComercializadoresForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const ComercializadoresRegistroView = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    direccion_fiscal: '',
    telefono: '',
    email: '',
    estado: 'activo',
  })

  // Estados para los modales
  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
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
      message: 'Registrando comercializador...',
    })

    try {
      const response = await axiosInstance.post('/comercializadores', formData)

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Comercializador registrado exitosamente.',
      })

      // Limpiar formulario tras éxito
      setFormData({
        rif: '',
        razon_social: '',
        direccion_fiscal: '',
        telefono: '',
        email: '',
        estado: 'activo',
      })
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar el comercializador.');

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
          <h4 className="mb-3 text-primary">Registro de Comercializadores</h4>
          <p className="text-muted small">
            Ingrese los datos de la empresa comercializadora para registrarla en el sistema.
          </p>
        </CCardHeader>
        <CCardBody>
          <ComercializadoresForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ComercializadoresRegistroView
