import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
} from "@coreui/react";
import FeedbackModal from "../../../components/FeedbackModal";
import JuegosForm from "./JuegosForm";
import { extractErrorMessage } from "../../../utils/errorHandler";
import {
  getJuegoById,
  updateJuego,
} from "../services/juegos.service";

const JuegosEditarModal = ({ idJuego, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: "",
  });

  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!idJuego) return;
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);
      try {
        const juego = await getJuegoById(idJuego);
        setFormData({
          nombre: juego.nombre || "",
        });
      } catch (err) {
        const msg = extractErrorMessage(err, "Error al cargar el juego");
        setErrorData(msg);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [idJuego]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedbackModal({
      visible: true,
      type: "loading",
      message: "Actualizando juego...",
    });

    try {
      const payload = {};
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      const response = await updateJuego(idJuego, payload);

      setFeedbackModal({
        visible: true,
        type: "success",
        message: response?.message || "Juego actualizado exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrio un error inesperado al actualizar el juego.",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idJuego) return null;

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idJuego}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Juego</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando juego...</span>
            </div>
          )}
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
          {!loadingData && !errorData && (
            <JuegosForm
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

export default JuegosEditarModal;