import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import PersonasForm from '../components/PersonasForm';

const PersonasView = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_persona: '',
    ci_rif: '',
    razon_social: '',
    direccion_fiscal: '',
    telefono: '',
    email: '',
  });

  // Estados para los modales
  const [modalState, setModalState] = useState({
    visible: false,
    type: '', // 'loading', 'success', 'error'
    message: '',
  });

  // Manejador de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar tipo de persona
    if (!formData.tipo_persona) {
      setModalState({
        visible: true,
        type: 'error',
        message: 'Debe seleccionar el tipo de persona.',
      });
      return;
    }

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando persona...',
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/personas', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Persona registrada exitosamente.',
      });

      // Limpiar formulario tras éxito
      setFormData({
        tipo_persona: '',
        ci_rif: '',
        razon_social: '',
        direccion_fiscal: '',
        telefono: '',
        email: '',
      });

    } catch (err) {
      let errorMsg = 'Ocurrió un error inesperado al registrar la persona.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.errors) {
        // En caso de que el backend envíe un array de errores
        errorMsg = err.response.data.errors.map((issue) => issue.message || issue);
      }

      setModalState({
        visible: true,
        type: 'error',
        message: errorMsg,
      });
    }
  };

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
          <h4 className="mb-3 text-primary">Registro de Personas</h4>
          <p className="text-muted small">
            Ingrese los datos de la persona natural o jurídica para registrarla en el sistema.
          </p>
        </CCardHeader>
        <CCardBody>
          <PersonasForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default PersonasView;
