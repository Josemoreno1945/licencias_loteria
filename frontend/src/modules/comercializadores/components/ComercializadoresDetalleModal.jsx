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
  CBadge,
} from "@coreui/react";
import { getComercializadorDetalleCompleto } from "../services/comercializadores.service";

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
const ComercializadoresDetalleModal = ({ idComercializador, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idComercializador) return;
    setData(null);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getComercializadorDetalleCompleto(idComercializador);
        setData(res);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle del comercializador",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idComercializador]);

  if (!idComercializador) return null;

  const representantes = Array.isArray(data?.representantes)
    ? data.representantes
    : [];

  return (
    <CModal
      visible={!!idComercializador}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle del Comercializador</CModalTitle>
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
            {/* ── SECCIÓN 1: Información del Comercializador ── */}
            <h5 className="section-title">Información del Comercializador</h5>
            <CRow className="gy-3 mb-2">
              <Campo label="RIF" value={data.rif} bold md={6} />
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
              <Campo
                label="Razón Social"
                value={data.razon_social}
                bold
                md={12}
              />
              <Campo
                label="Dirección Fiscal"
                value={data.direccion_fiscal}
                md={12}
              />
              <Campo label="Teléfono" value={data.telefono} md={6} />
              <Campo label="Email" value={data.email} md={6} />
            </CRow>

            {/* ── SECCIÓN 2: Representantes Legales ── */}
            <Seccion titulo="Representantes Legales" />
            {representantes.length > 0 ? (
              <>
                {representantes.map((r, i) => (
                  <React.Fragment key={r.id_persona || i}>
                    <CRow className="gy-3 mb-2 align-items-end">
                      <CCol md={12} className="mb-2">
                        <CBadge
                          color="primary"
                          shape="rounded-pill"
                          className="rep-badge"
                        >
                          Representante {i + 1}
                          {r.cargo ? ` — ${r.cargo}` : ""}
                        </CBadge>
                      </CCol>
                      <Campo
                        label="Cédula / RIF"
                        value={r.ci_rif}
                        md={6}
                        bold
                      />
                      <Campo
                        label="Nombre / Razón Social"
                        value={r.razon_social}
                        md={6}
                      />
                    </CRow>
                    {i < representantes.length - 1 && (
                      <hr className="text-muted opacity-25 my-3" />
                    )}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <CAlert color="info" className="py-2 small mb-0">
                Este comercializador no tiene representantes legales
                registrados.
              </CAlert>
            )}
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

export default ComercializadoresDetalleModal;