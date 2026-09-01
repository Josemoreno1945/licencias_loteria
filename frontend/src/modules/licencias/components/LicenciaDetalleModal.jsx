import { useState, useEffect } from "react";
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
} from "@coreui/react";
import axiosInstance from "../../../api/axiosInstance";
import { Campo, Seccion } from "../../../components/common/DetailField";

// ── Helpers ──────────────────────────────────────────────────────────────────
const getEstadoDocColor = (estado) => {
  switch (estado) {
    case "vigente":    return "success";
    case "vencido":    return "danger";
    case "suspendido": return "warning";
    case "anulado":    return "secondary";
    default:           return "secondary";
  }
};

const getDetallesExtra = (val) => {
  if (val == null) return null;
  try {
    const obj = typeof val === "string" ? JSON.parse(val) : val;
    if (obj && typeof obj === "object" && obj.observaciones != null) {
      return obj.observaciones || null;
    }
    return JSON.stringify(obj);
  } catch {
    return String(val);
  }
};

// ── Componente principal ──────────────────────────────────────────────────────
const LicenciaDetalleModal = ({ idLicencia, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [juegos, setJuegos] = useState([]);
  const [loadingJuegos, setLoadingJuegos] = useState(false);

  useEffect(() => {
    if (!idLicencia) return;
    setData(null);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/licencias/${idLicencia}`);
        setData(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle de la licencia",
        );
      } finally {
        setLoading(false);
      }

      setLoadingJuegos(true);
      try {
        const resJ = await axiosInstance.get(
          `/documento-juegos/por-documento/${idLicencia}`,
        );
        setJuegos(resJ.data || []);
      } catch {
        setJuegos([]);
      } finally {
        setLoadingJuegos(false);
      }
    };

    fetchData();
  }, [idLicencia]);

  if (!idLicencia) return null;

  return (
    <CModal
      visible={!!idLicencia}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle de la Licencia</CModalTitle>
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

            {/* ── SECCIÓN 1: Información del Documento ── */}
            <h5 className="section-title">Información del Documento</h5>
            <CRow className="gy-3 mb-2">
              <Campo
                label="Nº de Documento"
                value={data.numero_documento}
                md={6}
                bold
              />
              <CCol md={6}>
                <label className="detail-field-label">Estado</label>
                <div className="pt-1">
                  <CBadge
                    color={getEstadoDocColor(data.estado_documento)}
                    shape="rounded-pill"
                    className="status-badge fs-6 px-3 py-2"
                  >
                    {data.estado_documento}
                  </CBadge>
                </div>
              </CCol>

              <Campo label="Tipo de Licencia" value={data.categoria} md={6} bold />
              <Campo label="Tipo de Emisión" value={data.tipo_emision} md={6} />

              <Campo
                label="Fecha de Expedición"
                value={
                  data.fecha_expedicion
                    ? new Date(data.fecha_expedicion).toLocaleDateString()
                    : null
                }
                md={6}
              />
              <Campo
                label="Fecha de Vencimiento"
                value={
                  data.fecha_vencimiento
                    ? new Date(data.fecha_vencimiento).toLocaleDateString()
                    : null
                }
                md={6}
                bold
              />

              <Campo label="Papel de Seguridad" value={data.papel_seguridad} md={6} />
              <Campo label="Número LOT" value={data.numero_lot} md={6} bold />

              {getDetallesExtra(data.detalles_extra) && (
                <Campo
                  label="Observaciones / Detalles Extra"
                  value={getDetallesExtra(data.detalles_extra)}
                  md={12}
                />
              )}
            </CRow>

            {/* ── SECCIÓN 2: Asignaciones & Dirección ── */}
            <Seccion titulo="Asignaciones & Dirección" />
            <CRow className="gy-3 mb-2">
              <Campo
                label="Persona Titular"
                value={`${data.ci_rif || ""} — ${data.persona || ""}`}
                md={12}
                bold
              />
              <Campo
                label="Comercializador Asociado"
                value={data.comercializador}
                md={12}
              />
              <Campo
                label="Centro de Apuesta"
                value={data.centro_apuesta}
                md={6}
              />
              <Campo label="Tipo de Persona" value={data.tipo_persona} md={6} />
              <Campo
                label="Dirección del Establecimiento"
                value={data.direccion_establecimiento}
                md={12}
              />
              {data.observaciones_documento && (
                <Campo
                  label="Observaciones del Documento"
                  value={data.observaciones_documento}
                  md={12}
                />
              )}
            </CRow>

            {/* ── SECCIÓN 3: Representantes Legales ── */}
            {data.representantes && data.representantes.length > 0 && (
              <>
                <Seccion titulo="Representantes Legales" />
                {data.representantes.map((rep, i) => (
                  <div key={rep.id_persona || i}>
                    <CBadge
                      color="primary"
                      shape="rounded-pill"
                      className="rep-badge"
                    >
                      Representante {i + 1}
                    </CBadge>
                    <CRow className="gy-3 mb-2 align-items-end">
                      <Campo
                        label="Cédula / RIF"
                        value={rep.ci_rif}
                        md={6}
                        bold
                      />
                      <Campo
                        label="Nombre / Razón Social"
                        value={rep.razon_social}
                        md={6}
                      />
                      <Campo label="Cargo" value={rep.cargo} md={6} />
                      <Campo label="Rol" value={rep.rol} md={6} />
                    </CRow>
                    {i < data.representantes.length - 1 && (
                      <hr className="section-divider" style={{ margin: "0.75rem 0 1rem" }} />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* ── SECCIÓN 4: Datos del Pago ── */}
            <Seccion titulo="Datos del Pago" />
            {data.pago_numero_referencia ? (
              <CRow className="gy-3 mb-2">
                <Campo label="Banco" value={data.pago_banco} md={6} />
                <Campo
                  label="Número de Referencia"
                  value={data.pago_numero_referencia}
                  md={6}
                  bold
                />
                <Campo
                  label="Monto"
                  value={
                    data.pago_monto
                      ? new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                        }).format(data.pago_monto)
                      : null
                  }
                  md={4}
                  bold
                />
                <Campo
                  label="Tasa del Día"
                  value={
                    data.pago_tasa_dia
                      ? data.pago_tasa_dia.toLocaleString("es-VE")
                      : null
                  }
                  md={4}
                />
                <Campo
                  label="Fecha de Pago"
                  value={
                    data.pago_fecha_pago
                      ? new Date(data.pago_fecha_pago).toLocaleDateString()
                      : null
                  }
                  md={4}
                />
                <Campo label="Responsable" value={data.pago_responsable} md={6} />
                <Campo
                  label="Observaciones del Pago"
                  value={data.pago_observaciones}
                  md={6}
                />
              </CRow>
            ) : (
              <CAlert color="info" className="small">
                Esta licencia no tiene pago registrado.
              </CAlert>
            )}

            {/* ── SECCIÓN 5: Juegos Autorizados ── */}
            <Seccion titulo="Juegos Autorizados" />
            {loadingJuegos ? (
              <div className="d-flex justify-content-center py-3">
                <CSpinner color="primary" size="sm" />
              </div>
            ) : juegos.length === 0 ? (
              <CAlert color="info" className="small">
                Esta licencia no tiene juegos autorizados.
              </CAlert>
            ) : (
              <div className="d-flex flex-wrap gap-2 pb-2">
                {juegos.map((j) => (
                  <CBadge
                    key={j.id_juego}
                    color="primary"
                    shape="rounded-pill"
                    className="game-badge"
                  >
                    {j.nombre_juego || "—"}
                  </CBadge>
                ))}
              </div>
            )}

          </div>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default LicenciaDetalleModal;
