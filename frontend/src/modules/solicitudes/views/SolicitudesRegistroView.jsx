import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import axiosInstance from '../../../api/axiosInstance';
import FeedbackModal from '../../personas/components/FeedbackModal';
import SolicitudesForm from '../components/SolicitudesForm';
import { useAuth } from '../../auth/store/AuthContext';
import { extractErrorMessage } from '../../../utils/errorHandler';

const SolicitudesRegistroView = () => {
  const { user } = useAuth();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    id_persona: '',
    id_comercializador: null,
    id_operadora: null,
    tipo_tramite: '',
    categoria_licencia: null,
    descripcion_tramite: '',
    observaciones: '',
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
      [name]: value || null, // convert empty strings to null for optional FKs
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando solicitud...',
    });

    try {
      // Send the user ID as 'registrado_por'
      const payload = {
        ...formData,
        registrado_por: user?.id_usuario // Assuming the auth context provides id_usuario
      };

      const response = await axiosInstance.post('/solicitudes', payload);

      setModalState({
        visible: true,
        type: 'success',
        message: response.data.message || 'Solicitud registrada exitosamente.',
      });

      // Limpiar formulario tras éxito
      setFormData({
        id_persona: '',
        id_comercializador: null,
        id_operadora: null,
        tipo_tramite: '',
        categoria_licencia: null,
        descripcion_tramite: '',
        observaciones: '',
      });

    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar la solicitud.');

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
          <h4 className="mb-3 text-primary">Registro de Solicitud</h4>
          <p className="text-muted small">
            Ingrese los datos para iniciar un nuevo trámite (Licencia, Participación, etc.).
          </p>
        </CCardHeader>
        <CCardBody>
          <SolicitudesForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default SolicitudesRegistroView;
