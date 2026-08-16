import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react';
import axiosInstance from '../../../api/axiosInstance';
import FeedbackModal from '../../../components/FeedbackModal';
import PersonasForm from './PersonasForm';
import { extractErrorMessage } from '../../../utils/errorHandler';

const PersonasEditarModal = ({ idPersona, onClose, onUpdated }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_persona: '',
    ci_rif: '',
    razon_social: '',
    direccion_fiscal: '',
    telefono: '',
    email: '',
  });

  // Estado para cargar los datos del registro a editar
  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState(null);

  // Estados para los modales de feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: '', // 'loading', 'success', 'error'
    message: '',
  });

  // Precargamos los datos actuales de la persona
  useEffect(() => {
    if (!idPersona) return;
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);
      try {
        const res = await axiosInstance.get(`/personas/${idPersona}`);
        const persona = Array.isArray(res.data) ? res.data[0] : res.data;
        setFormData({
          tipo_persona: persona.tipo_persona || '',
          ci_rif: persona.ci_rif || '',
          razon_social: persona.razon_social || '',
          direccion_fiscal: persona.direccion_fiscal || '',
          telefono: persona.telefono || '',
          email: persona.email || '',
        });
      } catch (err) {
        setErrorData(err.response?.data?.message || 'Error al cargar la persona');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [idPersona]);

  // Manejador de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Enviar el formulario (actualización parcial)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedbackModal({
      visible: true,
      type: 'loading',
      message: 'Actualizando persona...',
    });

    try {
      const response = await axiosInstance.put(`/personas/${idPersona}`, formData);

      setFeedbackModal({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Persona actualizada exitosamente.',
      });

      // Actualizamos la lista y cerramos el modal de edición
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al actualizar la persona.');

      setFeedbackModal({
        visible: true,
        type: 'error',
        message: errorMsg,
      });
    }
  };

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idPersona}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando persona...</span>
            </div>
          )}
          {errorData && !loadingData && <CAlert color="danger">{errorData}</CAlert>}
          {!loadingData && !errorData && (
            <PersonasForm
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
  );
};

export default PersonasEditarModal;
