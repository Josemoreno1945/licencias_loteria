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
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
} from "@coreui/react";
import { getPersonaById } from "../services/personas.service";

// ── Helpers ──────────────────────────────────────────────────────────────────
const Campo = ({ label, value, md = 6, bold = false }) => (
  <CCol md={md}>
    <CFormLabel className="detail-field-label">{label}</CFormLabel>
    <CFormInput
      type="text"
      value={value || "—"}
      readOnly
      className={`detail-field-value${bold ? " fw-semibold" : ""}`}
    />
  </CCol>
);

const Seccion = ({ titulo }) => (
  <>
    <hr className="section-divider" />
    <h5 className="section-title">{titulo}</h5>
  </>
);

// ── Componente principal ──────────────────────────────────────────────────────
const PersonaDetalleModal = ({ idPersona, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idPersona) return;
    setData(null);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const persona = await getPersonaById(idPersona);
        setData(persona);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle de la persona",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idPersona]);

  if (!idPersona) return null;

  const tipoPersonaLabel =
    data?.tipo_persona === "natural"
      ? "Persona Natural"
      : data?.tipo_persona === "juridica"
        ? "Persona Jurídica"
        : null;

  return (
    <CModal
      visible={!!idPersona}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle de la Persona</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading && (
          <div className="d-flex justify-content-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {error && !loading && <CAlert color="danger">{error}</CAlert>}
        {!loading && !error && data && (
          <div className="px-2">
            {/* ── SECCIÓN 1: Información Principal ── */}
            <h5 className="section-title">Información Principal</h5>
            <CRow className="gy-3 mb-2">
              <Campo
                label="Tipo de Persona"
                value={tipoPersonaLabel}
                bold
                md={6}
              />
              <Campo label="CI / RIF" value={data.ci_rif} bold md={6} />
              <Campo
                label="Nombre / Razón Social"
                value={data.razon_social}
                bold
                md={12}
              />
            </CRow>

            {/* ── SECCIÓN 2: Datos de Contacto ── */}
            <Seccion titulo="Datos de Contacto" />
            <CRow className="gy-3 mb-2">
              <Campo label="Teléfono" value={data.telefono} md={6} />
              <Campo label="Email" value={data.email} md={6} />
              <Campo
                label="Dirección Fiscal"
                value={data.direccion_fiscal}
                md={12}
              />
            </CRow>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default PersonaDetalleModal;