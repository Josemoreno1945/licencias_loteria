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
import ComercializadoresForm from './ComercializadoresForm';
import { extractErrorMessage } from '../../../utils/errorHandler';

const ComercializadoresEditarModal = ({ idComercializador, onClose, onUpdated }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    direccion_fiscal: '',
    telefono: '',
    email: '',
    estado: 'activo',
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

  // Precargamos los datos actuales del comercializador
  useEffect(() => {
    if (!idComercializador) return;
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);
      try {
        const res = await axiosInstance.get(`/comercializadores/${idComercializador}`);
        const comercializador = Array.isArray(res.data) ? res.data[0] : res.data;
        setFormData({
          rif: comercializador.rif || '',
          razon_social: comercializador.razon_social || '',
          direccion_fiscal: comercializador.direccion_fiscal || '',
          telefono: comercializador.telefono || '',
          email: comercializador.email || '',
          estado: comercializador.estado || 'activo',
        });
      } catch (err) {
        setErrorData(err.response?.data?.message || 'Error al cargar el comercializador');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [idComercializador]);

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
      message: 'Actualizando comercializador...',
    });

    try {
      // Construimos el payload solo con campos con valores reales
      // (evita sobreescribir campos con strings vacíos)
      const payload = {};
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      const response = await axiosInstance.put(`/comercializadores/${idComercializador}`, payload);

      setFeedbackModal({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Comercializador actualizado exitosamente.',
      });

      // Actualizamos la lista y cerramos el modal de edición
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al actualizar el comercializador.');

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
        visible={!!idComercializador}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Comercializador</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando comercializador...</span>
            </div>
          )}
          {errorData && !loadingData && <CAlert color="danger">{errorData}</CAlert>}
          {!loadingData && !errorData && (
            <ComercializadoresForm
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

export default ComercializadoresEditarModal;
