import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
} from "@coreui/react";
import { getJuegoById } from "../services/juegos.service";

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
const JuegosDetalleModal = ({ idJuego, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idJuego) return;
    setData(null);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const juego = await getJuegoById(idJuego);
        setData(juego);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle del juego",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idJuego]);

  if (!idJuego) return null;

  return (
    <CModal
      visible={!!idJuego}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle del Juego</CModalTitle>
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
            <h5 className="section-title">Información del Juego</h5>
            <CRow className="gy-3 mb-2">
              <Campo
                label="Nombre del Juego"
                value={data.nombre}
                bold
                md={6}
              />
              <CCol md={6}>
                <CFormLabel className="detail-field-label">Estado</CFormLabel>
                <div className="pt-1">
                  <CBadge
                    color={data.estado === "activo" ? "success" : "secondary"}
                    shape="rounded-pill"
                    className="status-badge fs-6 px-3 py-2"
                  >
                    {data.estado === "activo" ? "Activo" : "Inactivo"}
                  </CBadge>
                </div>
              </CCol>
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

export default JuegosDetalleModal;