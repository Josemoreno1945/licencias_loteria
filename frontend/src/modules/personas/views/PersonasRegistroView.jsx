import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import axiosInstance from '../../../api/axiosInstance';
import FeedbackModal from '../../../components/FeedbackModal';
import PersonasForm from '../components/PersonasForm';
import { extractErrorMessage } from '../../../utils/errorHandler';

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
      const response = await axiosInstance.post('/personas', formData);

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
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar la persona.');

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
