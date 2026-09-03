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
import { getUsuarioById } from "../services/usuarios.service";

const ROLE_LABELS = {
  superAdmin: "Super Administrador",
  gerente: "Gerente",
  gestor_de_tramites: "Gestor de Tramites",
  supervisor: "Supervisor",
};

const rolBadgeColor = (rol) => {
  if (rol === "superAdmin" || rol === "gerente") return "danger";
  if (rol === "supervisor") return "warning";
  return "info";
};

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
const UsuarioDetalleModal = ({ idUsuario, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idUsuario) return;
    setData(null);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const usuario = await getUsuarioById(idUsuario);
        setData(usuario);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle del usuario",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idUsuario]);

  if (!idUsuario) return null;

  return (
    <CModal
      visible={!!idUsuario}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle del Usuario</CModalTitle>
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
            <h5 className="section-title">Información del Usuario</h5>
            <CRow className="gy-3 mb-2">
              <Campo
                label="Nombre de Usuario"
                value={data.nombre_usuario}
                bold
                md={6}
              />
              <Campo
                label="Correo Electronico"
                value={data.email}
                bold
                md={6}
              />
              <CCol md={6}>
                <CFormLabel className="detail-field-label">Rol</CFormLabel>
                <div className="pt-1">
                  <CBadge
                    color={rolBadgeColor(data.rol)}
                    shape="rounded-pill"
                    className="status-badge fs-6 px-3 py-2"
                  >
                    {ROLE_LABELS[data.rol] || data.rol}
                  </CBadge>
                </div>
              </CCol>
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

export default UsuarioDetalleModal;