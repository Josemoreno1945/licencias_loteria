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
import CentrosApuestaForm from './CentrosApuestaForm';
import { extractErrorMessage } from '../../../utils/errorHandler';

const CentrosApuestaEditarModal = ({ idCentro, onClose, onUpdated }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    id_comercializador: '',
    nombre_agencia: '',
    direccion: '',
    estado: 'activo',
    representantes: [{ id_persona: '', cargo: '' }],
  });

  // Datos para los selects dinámicos
  const [comercializadores, setComercializadores] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [errorDeps, setErrorDeps] = useState(null);

  // Estado para cargar los datos del registro a editar
  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState(null);

  // Estados para los modales de feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: '', // 'loading', 'success', 'error'
    message: '',
  });

  // Cargar comercializadores, personas y los datos del centro en paralelo
  useEffect(() => {
    if (!idCentro) return;
    const cargarDatos = async () => {
      setLoadingData(true);
      setLoadingDeps(true);
      setErrorData(null);
      setErrorDeps(null);
      try {
        const [resCentro, resComercializadores, resPersonas] = await Promise.all([
          axiosInstance.get(`/centros_apuesta/${idCentro}/detalle-completo`),
          axiosInstance.get('/comercializadores'),
          axiosInstance.get('/personas'),
        ]);

        const centro = resCentro.data;

        // Mapear representantes desde la respuesta del backend
        let representantesData = [{ id_persona: '', cargo: 'Representante Legal' }];
        if (centro.representantes && centro.representantes.length > 0) {
          representantesData = centro.representantes.map((rep) => ({
            id_persona: rep.id_persona || '',
            cargo: rep.cargo || 'Representante Legal',
          }));
        }

        setFormData({
          id_comercializador: centro.id_comercializador || '',
          nombre_agencia: centro.nombre_agencia || '',
          direccion: centro.direccion || '',
          estado: centro.estado || 'activo',
          representantes: representantesData,
        });

        setComercializadores(resComercializadores.data || []);
        setPersonas(resPersonas.data || []);
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al cargar los datos del centro de apuesta';
        setErrorData(msg);
        setErrorDeps(msg);
      } finally {
        setLoadingData(false);
        setLoadingDeps(false);
      }
    };
    cargarDatos();
  }, [idCentro]);

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
      message: 'Actualizando centro de apuesta...',
    });

    try {
      // Construimos el payload solo con campos con valores reales
      // (evita sobreescribir campos con strings vacíos)
      const payload = {};
      Object.keys(formData).forEach((key) => {
        if (key === 'representantes') return; // Se procesa aparte
        const val = formData[key];
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      // Agregar representantes solo si hay al menos uno con id_persona
      const repsFiltrados = formData.representantes.filter((r) => r.id_persona);
      if (repsFiltrados.length > 0) {
        payload.representantes = repsFiltrados;
      }

      const response = await axiosInstance.put(`/centros_apuesta/${idCentro}`, payload);

      setFeedbackModal({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Centro de apuesta actualizado exitosamente.',
      });

      // Actualizamos la lista y cerramos el modal de edición
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al actualizar el centro de apuesta.');

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
        visible={!!idCentro}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Centro de Apuesta</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando centro de apuesta...</span>
            </div>
          )}
          {errorData && !loadingData && <CAlert color="danger">{errorData}</CAlert>}
          {!loadingData && !errorData && (
            <CentrosApuestaForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isEditMode
              comercializadores={comercializadores}
              personas={personas}
              loadingDeps={loadingDeps}
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

export default CentrosApuestaEditarModal;
