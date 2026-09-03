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
import ComercializadoresForm from "./ComercializadoresForm";
import { extractErrorMessage } from "../../../utils/errorHandler";
import { getPersonas } from "../../personas/services/personas.service";
import {
  getComercializadorDetalleCompleto,
  updateComercializador,
} from "../services/comercializadores.service";

const ComercializadoresEditarModal = ({
  idComercializador,
  onClose,
  onUpdated,
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    rif: "",
    razon_social: "",
    direccion_fiscal: "",
    telefono: "",
    email: "",
    estado: "activo",
    representantes: [{ id_persona: "", cargo: "" }],
  });

  // Datos para los selects dinámicos
  const [personas, setPersonas] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [errorDeps, setErrorDeps] = useState(null);

  // Estado para cargar los datos del registro a editar
  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState(null);

  // Estados para los modales de feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  // Precargamos los datos actuales del comercializador
  useEffect(() => {
    if (!idComercializador) return;
    const fetchData = async () => {
      setLoadingData(true);
      setLoadingDeps(true);
      setErrorData(null);
      setErrorDeps(null);
      try {
        const [comercializador, personasData] = await Promise.all([
          getComercializadorDetalleCompleto(idComercializador),
          getPersonas(),
        ]);

        let representantesData = [{ id_persona: "", cargo: "" }];
        if (
          comercializador.representantes &&
          comercializador.representantes.length > 0
        ) {
          representantesData = comercializador.representantes.map((rep) => ({
            id_persona: rep.id_persona || "",
            cargo: rep.cargo || "",
          }));
        }

        setFormData({
          rif: comercializador.rif || "",
          razon_social: comercializador.razon_social || "",
          direccion_fiscal: comercializador.direccion_fiscal || "",
          telefono: comercializador.telefono || "",
          email: comercializador.email || "",
          estado: comercializador.estado || "activo",
          representantes: representantesData,
        });

        setPersonas(personasData || []);
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          "Error al cargar el comercializador",
        );
        setErrorData(msg);
        setErrorDeps(msg);
      } finally {
        setLoadingData(false);
        setLoadingDeps(false);
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
      type: "loading",
      message: "Actualizando comercializador...",
    });

    try {
      // Construimos el payload solo con campos con valores reales
      const payload = {};
      Object.keys(formData).forEach((key) => {
        if (key === "representantes") return;
        const val = formData[key];
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      // Agregar representantes solo si hay al menos uno con id_persona
      const repsFiltrados = formData.representantes.filter((r) => r.id_persona);
      if (repsFiltrados.length > 0) {
        payload.representantes = repsFiltrados;
      }

      const response = await updateComercializador(idComercializador, payload);

      setFeedbackModal({
        visible: true,
        type: "success",
        message: response?.message || "Comercializador actualizado exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrió un error inesperado al actualizar el comercializador.",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idComercializador) return null;

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
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
          {!loadingData && !errorData && (
            <ComercializadoresForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isEditMode
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

export default ComercializadoresEditarModal;