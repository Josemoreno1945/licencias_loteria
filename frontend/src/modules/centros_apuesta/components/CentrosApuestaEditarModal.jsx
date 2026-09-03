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
import CentrosApuestaForm from "./CentrosApuestaForm";
import { extractErrorMessage } from "../../../utils/errorHandler";
import { getPersonas } from "../../personas/services/personas.service";
import { getComercializadores } from "../../comercializadores/services/comercializadores.service";
import {
  getCentroDetalleCompleto,
  updateCentroApuesta,
} from "../services/centros_apuesta.service";

const CentrosApuestaEditarModal = ({ idCentro, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    id_comercializador: "",
    nombre_agencia: "",
    direccion: "",
    estado: "activo",
    representantes: [{ id_persona: "", cargo: "" }],
  });

  const [comercializadores, setComercializadores] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [errorDeps, setErrorDeps] = useState(null);

  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!idCentro) return;
    const cargarDatos = async () => {
      setLoadingData(true);
      setLoadingDeps(true);
      setErrorData(null);
      setErrorDeps(null);
      try {
        const [centro, comercializadoresData, personasData] = await Promise.all([
          getCentroDetalleCompleto(idCentro),
          getComercializadores(),
          getPersonas(),
        ]);

        let representantesData = [
          { id_persona: "", cargo: "Representante Legal" },
        ];
        if (centro.representantes && centro.representantes.length > 0) {
          representantesData = centro.representantes.map((rep) => ({
            id_persona: rep.id_persona || "",
            cargo: rep.cargo || "Representante Legal",
          }));
        }

        setFormData({
          id_comercializador: centro.id_comercializador || "",
          nombre_agencia: centro.nombre_agencia || "",
          direccion: centro.direccion || "",
          estado: centro.estado || "activo",
          representantes: representantesData,
        });

        setComercializadores(comercializadoresData || []);
        setPersonas(personasData || []);
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          "Error al cargar los datos del centro de apuesta",
        );
        setErrorData(msg);
        setErrorDeps(msg);
      } finally {
        setLoadingData(false);
        setLoadingDeps(false);
      }
    };
    cargarDatos();
  }, [idCentro]);

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
      message: "Actualizando centro de apuesta...",
    });

    try {
      const payload = {};
      Object.keys(formData).forEach((key) => {
        if (key === "representantes") return;
        const val = formData[key];
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      const repsFiltrados = formData.representantes.filter((r) => r.id_persona);
      if (repsFiltrados.length > 0) {
        payload.representantes = repsFiltrados;
      }

      const response = await updateCentroApuesta(idCentro, payload);

      setFeedbackModal({
        visible: true,
        type: "success",
        message: response?.message || "Centro de apuesta actualizado exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrio un error inesperado al actualizar el centro de apuesta.",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idCentro) return null;

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
              <span className="ms-3 text-muted">
                Cargando centro de apuesta...
              </span>
            </div>
          )}
          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}
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