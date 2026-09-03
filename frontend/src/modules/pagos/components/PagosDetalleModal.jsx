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
import { getPagoById } from "../services/pagos.service";

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

// ── Formateadores ────────────────────────────────────────────────────────────
const fmtFecha = (f) => {
  if (!f) return null;
  const d = new Date(f);
  return Number.isNaN(d.getTime()) ? f : d.toLocaleDateString();
};

const fmtMoneda = (m) => {
  if (m === null || m === undefined || m === "") return null;
  const n = Number(m);
  return Number.isNaN(n)
    ? String(m)
    : n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Componente principal ──────────────────────────────────────────────────────
const PagosDetalleModal = ({ idPago, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idPago) return;
    setData(null);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const pago = await getPagoById(idPago);
        setData(pago);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle del pago",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idPago]);

  if (!idPago) return null;

  const documento = data?.licencia || data?.autorizacion || data?.participacion;

  return (
    <CModal
      visible={!!idPago}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle del Pago</CModalTitle>
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
            {/* ── SECCIÓN 1: Información del Pago ── */}
            <h5 className="section-title">Información del Pago</h5>
            <CRow className="gy-3 mb-2">
              <Campo label="Banco" value={data.banco} bold md={6} />
              <Campo
                label="Número de Referencia"
                value={data.num_referencia}
                bold
                md={6}
              />
              <Campo
                label="Fecha del Pago"
                value={fmtFecha(data.fecha_pago)}
                md={6}
              />
              <Campo
                label="Monto (Bs.)"
                value={fmtMoneda(data.monto)}
                bold
                md={6}
              />
              <Campo
                label="Tasa del Día (Bs./USD)"
                value={fmtMoneda(data.tasa_dia)}
                md={6}
              />
              <Campo
                label="Responsable"
                value={data.responsable_texto}
                md={6}
              />
            </CRow>

            {/* ── SECCIÓN 2: Documento Asociado ── */}
            <Seccion titulo="Documento Asociado" />
            <CRow className="gy-3 mb-2">
              <Campo
                label="N° de Documento"
                value={documento}
                bold
                md={12}
              />
            </CRow>

            {/* ── SECCIÓN 3: Notas y Auditoría ── */}
            {(data.observaciones || data.registrado_por) && (
              <>
                <Seccion titulo="Notas y Auditoría" />
                <CRow className="gy-3 mb-2">
                  {data.observaciones && (
                    <Campo
                      label="Observaciones"
                      value={data.observaciones}
                      md={12}
                    />
                  )}
                  <Campo
                    label="Registrado Por"
                    value={data.registrado_por}
                    md={6}
                  />
                  <Campo
                    label="Fecha de Registro"
                    value={fmtFecha(data.created_at)}
                    md={6}
                  />
                </CRow>
              </>
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

export default PagosDetalleModal;