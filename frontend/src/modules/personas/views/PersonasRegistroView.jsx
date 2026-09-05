import React, { useState, useCallback } from 'react';
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import { createPersona } from '../services/personas.service';
import FeedbackModal from '../../../components/FeedbackModal';
import PersonasForm from '../components/PersonasForm';
import { extractErrorMessage } from '../../../utils/errorHandler';

const PersonasRegistroView = () => {
  const [formData, setFormData] = useState({
    tipo_persona: '',
    ci_rif: '',
    razon_social: '',
    direccion_fiscal: '',
    telefono: '',
    email: '',
  });

  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
    message: '',
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const response = await createPersona(formData);

      setModalState({
        visible: true,
        type: 'success',
        message: response.message || 'Persona registrada exitosamente.',
      });

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
    <CContainer fluid className="py-4 px-3 px-md-4">
      <FeedbackModal
        visible={modalState.visible}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, visible: false }))}
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

export default PersonasRegistroView;
