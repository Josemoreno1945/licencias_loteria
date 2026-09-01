import { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CAlert,
} from "@coreui/react";
import axiosInstance from "../../../api/axiosInstance";
import FeedbackModal from "../../../components/FeedbackModal";
import ParticipacionesForm from "./ParticipacionesForm";
import { extractErrorMessage } from "../../../utils/errorHandler";

const ParticipacionesEditarModal = ({ idParticipacion, onClose, onUpdated }) => {
  const [formData,      setFormData]      = useState(null);
  const [solicitudes,   setSolicitudes]   = useState([]);
  const [bancos,        setBancos]        = useState([]);

  const [loadingData,   setLoadingData]   = useState(false);
  const [loadingDeps,   setLoadingDeps]   = useState(true);
  const [errorData,     setErrorData]     = useState(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!idParticipacion) return;

    const cargarDatos = async () => {
      setLoadingData(true);
      setLoadingDeps(true);
      setErrorData(null);
      setFormData(null);

      try {
        const [resParticipacion, resSolicitudes, resBancos] = await Promise.all([
          axiosInstance.get(`/participaciones/${idParticipacion}`),
          axiosInstance.get("/solicitudes/por-tipo/Participacion"),
          axiosInstance.get("/bancos"),
        ]);

        const participacion = Array.isArray(resParticipacion.data)
          ? resParticipacion.data[0]
          : resParticipacion.data;

        setFormData({
          id_solicitud:              participacion.id_solicitud || "",
          numero_documento:          participacion.numero_documento || "",
          papel_seguridad:           participacion.papel_seguridad || "",
          tipo_emision:              participacion.tipo_emision || "Inscripcion",
          id_documento_anterior:     participacion.id_documento_anterior || "",
          fecha_expedicion:          participacion.fecha_expedicion
            ? participacion.fecha_expedicion.slice(0, 10)
            : "",
          fecha_vencimiento:         participacion.fecha_vencimiento
            ? participacion.fecha_vencimiento.slice(0, 10)
            : "",
          direccion_establecimiento: participacion.direccion_establecimiento || "",
          detalles_extra:            participacion.detalles_extra || "",
          numero_lot:                participacion.numero_lot || "",
          nro_archivo:               participacion.nro_archivo || "",
          tipo:                      participacion.tipo || "",
          licencia_autorizacion:     participacion.licencia_autorizacion || "",
          territorio:                participacion.territorio || "",
          id_banco:           "",
          num_referencia:     participacion.pago_numero_referencia || "",
          monto:              participacion.pago_monto || "",
          tasa_dia:           participacion.pago_tasa_dia || "",
          fecha_pago:         participacion.pago_fecha_pago
            ? participacion.pago_fecha_pago.slice(0, 10)
            : "",
          responsable_texto:  participacion.pago_responsable || "",
          observaciones_pago: participacion.pago_observaciones || "",
        });

        setSolicitudes(resSolicitudes.data || []);
        setBancos(resBancos.data || []);
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          "Error al cargar los datos de la participación",
        );
        setErrorData(msg);
      } finally {
        setLoadingData(false);
        setLoadingDeps(false);
      }
    };

    cargarDatos();
  }, [idParticipacion]);

  const handleInputChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (e.target.multiple) {
      setFormData((prev) => ({
        ...prev,
        [name]: Array.from(selectedOptions, (option) => option.value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    setFeedbackModal({
      visible: true,
      type: "loading",
      message: "Actualizando participación...",
    });

    try {
      const payload = {};
      const editableFields = ["numero_lot", "nro_archivo"]; // Según backend, lo que se puede actualizar

      editableFields.forEach((key) => {
        const val = formData[key];
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      const response = await axiosInstance.put(
        `/participaciones/${idParticipacion}`,
        payload,
      );

      setFeedbackModal({
        visible: true,
        type: "success",
        message:
          response.data?.message || "Participación actualizada exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Error al actualizar la participación",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idParticipacion) return null;

  return (
    <>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() =>
          setFeedbackModal({ ...feedbackModal, visible: false })
        }
      />

      <CModal
        visible={!!idParticipacion}
        onClose={onClose}
        alignment="center"
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Participación</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando participación...</span>
            </div>
          )}
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
          {!loadingData && !errorData && formData && (
            <ParticipacionesForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={onClose}
              solicitudes={solicitudes}
              bancos={bancos}
              loadingDeps={loadingDeps}
              isEditMode
            />
          )}
        </CModalBody>

        <CModalFooter className="d-none" />
      </CModal>
    </>
  );
};

export default ParticipacionesEditarModal;
