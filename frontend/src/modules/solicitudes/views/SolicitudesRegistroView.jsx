import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import axiosInstance from '../../../api/axiosInstance';
import FeedbackModal from '../../../components/FeedbackModal';
import SolicitudesForm from '../components/SolicitudesForm';
import { useAuth } from '../../auth/store/AuthContext';
import { extractErrorMessage } from '../../../utils/errorHandler';

// Estado inicial vacío del formulario
const INITIAL_FORM = {
  // Entidades vinculadas
  id_persona:          '',    // Se elige del selector de representantes del comercializador
  id_comercializador:  null,
  id_centro:           null,  // Centro de apuesta opcional

  // Tipo de trámite y subtipos
  tipo_tramite:              '',
  categoria_licencia:        null,
  tipo_emision:              null,   // Licencia: Inscripcion | Renovacion
  tipo_participacion:        null,   // Participacion: Archivo | Certificacion | Rectificacion | Nulidad
  tipo_autorizacion_especial: null,  // Autorizacion_especial: Movil | Localidad | Mesa
  numero_autorizacion_conalot: null, // Participacion: nro. CONALOT
  fecha_emision_conalot:       null, // Participacion
  fecha_vencimiento_conalot:   null, // Participacion
  numero_licencia_loteriatachira: null, // Participacion
  direccion_autorizacion_especial: null, // Autorizacion Especial

  // Juegos seleccionados (N:M)
  id_juegos: [],

  // Notas internas
  descripcion_tramite: '',
  observaciones:       '',
};

const SolicitudesRegistroView = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);

  const [modalState, setModalState] = useState({
    visible: false,
    type: '',     // 'loading' | 'success' | 'error'
    message: '',
  });

  // Manejador genérico para inputs/selects
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value || null };

      // Al cambiar el tipo de trámite, limpiar campos específicos del tipo anterior
      if (name === 'tipo_tramite') {
        next.categoria_licencia         = null;
        next.tipo_emision               = null;
        next.tipo_participacion         = null;
        next.tipo_autorizacion_especial = null;
        next.numero_autorizacion_conalot = null;
        next.fecha_emision_conalot       = null;
        next.fecha_vencimiento_conalot   = null;
        next.numero_licencia_loteriatachira = null;
        next.direccion_autorizacion_especial = null;
        next.id_juegos                  = [];
      }

      // Al cambiar el comercializador, limpiar centro y persona titular
      if (name === 'id_comercializador') {
        next.id_centro  = null;
        next.id_persona = '';
      }

      // Al cambiar el centro, no afecta al representante del comercializador
      return next;
    });
  };

  // Manejador específico para el selector de juegos (array de UUIDs)
  const handleJuegosChange = (nuevosJuegos) => {
    setFormData((prev) => ({ ...prev, id_juegos: nuevosJuegos }));
  };

  // Enviar el formulario al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando solicitud...',
    });

    try {
      const payload = {
        ...formData,
        registrado_por: user?.id_usuario,
        // Asegurar nulos en lugar de strings vacíos para los campos opcionales
        id_comercializador:           formData.id_comercializador || null,
        id_centro:                    formData.id_centro || null,
        categoria_licencia:           formData.categoria_licencia || null,
        tipo_emision:                 formData.tipo_emision || null,
        tipo_participacion:           formData.tipo_participacion || null,
        tipo_autorizacion_especial:   formData.tipo_autorizacion_especial || null,
        numero_autorizacion_conalot:  formData.numero_autorizacion_conalot || null,
        fecha_emision_conalot:        formData.fecha_emision_conalot || null,
        fecha_vencimiento_conalot:    formData.fecha_vencimiento_conalot || null,
        numero_licencia_loteriatachira: formData.numero_licencia_loteriatachira || null,
        direccion_autorizacion_especial: formData.direccion_autorizacion_especial || null,
        descripcion_tramite:          formData.descripcion_tramite || null,
        observaciones:                formData.observaciones || null,
      };

      const response = await axiosInstance.post('/solicitudes', payload);

      setModalState({
        visible: true,
        type: 'success',
        message: response.data?.message || 'Solicitud registrada exitosamente.',
      });

      // Limpiar el formulario tras el éxito
      setFormData(INITIAL_FORM);

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
          <h4 className="mb-2 text-primary">Registro de Solicitud</h4>
          <p className="text-muted small mb-3">
            Seleccione el tipo de trámite y complete los datos. Los campos del Comercializador y
            Centro de Apuesta se autocompletan automáticamente al seleccionarlos.
          </p>
        </CCardHeader>
        <CCardBody>
          <SolicitudesForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleJuegosChange={handleJuegosChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default SolicitudesRegistroView;
