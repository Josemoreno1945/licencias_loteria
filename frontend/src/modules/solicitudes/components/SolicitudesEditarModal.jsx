import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import axiosInstance from "../../../api/axiosInstance";
import FeedbackModal from "../../../components/FeedbackModal";
import SolicitudesForm from "./SolicitudesForm";
import { extractErrorMessage } from "../../../utils/errorHandler";
import {
  updateSolicitud,
  getSolicitudById,
} from "../services/solicitudes.service";

const SolicitudesEditarModal = ({ idSolicitud, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [errorData, setErrorData] = useState(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!idSolicitud) return;

    const cargarDatos = async () => {
      setLoadingData(true);
      setLoadingDeps(true);
      setErrorData(null);

      try {
        const response = await getSolicitudById(idSolicitud);

        const juegos = (() => {
          if (!response?.juegos) return [];
          if (Array.isArray(response?.juegos)) return response.juegos;
          try {
            return JSON.parse(response.juegos);
          } catch {
            return [];
          }
        })();

        const centros = (() => {
          if (!response?.centros) return [];
          if (Array.isArray(response?.centros)) return response.centros;
          try {
            return JSON.parse(response.centros);
          } catch {
            return [];
          }
        })();

        setFormData({
          id_solicitudes: response.id_solicitudes || "",
          id_persona: response.id_persona || "",
          id_comercializador: response.id_comercializador || null,
          id_centro: centros.length > 0 ? centros[0].id_centro : null,
          tipo_tramite: response.tipo_tramite || "",
          categoria_licencia: response.categoria_licencia || null,
          tipo_emision: response.tipo_emision || null,
          tipo_participacion: response.tipo_participacion || null,
          tipo_autorizacion_especial:
            response.tipo_autorizacion_especial || null,
          numero_autorizacion_conalot:
            response.numero_autorizacion_conalot || null,
          fecha_emision_conalot: response.fecha_emision_conalot
            ? new Date(response.fecha_emision_conalot)
                .toISOString()
                .split("T")[0]
            : null,
          fecha_vencimiento_conalot: response.fecha_vencimiento_conalot
            ? new Date(response.fecha_vencimiento_conalot)
                .toISOString()
                .split("T")[0]
            : null,
          numero_licencia_loteriatachira:
            response.numero_licencia_loteriatachira || null,
          direccion_autorizacion_especial:
            response.direccion_autorizacion_especial || null,
          id_juegos: juegos.map((j) => j.id_juego) || [],
          descripcion_tramite: response.descripcion_tramite || "",
          observaciones: response.observaciones || "",
          estado: response.estado || "Pendiente",
          justificacion_no_logrado: response.justificacion_no_logrado || null,
        });
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          "Error al cargar los datos de la solicitud",
        );
        setErrorData(msg);
      } finally {
        setLoadingData(false);
        setLoadingDeps(false);
      }
    };

    cargarDatos();
  }, [idSolicitud]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value || null };

      if (name === "tipo_tramite") {
        next.categoria_licencia = null;
        next.tipo_emision = null;
        next.tipo_participacion = null;
        next.tipo_autorizacion_especial = null;
        next.numero_autorizacion_conalot = null;
        next.fecha_emision_conalot = null;
        next.fecha_vencimiento_conalot = null;
        next.numero_licencia_loteriatachira = null;
        next.direccion_autorizacion_especial = null;
        next.id_juegos = [];
      }

      if (name === "id_comercializador") {
        next.id_centro = null;
        next.id_persona = "";
      }

      return next;
    });
  }, []);

  const handleJuegosChange = useCallback((nuevosJuegos) => {
    setFormData((prev) => ({ ...prev, id_juegos: nuevosJuegos }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData) return;

    setFeedbackModal({
      visible: true,
      type: "loading",
      message: "Actualizando solicitud...",
    });

    try {
      const payload = {
        ...formData,
        id_comercializador: formData.id_comercializador || null,
        id_centro: formData.id_centro || null,
        categoria_licencia: formData.categoria_licencia || null,
        tipo_emision: formData.tipo_emision || null,
        tipo_participacion: formData.tipo_participacion || null,
        tipo_autorizacion_especial: formData.tipo_autorizacion_especial || null,
        numero_autorizacion_conalot:
          formData.numero_autorizacion_conalot || null,
        fecha_emision_conalot: formData.fecha_emision_conalot || null,
        fecha_vencimiento_conalot: formData.fecha_vencimiento_conalot || null,
        numero_licencia_loteriatachira:
          formData.numero_licencia_loteriatachira || null,
        direccion_autorizacion_especial:
          formData.direccion_autorizacion_especial || null,
        descripcion_tramite: formData.descripcion_tramite || null,
        observaciones: formData.observaciones || null,
        justificacion_no_logrado: formData.justificacion_no_logrado || null,
      };

      const response = await updateSolicitud(idSolicitud, payload);

      setFeedbackModal({
        visible: true,
        type: "success",
        message: response?.message || "Solicitud actualizada exitosamente.",
      });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrió un error al actualizar la solicitud.",
      );
      setFeedbackModal({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (!idSolicitud) return null;

  return (
    <React.Fragment>
      <FeedbackModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal({ ...feedbackModal, visible: false })}
      />

      <CModal
        visible={!!idSolicitud}
        onClose={onClose}
        alignment="center"
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Editar Solicitud</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loadingData && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando solicitud...</span>
            </div>
          )}

          {errorData && !loadingData && (
            <CAlert color="danger">{errorData}</CAlert>
          )}

          {!loadingData && !errorData && formData && (
            <SolicitudesForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleJuegosChange={handleJuegosChange}
              onSubmit={handleSubmit}
              loadingDeps={loadingDeps}
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

export default SolicitudesEditarModal;
