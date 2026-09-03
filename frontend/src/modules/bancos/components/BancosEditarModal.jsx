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
import BancosForm from "./BancosForm";
import { extractErrorMessage } from "../../../utils/errorHandler";
import {
  getBancoById,
  updateBanco,
} from "../services/bancos.service";

const BancosEditarModal = ({ idBanco, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    estado: "activo",
  });

  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!idBanco) return;
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);
      try {
        const banco = await getBancoById(idBanco);
        setFormData({
          nombre: banco.nombre || "",
          codigo: banco.codigo || "",
          estado: banco.estado || "activo",
        });
      } catch (err) {
        const msg = extractErrorMessage(err, "Error al cargar el banco");
        setErrorData(msg);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [idBanco]);

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
      message: "Actualizando banco...",
    });

    try {
      const payload = {};
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      const response = await updateBanco(idBanco, payload);

      setFeedbackModal({
        visible: true,
        type: "success",
        message: response?.message || "Banco actualizado exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrio un error inesperado al actualizar el banco.",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idBanco) return null;

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idBanco}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Banco</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando banco...</span>
            </div>
          )}
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
          {!loadingData && !errorData && (
            <BancosForm
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

export default BancosEditarModal;