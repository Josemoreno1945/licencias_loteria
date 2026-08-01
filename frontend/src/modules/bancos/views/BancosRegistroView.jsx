import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../personas/components/FeedbackModal'
import BancosForm from '../components/BancosForm'

const BancosRegistroView = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
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
      message: 'Registrando banco...',
    })

    try {
      const response = await axiosInstance.post('/bancos', formData)

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Banco registrado exitosamente.',
      })

      // Limpiar formulario tras exito
      setFormData({
        nombre: '',
        codigo: '',
        estado: 'activo',
      })
    } catch (err) {
      let errorMsg = 'Ocurrio un error inesperado al registrar el banco.'

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
          <h4 className="mb-3 text-primary">Registro de Bancos</h4>
          <p className="text-muted small">
            Ingrese los datos del banco para registrarlo en el catalogo del sistema.
          </p>
        </CCardHeader>
        <CCardBody>
          <BancosForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default BancosRegistroView
