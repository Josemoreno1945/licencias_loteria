import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import axiosInstance from '../../../api/axiosInstance';
import FeedbackModal from '../../../components/FeedbackModal';
import JuegosForm from '../components/JuegosForm';
import { extractErrorMessage } from '../../../utils/errorHandler';

const JuegosRegistroView = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    id_operadora: '',
    nombre: '',
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

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando juego...',
    });

    try {
      const response = await axiosInstance.post('/juegos', formData);

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Juego registrado exitosamente.',
      });

      // Limpiar formulario tras éxito
      setFormData({
        id_operadora: '',
        nombre: '',
      });

    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar el juego.');

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
          <h4 className="mb-3 text-primary">Registro de Juego</h4>
          <p className="text-muted small">
            Ingrese los datos del nuevo juego de azar y asócielo a su respectiva operadora.
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
  );
};

export default JuegosRegistroView;
