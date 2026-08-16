import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'
import FeedbackModal from '../../../components/FeedbackModal'
import UsuariosForm from './UsuariosForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const UsuariosEditarModal = ({ idUsuario, onClose, onUpdated }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    email: '',
    password: '',
    rol: '',
    estado: 'activo',
  })

  // Estado para cargar los datos del registro a editar
  const [loadingData, setLoadingData] = useState(false)
  const [errorData, setErrorData] = useState(null)

  // Estados para los modales de feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: '', // 'loading', 'success', 'error'
    message: '',
  })

  // Precargamos los datos actuales del usuario
  useEffect(() => {
    if (!idUsuario) return
    const fetchData = async () => {
      setLoadingData(true)
      setErrorData(null)
      try {
        const res = await axiosInstance.get(`/usuarios/${idUsuario}`)
        const usuario = Array.isArray(res.data) ? res.data[0] : res.data
        setFormData({
          nombre_usuario: usuario.nombre_usuario || '',
          email: usuario.email || '',
          password: '',
          rol: usuario.rol || '',
          estado: usuario.estado || 'activo',
        })
      } catch (err) {
        setErrorData(err.response?.data?.message || 'Error al cargar el usuario')
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [idUsuario])

  // Manejador de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Enviar el formulario (actualización parcial)
  const handleSubmit = async (e) => {
    e.preventDefault()

    setFeedbackModal({
      visible: true,
      type: 'loading',
      message: 'Actualizando usuario...',
    })

    try {
      // La contraseña es opcional en edición: si no se envía, no se actualiza
      const payload = { ...formData }
      if (!payload.password) delete payload.password

      const response = await axiosInstance.put(`/usuarios/${idUsuario}`, payload)

      setFeedbackModal({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Usuario actualizado exitosamente.',
      })

      // Actualizamos la lista y cerramos el modal de edición
      onUpdated && onUpdated()
      onClose()
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al actualizar el usuario.')

      setFeedbackModal({
        visible: true,
        type: 'error',
        message: errorMsg,
      })
    }
  }

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idUsuario}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando usuario...</span>
            </div>
          )}
          {errorData && !loadingData && <CAlert color="danger">{errorData}</CAlert>}
          {!loadingData && !errorData && (
            <UsuariosForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isEditMode
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </React.Fragment>
  )
}

export default UsuariosEditarModal
