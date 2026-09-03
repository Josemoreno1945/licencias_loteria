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
import UsuariosForm from "./UsuariosForm";
import { extractErrorMessage } from "../../../utils/errorHandler";
import {
  getUsuarioById,
  updateUsuario,
} from "../services/usuarios.service";

const UsuariosEditarModal = ({ idUsuario, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    email: "",
    password: "",
    rol: "",
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
    if (!idUsuario) return;
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);
      try {
        const usuario = await getUsuarioById(idUsuario);
        setFormData({
          nombre_usuario: usuario.nombre_usuario || "",
          email: usuario.email || "",
          password: "",
          rol: usuario.rol || "",
          estado: usuario.estado || "activo",
        });
      } catch (err) {
        const msg = extractErrorMessage(err, "Error al cargar el usuario");
        setErrorData(msg);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [idUsuario]);

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
      message: "Actualizando usuario...",
    });

    try {
      // La contraseña es opcional en edición: si no se envía, no se actualiza
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const response = await updateUsuario(idUsuario, payload);

      setFeedbackModal({
        visible: true,
        type: "success",
        message: response?.message || "Usuario actualizado exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrio un error inesperado al actualizar el usuario.",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idUsuario) return null;

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idUsuario}
        onClose={onClose}
        alignment="center"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando usuario...</span>
            </div>
          )}
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
          {!loadingData && !errorData && (
            <UsuariosForm
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

export default UsuariosEditarModal;