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
import axiosInstance from "../../../api/axiosInstance";

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "Aprobado":
      return "success";
    case "Rechazada":
      return "danger";
    case "Pendiente":
      return "warning";
    default:
      return "secondary";
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const Campo = ({ label, value, md = 6, bold = false }) => (
  <CCol md={md}>
    <CFormLabel className="text-muted small fw-semibold mb-1">
      {label}
    </CFormLabel>
    <CFormInput
      type="text"
      value={value || "—"}
      readOnly
      className={`bg-light${bold ? " fw-bold" : ""}`}
    />
  </CCol>
);

const Seccion = ({ titulo }) => (
  <>
    <hr className="text-muted opacity-25 my-4" />
    <h5 className="text-primary fw-semibold mb-3">{titulo}</h5>
  </>
);

// ── Componente principal ──────────────────────────────────────────────────────
const SolicitudDetalleModal = ({ idSolicitud, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idSolicitud) return;
    setData(null);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/solicitudes/${idSolicitud}`);
        setData(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al cargar el detalle de la solicitud",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idSolicitud]);

  if (!idSolicitud) return null;

  // Juegos: pueden venir como string JSON o como array según el driver
  const juegos = (() => {
    if (!data?.juegos) return [];
    if (Array.isArray(data.juegos)) return data.juegos;
    try {
      return JSON.parse(data.juegos);
    } catch {
      return [];
    }
  })();

  // Representantes activos de la comercializadora (viene como JSON/array)
  const representantes = (() => {
    if (!data?.representantes) return [];
    if (Array.isArray(data.representantes)) return data.representantes;
    try {
      return JSON.parse(data.representantes);
    } catch {
      return [];
    }
  })();

  // Centros de apuesta vinculados (viene como JSON/array)
  const centros = (() => {
    if (!data?.centros) return [];
    if (Array.isArray(data.centros)) return data.centros;
    try {
      return JSON.parse(data.centros);
    } catch {
      return [];
    }
  })();

  // Si la comercializadora no tiene representantes en la tabla puente,
  // usamos como único representante al firmante titular grabado en la solicitud.
  const representantesAMostrar =
    representantes.length > 0
      ? representantes
      : data?.id_persona
        ? [
            {
              id_persona: data.id_persona,
              ci_rif: data.ci_rif,
              razon_social: data.persona,
              tipo_persona: data.tipo_persona,
              cargo: null,
            },
          ]
        : [];

  const esLicencia = data?.tipo_tramite === "Licencia";
  const esParticipacion = data?.tipo_tramite === "Participacion";
  const esAutorizacion = data?.tipo_tramite === "Autorizacion_especial";

  // Etiquetas legibles para el tipo de trámite
  const tipoLabel =
    {
      Licencia: "Licencia",
      Participacion: "Participación",
      Autorizacion_especial: "Autorización Especial",
    }[data?.tipo_tramite] ??
    data?.tipo_tramite ??
    "—";

  return (
    <CModal
      visible={!!idSolicitud}
      onClose={onClose}
      alignment="center"
      size="lg"
      backdrop="static"
    >
      <CModalHeader>
        <CModalTitle>Detalle de la Solicitud</CModalTitle>
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
            {/* ── SECCIÓN 1: Información del Trámite ── */}
            <h5 className="text-primary fw-semibold mb-3">
              Información del Trámite
            </h5>
            <CRow className="gy-3 mb-2">
              <Campo
                label="Tipo de Documento Solicitado"
                value={tipoLabel}
                bold
                md={6}
              />
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">
                  Estado
                </CFormLabel>
                <div className="pt-1">
                  <CBadge
                    color={getEstadoBadge(data.estado)}
                    className="fs-6 px-3 py-2"
                  >
                    {data.estado}
                  </CBadge>
                </div>
              </CCol>

              {/* Subtipo según el tipo de trámite */}
              {esLicencia && (
                <>
                  <Campo
                    label="Categoría de Licencia"
                    value={data.categoria_licencia}
                    md={6}
                  />
                  <Campo
                    label="Tipo de Emisión"
                    value={data.tipo_emision}
                    md={6}
                  />
                </>
              )}

              {esParticipacion && (
                <>
                  <Campo
                    label="Tipo de Participación"
                    value={data.tipo_participacion}
                    md={6}
                    bold
                  />
                  <Campo
                    label="N° de Autorización CONALOT"
                    value={data.numero_autorizacion_conalot}
                    md={6}
                    bold
                  />
                  <Campo
                    label="Fecha de Emisión CONALOT"
                    value={
                      data.fecha_emision_conalot
                        ? new Date(
                            data.fecha_emision_conalot,
                          ).toLocaleDateString()
                        : null
                    }
                    md={6}
                  />
                  <Campo
                    label="Fecha de Vencimiento CONALOT"
                    value={
                      data.fecha_vencimiento_conalot
                        ? new Date(
                            data.fecha_vencimiento_conalot,
                          ).toLocaleDateString()
                        : null
                    }
                    md={6}
                  />
                  <Campo
                    label="N° Licencia Lotería del Táchira"
                    value={data.numero_licencia_loteriatachira}
                    md={6}
                    bold
                  />
                </>
              )}

              {esAutorizacion && (
                <>
                  <Campo
                    label="Tipo de Autorización Especial"
                    value={data.tipo_autorizacion_especial}
                    md={6}
                  />
                  <Campo
                    label="Dirección de la Mesa / Localidad"
                    value={data.direccion_autorizacion_especial}
                    md={12}
                  />
                </>
              )}

              <Campo
                label="Fecha de Registro"
                value={
                  data.created_at
                    ? new Date(data.created_at).toLocaleString()
                    : null
                }
                md={6}
              />
            </CRow>

            {/* ── Descripción y Observaciones ── */}
            {(data.descripcion_tramite || data.observaciones) && (
              <>
                <Seccion titulo="Notas Internas" />
                <CRow className="gy-3 mb-2">
                  {data.descripcion_tramite && (
                    <Campo
                      label="Descripción del Trámite"
                      value={data.descripcion_tramite}
                      md={12}
                    />
                  )}
                  {data.observaciones && (
                    <Campo
                      label="Observaciones"
                      value={data.observaciones}
                      md={12}
                    />
                  )}
                </CRow>
              </>
            )}

            {/* ── Motivo de rechazo ── */}
            {data.estado === "Rechazada" && data.justificacion_no_logrado && (
              <CAlert color="danger" className="mt-3 mb-0 py-2">
                <strong>Motivo del rechazo:</strong>{" "}
                {data.justificacion_no_logrado}
              </CAlert>
            )}

            {/* ── SECCIÓN 2: Datos de la Comercializadora ── */}
            {data.id_comercializador && (
              <>
                <Seccion titulo="Datos de la Comercializadora" />
                <CRow className="gy-3 mb-2">
                  <Campo
                    label="Razón Social"
                    value={data.comercializador}
                    md={12}
                    bold
                  />
                  <Campo label="RIF" value={data.comercializador_rif} md={6} />
                  <Campo
                    label="Dirección Fiscal"
                    value={data.comercializador_direccion}
                    md={6}
                  />
                  <Campo
                    label="Teléfono"
                    value={data.comercializador_telefono}
                    md={6}
                  />
                  <Campo
                    label="Email"
                    value={data.comercializador_email}
                    md={6}
                  />
                </CRow>
              </>
            )}

            {/* ── SECCIÓN 3: Representantes Legales ── */}
            {representantesAMostrar.length > 0 && (
              <>
                <Seccion titulo="Representantes Legales de la Comercializadora" />
                {representantesAMostrar.map((r, i) => (
                  <React.Fragment key={r.id_persona || i}>
                    <CRow className="gy-3 mb-2 align-items-end">
                      <CCol md={12} className="mb-2">
                        <CBadge
                          color="primary"
                          shape="rounded-pill"
                          className="px-2 py-1 fs-7"
                        >
                          Representante {i + 1}
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
                      <Campo
                        label="Tipo de Persona"
                        value={r.tipo_persona}
                        md={6}
                      />
                      <Campo
                        label="Cargo"
                        value={r.cargo || "Titular"}
                        md={6}
                      />
                    </CRow>
                    {i < representantesAMostrar.length - 1 && (
                      <hr className="text-muted opacity-25 my-3" />
                    )}
                  </React.Fragment>
                ))}
              </>
            )}

            {/* ── SECCIÓN 4: Centro de Apuesta ── */}
            {centros.length > 0 && (
              <>
                <Seccion titulo="Centro(s) de Apuesta Vinculado(s)" />
                {centros.map((centro, i) => (
                  <React.Fragment key={centro.id_centro || i}>
                    <CRow className="gy-3 mb-2">
                      <Campo
                        label="Denominación / Agencia"
                        value={centro.nombre_agencia}
                        md={6}
                        bold
                      />
                      <Campo
                        label="Dirección del Establecimiento"
                        value={centro.direccion}
                        md={6}
                      />
                    </CRow>
                    {i < centros.length - 1 && (
                      <hr className="text-muted opacity-25 my-3" />
                    )}
                  </React.Fragment>
                ))}
              </>
            )}

            {/* ── SECCIÓN 5: Juegos Seleccionados ── */}
            {juegos.length > 0 && (
              <>
                <Seccion titulo="Juegos Autorizados en la Solicitud" />
                <div className="d-flex flex-wrap gap-2 pb-2">
                  {juegos.map((j) => (
                    <CBadge
                      key={j.id_juego}
                      color="primary"
                      shape="rounded-pill"
                      className="px-3 py-2 fs-6"
                    >
                      {j.nombre}
                    </CBadge>
                  ))}
                </div>
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

export default SolicitudDetalleModal;
