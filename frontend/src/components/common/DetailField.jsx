/**
 * DetailField.jsx — Helpers compartidos para modales de detalle
 *
 * Uso:
 *   <Campo label="Tipo" value={data.tipo} md={6} bold />
 *   <Seccion titulo="Datos del Pago" />
 */
import { CCol, CFormInput, CFormLabel, CBadge } from "@coreui/react";

// ── Campo: par label + input de solo lectura ─────────────────────────────────
export const Campo = ({ label, value, md = 6, bold = false }) => (
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

// ── Seccion: separador + título de sección ───────────────────────────────────
export const Seccion = ({ titulo }) => (
  <>
    <hr className="section-divider" />
    <h5 className="section-title">{titulo}</h5>
  </>
);

// ── RepresentanteBadge: badge de numeración para representantes ──────────────
export const RepresentanteBadge = ({ numero }) => (
  <CBadge color="primary" shape="rounded-pill" className="rep-badge">
    Representante {numero}
  </CBadge>
);
