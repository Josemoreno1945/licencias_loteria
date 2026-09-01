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
  if (val == null) return "No registrado";
  try {
    const obj = typeof val === "string" ? JSON.parse(val) : val;
    if (obj && typeof obj === "object" && obj.observaciones != null) {
      return obj.observaciones || "No registrado";
    }
    return JSON.stringify(obj);
  } catch {
    return String(val);
  }
};

const ParticipacionesDetalleModal = ({ idParticipacion, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pago, setPago] = useState(null);
  const [loadingPago, setLoadingPago] = useState(false);

  useEffect(() => {
    if (!idParticipacion) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/participaciones/${idParticipacion}`,
        );
        setData(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle de la participación",
        );
      } finally {
        setLoading(false);
      }

      setLoadingPago(true);
      try {
        const resP = await axiosInstance.get(
          `/pagos/por-participacion/${idParticipacion}`,
        );
        const arr = Array.isArray(resP.data) ? resP.data : [resP.data];
        setPago(arr.length ? arr[0] : null);
      } catch {
        setPago(null);
      } finally {
        setLoadingPago(false);
      }
    };
    fetchData();
  }, [idParticipacion]);

  if (!idParticipacion) return null;

  return (
    <CModal
      visible={!!idParticipacion}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle de la Participación</CModalTitle>
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

              <Campo label="Nº de Archivo" value={data.nro_archivo} md={6} />
              <Campo label="Tipo de Emisión" value={data.tipo_emision} md={6} />

              <Campo
                label="Tipo de Participación"
                value={data.tipo}
                md={6}
                bold
              />
              <Campo label="Número LOT" value={data.numero_lot} md={6} bold />

              <Campo
                label="Fecha de Solicitud"
                value={
                  data.fecha_solicitud
                    ? new Date(data.fecha_solicitud).toLocaleDateString()
                    : null
                }
                md={6}
              />
              <Campo label="Territorio" value={data.territorio} md={6} />

              <Campo
                label="Expedición"
                value={
                  data.fecha_expedicion
                    ? new Date(data.fecha_expedicion).toLocaleDateString()
                    : null
                }
                md={6}
              />
              <Campo
                label="Vencimiento"
                value={
                  data.fecha_vencimiento
                    ? new Date(data.fecha_vencimiento).toLocaleDateString()
                    : null
                }
                md={6}
                bold
              />

              <Campo
                label="Papel de Seguridad"
                value={data.papel_seguridad}
                md={6}
              />

              <Campo
                label="Observaciones / Detalles Extra"
                value={getDetallesExtra(data.detalles_extra)}
                md={12}
              />
              <Campo
                label="Observaciones de la Participación"
                value={data.observaciones || "Sin observaciones"}
                md={12}
              />
            </CRow>

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
                value={data.comercializador || "Ninguno"}
                md={12}
              />

              <Campo
                label="Licencia Previa"
                value={data.licencia_numero || "Ninguna"}
                md={6}
              />

              <Campo label="Tipo de Persona" value={data.tipo_persona} md={12} />

              <CCol md={12}>
                <label className="detail-field-label">
                  Representante Legal
                </label>
                {Array.isArray(data.representantes) &&
                data.representantes.length > 0 ? (
                  <div className="border rounded bg-light px-3 py-2 mt-1">
                    {data.representantes.map((r, i) => (
                      <div
                        key={r.id_persona || i}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom last-child-no-border"
                      >
                        <div>
                          <span className="fw-semibold small">
                            {r.razon_social || "—"}
                          </span>
                          <span className="text-muted small ms-2">
                            {r.ci_rif}
                          </span>
                        </div>
                        <CBadge color="info" shape="rounded-pill" className="status-badge px-2">
                          {r.cargo || "Sin cargo"}
                        </CBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value="Ninguno"
                    readOnly
                    className="form-control detail-field-value mt-1"
                  />
                )}
              </CCol>

              <Campo
                label="Dirección del Establecimiento"
                value={data.direccion_establecimiento || "No registrada"}
                md={12}
              />
            </CRow>

            <Seccion titulo="Datos del Pago" />
            {loadingPago ? (
              <div className="d-flex justify-content-center py-3">
                <CSpinner color="primary" size="sm" />
              </div>
            ) : pago ? (
              <CRow className="gy-3 mb-2">
                <Campo label="Banco" value={pago.banco} md={6} />
                <Campo
                  label="Número de Referencia"
                  value={pago.num_referencia}
                  md={6}
                  bold
                />
                <Campo
                  label="Monto"
                  value={
                    pago.monto
                      ? new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: "VES",
                        }).format(pago.monto)
                      : null
                  }
                  md={4}
                  bold
                />
                <Campo
                  label="Tasa del Día"
                  value={
                    pago.tasa_dia ? pago.tasa_dia.toLocaleString("es-VE") : null
                  }
                  md={4}
                />
                <Campo
                  label="Fecha de Pago"
                  value={
                    pago.fecha_pago
                      ? new Date(pago.fecha_pago).toLocaleDateString()
                      : null
                  }
                  md={4}
                />
                <Campo
                  label="Responsable"
                  value={pago.responsable_texto}
                  md={6}
                />
                <Campo label="Observaciones" value={pago.observaciones} md={6} />
              </CRow>
            ) : (
              <CAlert color="info" className="small">
                Esta participación no tiene pago registrado.
              </CAlert>
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

export default ParticipacionesDetalleModal;
