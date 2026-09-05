import { useState, useEffect, useMemo } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CAlert,
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilUser,
  cilPeople,
  cilClipboard,
  cilMoney,
  cilShieldAlt,
  cilBriefcase,
  cilReload,
  cilHistory,
  cilStar,
} from "@coreui/icons";

import useFetch from "../../../hooks/useFetch";
import useDebounce from "../../../hooks/useDebounce";
import { filterBySearch } from "../../../utils/helpers";
import StatCard from "../../dashboard/components/StatCard";
import "../../dashboard/views/DashboardView.css";

const fmtInt = (value) => Number(value ?? 0).toLocaleString("es-VE");
const fmtBs = (value) =>
  `Bs. ${Number(value ?? 0).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MODULO_COLORS = {
  Solicitudes: "warning",
  Pagos: "success",
  Personas: "info",
  Usuarios: "primary",
};
const MODULO_ICON_COLOR = {
  Solicitudes: "#f59f00",
  Pagos: "#198754",
  Personas: "#0dcaf0",
  Usuarios: "#6384ff",
};

const ACCION_COLOR = {
  Registro: "success",
  Actualización: "info",
};

const ROLE_LABELS = {
  superAdmin: "Super Administrador",
  gerente: "Gerente",
  gestor_de_tramites: "Gestor de Tramites",
  supervisor: "Supervisor",
};

const rolBadgeColor = (rol) => {
  if (rol === "superAdmin") return "danger";
  if (rol === "gerente") return "warning";
  if (rol === "supervisor") return "info";
  return "secondary";
};

const DashboardAuditoria = () => {
  const {
    data: resumen,
    loading: loadingResumen,
    refetch: refetchResumen,
  } = useFetch("/auditoria/resumen");

  const {
    data: topUsuarios,
    loading: loadingTop,
    refetch: refetchTop,
  } = useFetch("/auditoria/top-usuarios");

  const {
    data: actividades,
    loading: loadingAct,
    error: errorAct,
    refetch: refetchAct,
  } = useFetch("/auditoria/actividades", { params: { limit: 100 } });

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroModulo, setFiltroModulo] = useState("Todos");
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const actividadesFiltradas = useMemo(() => {
    let lista = Array.isArray(actividades) ? actividades : [];
    if (filtroModulo !== "Todos") {
      lista = lista.filter((a) => a.modulo === filtroModulo);
    }
    return filterBySearch(lista, debouncedBusqueda, [
      "usuario",
      "descripcion",
      "referencia",
      "accion",
      "modulo",
    ]);
  }, [actividades, debouncedBusqueda, filtroModulo]);

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda, filtroModulo]);

  const PAGE_SIZE = 10;
  const totalPaginas = actividadesFiltradas
    ? Math.ceil(actividadesFiltradas.length / PAGE_SIZE)
    : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const actividadesPaginadas =
    actividadesFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  const refrescarTodo = () => {
    refetchResumen();
    refetchTop();
    refetchAct();
  };

  const modulosDisponibles = useMemo(() => {
    const set = new Set((actividades || []).map((a) => a.modulo));
    return ["Todos", ...Array.from(set)];
  }, [actividades]);

  const r = resumen || {};

  return (
    <CContainer fluid className="px-3 px-md-4 pb-4">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div className="min-w-0">
          <h4 className="mb-1 fw-bold text-dark text-truncate">
            Módulo de Auditoría
          </h4>
          <p className="text-body-secondary mb-0 small text-truncate">
            Métricas globales y registro de actividades del sistema — Lotería
            del Táchira
          </p>
        </div>
        <CButton
          color="primary"
          variant="outline"
          size="sm"
          onClick={refrescarTodo}
          className="d-flex align-items-center gap-1"
        >
          <CIcon icon={cilReload} /> Refrescar
        </CButton>
      </div>

      {/* ====== Indicadores Globales ====== */}
      <p className="section-label">Indicadores Globales</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Usuarios Activos"
            value={loadingResumen ? null : fmtInt(r.usuarios_activos)}
            icon={cilUser}
            color="success"
            subtitle={
              loadingResumen
                ? null
                : `${fmtInt(r.total_usuarios)} usuarios en total`
            }
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Personas Registradas"
            value={loadingResumen ? null : fmtInt(r.total_personas)}
            icon={cilPeople}
            color="info"
            subtitle={
              loadingResumen
                ? null
                : `${fmtInt(r.personas_mes ?? 0)} registradas este mes`
            }
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Solicitudes"
            value={loadingResumen ? null : fmtInt(r.total_solicitudes)}
            icon={cilClipboard}
            color="warning"
            subtitle={
              loadingResumen
                ? null
                : `${fmtInt(r.solicitudes_hoy ?? 0)} hoy · ${fmtInt(
                    r.solicitudes_mes ?? 0
                  )} este mes`
            }
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Recaudación del Mes"
            value={loadingResumen ? null : fmtBs(r.recaudacion_mes)}
            icon={cilMoney}
            color="primary"
            isMoney
            subtitle={
              loadingResumen
                ? null
                : `${fmtInt(r.pagos_mes ?? 0)} pagos este mes`
            }
          />
        </CCol>
      </CRow>

      {/* ====== Totales por Módulo ====== */}
      <p className="section-label">Totales por Módulo</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilClipboard}
            iconColor="#f59f00"
            name="Solicitudes"
            value={r.total_solicitudes}
            loading={loadingResumen}
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilShieldAlt}
            iconColor="#6384ff"
            name="Licencias"
            value={r.total_licencias}
            loading={loadingResumen}
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilBriefcase}
            iconColor="#198754"
            name="Participaciones"
            value={r.total_participaciones}
            loading={loadingResumen}
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilMoney}
            iconColor="#dc3545"
            name="Pagos"
            value={r.total_pagos}
            loading={loadingResumen}
          />
        </CCol>
      </CRow>

      {/* ====== Top Usuarios + Actividad ====== */}
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={4}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-0 py-3">
              <h6 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                <CIcon
                  icon={cilStar}
                  style={{ width: 18, height: 18, color: "#d4a017" }}
                />
                Top Usuarios con más actividad
              </h6>
            </CCardHeader>
            <CCardBody className="pt-0">
              {loadingTop ? (
                <div className="text-center py-4">
                  <CSpinner size="sm" />
                </div>
              ) : !topUsuarios || topUsuarios.length === 0 ? (
                <div className="text-center text-body-secondary small py-3">
                  Sin actividad registrada todavía.
                </div>
              ) : (
                topUsuarios.map((u, idx) => (
                  <div
                    key={u.id_usuario}
                    className={`d-flex justify-content-between align-items-center py-2 ${
                      idx === topUsuarios.length - 1
                        ? ""
                        : "border-bottom border-light-subtle"
                    }`}
                  >
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <span
                        className="badge rounded-pill text-bg-light fw-semibold"
                        style={{ width: 26 }}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div
                          className="fw-semibold text-dark text-truncate"
                          title={u.nombre_usuario}
                        >
                          {u.nombre_usuario}
                        </div>
                        <CBadge
                          color={rolBadgeColor(u.rol)}
                          shape="rounded-pill"
                          className="status-badge mt-1"
                        >
                          {ROLE_LABELS[u.rol] || u.rol}
                        </CBadge>
                      </div>
                    </div>
                    <span className="fw-bold text-dark flex-shrink-0 ms-2">
                      {fmtInt(u.total_acciones)}
                    </span>
                  </div>
                ))
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={8}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-white border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <h6 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                <CIcon
                  icon={cilHistory}
                  style={{ width: 18, height: 18, color: "#0a2463" }}
                />
                Registro de Actividades
                {actividades && actividades.length > 0 && (
                  <CBadge color="primary" className="ms-2">
                    {fmtInt(actividades.length)}
                  </CBadge>
                )}
              </h6>
              <div className="d-flex gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 180 }}
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  aria-label="Filtrar por módulo"
                >
                  {modulosDisponibles.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 220 }}
                  placeholder="Buscar actividad..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </CCardHeader>
            <CCardBody className="p-0">
              {loadingAct && (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <CSpinner color="primary" />
                  <span className="ms-3 text-muted">
                    Cargando registro de actividades...
                  </span>
                </div>
              )}

              {errorAct && !loadingAct && (
                <div className="p-3">
                  <CAlert color="danger" className="d-flex align-items-center gap-2 mb-0">
                    <span>{errorAct}</span>
                    <CButton
                      color="danger"
                      variant="outline"
                      size="sm"
                      onClick={refetchAct}
                    >
                      Reintentar
                    </CButton>
                  </CAlert>
                </div>
              )}

              {!loadingAct && !errorAct && (
                <>
                  {actividadesFiltradas.length === 0 ? (
                    <CAlert color="info" className="m-3">
                      No hay actividades que coincidan con el filtro actual.
                    </CAlert>
                  ) : (
                    <CTable
                      hover
                      responsive
                      striped
                      align="middle"
                      className="mb-0 module-table"
                    >
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>#</CTableHeaderCell>
                          <CTableHeaderCell>Módulo</CTableHeaderCell>
                          <CTableHeaderCell>Acción</CTableHeaderCell>
                          <CTableHeaderCell>Descripción</CTableHeaderCell>
                          <CTableHeaderCell>Usuario</CTableHeaderCell>
                          <CTableHeaderCell>Referencia</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">
                            Fecha y Hora
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {actividadesPaginadas.map((act, index) => (
                          <CTableRow key={`${act.modulo}-${act.id}-${index}`}>
                            <CTableDataCell className="row-number">
                              {startIndex + index + 1}
                            </CTableDataCell>
                            <CTableDataCell>
                              <span
                                className="d-inline-flex align-items-center gap-2 fw-semibold"
                                style={{
                                  color: MODULO_ICON_COLOR[act.modulo] ?? "#495057",
                                }}
                              >
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 8,
                                    backgroundColor:
                                      MODULO_ICON_COLOR[act.modulo] ?? "#495057",
                                    display: "inline-block",
                                  }}
                                />
                                {act.modulo}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge
                                color={ACCION_COLOR[act.accion] ?? "secondary"}
                                shape="rounded-pill"
                                className="status-badge"
                              >
                                {act.accion}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell
                              className="text-body"
                              style={{ maxWidth: 360 }}
                            >
                              <span className="d-block text-truncate" title={act.descripcion}>
                                {act.descripcion}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 180 }}>
                                {act.usuario ?? "Sistema"}
                              </div>
                              {act.rol && (
                                <CBadge
                                  color={rolBadgeColor(act.rol)}
                                  shape="rounded-pill"
                                  className="status-badge mt-1"
                                >
                                  {ROLE_LABELS[act.rol] || act.rol}
                                </CBadge>
                              )}
                            </CTableDataCell>
                            <CTableDataCell
                              className="text-body-secondary small"
                              style={{ maxWidth: 180 }}
                            >
                              <span className="d-block text-truncate" title={act.referencia}>
                                {act.referencia ?? "—"}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="text-center text-body-secondary small">
                              {fmtFecha(act.fecha)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>

          {totalPaginas > 1 && !loadingAct && !errorAct && (
            <div className="mt-3">
              <Pagination
                currentPage={paginaActual}
                totalPages={totalPaginas}
                onPageChange={setPaginaActual}
              />
            </div>
          )}
        </CCol>
      </CRow>
    </CContainer>
  );
};

/* ----------------------------------------------------------------
   Componentes auxiliares locales (mismo patrón que DashboardView)
   ---------------------------------------------------------------- */

const ProductSummary = ({ icon, iconColor, name, value, loading }) => (
  <CCard className="shadow-sm border-0 h-100 product-summary">
    <CCardBody className="p-3 d-flex align-items-center gap-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        style={{ width: 44, height: 44, backgroundColor: iconColor + "1A" }}
      >
        <CIcon icon={icon} style={{ width: 22, height: 22, color: iconColor }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="text-body-secondary small mb-1 text-truncate" title={name}>
          {name}
        </div>
        <div className="fs-2 fw-bold text-dark lh-1 product-summary__value">
          {loading ? <CSpinner size="sm" /> : fmtInt(value)}
        </div>
      </div>
    </CCardBody>
  </CCard>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  const goTo = (p) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="d-flex justify-content-center">
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goTo(currentPage - 1)}>
              ‹ Anterior
            </button>
          </li>
          {pages.map((p) => (
            <li
              key={p}
              className={`page-item ${p === currentPage ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goTo(p)}>
                {p}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}
          >
            <button className="page-link" onClick={() => goTo(currentPage + 1)}>
              Siguiente ›
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardAuditoria;
