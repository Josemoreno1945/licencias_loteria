import { useState, useEffect, useMemo } from "react";
import {
  CContainer,
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
import { useNavigate, useLocation } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilMagnifyingGlass, cilPlus, cilPencil } from "@coreui/icons";
import useFetch from "../../../hooks/useFetch";
import useDebounce from "../../../hooks/useDebounce";
import { filterBySearch } from "../../../utils/helpers";
import { useAuth } from "../../auth/store/AuthContext";
import SolicitudDetalleModal from "../components/SolicitudDetalleModal";
import SolicitudesEditarModal from "../components/SolicitudesEditarModal";
import Buscador from "../../../components/Buscador";
import Paginacion from "../../../components/Paginacion";

const SOLICITUDES_SEARCH_FIELDS = [
  "ci_rif",
  "persona",
  "comercializador",
  "tipo_tramite",
  "categoria_licencia",
  "estado",
  "solicitante_all",
];

// Nombres de todos los representantes asociados a la comercializadora.
// Si no hay representantes, retrocede al firmante registrado en la solicitud.
const getSolicitanteTexto = (sol) => {
  if (sol.representantes && sol.representantes.length > 0) {
    return sol.representantes
      .map((r) => `${r.ci_rif || ""} ${r.razon_social || ""}`.trim())
      .filter(Boolean)
      .join(" | ");
  }
  return sol.persona ? `${sol.ci_rif || ""} ${sol.persona}`.trim() : "";
};

const SolicitudesListaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: solicitudes,
    loading,
    error,
    refetch,
  } = useFetch("/solicitudes");

  // Derivado: cadena con TODOS los representantes (para búsqueda y render)
  const solicitudesEnriquecidas = useMemo(
    () =>
      (solicitudes || []).map((sol) => ({
        ...sol,
        solicitante_all: getSolicitanteTexto(sol),
      })),
    [solicitudes],
  );

  const location = useLocation();
  const [modalDataId, setModalDataId] = useState(null);
  const [modalEditarId, setModalEditarId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const solicitudesFiltradas = useMemo(
    () =>
      filterBySearch(
        solicitudesEnriquecidas,
        debouncedBusqueda,
        SOLICITUDES_SEARCH_FIELDS,
      ),
    [solicitudesEnriquecidas, debouncedBusqueda],
  );

  const PAGE_SIZE = 10;
  const totalPaginas = solicitudesFiltradas
    ? Math.ceil(solicitudesFiltradas.length / PAGE_SIZE)
    : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const solicitudesPaginadas =
    solicitudesFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  useEffect(() => {
    if (location.state?.openModalId) {
      setModalDataId(location.state.openModalId);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Aprobado":
        return "success";
      case "Rechazada":
        return "danger";
      case "Pendiente":
      default:
        return "warning";
    }
  };

  const TIPO_LABEL = {
    Licencia: "Licencia",
    Participacion: "Participación",
    Autorizacion_especial: "Autorización Esp.",
    Otro: "Otro",
  };

  return (
    <CContainer fluid>
      <SolicitudDetalleModal
        idSolicitud={modalDataId}
        onClose={() => setModalDataId(null)}
      />
      <SolicitudesEditarModal
        idSolicitud={modalEditarId}
        onClose={() => setModalEditarId(null)}
        onUpdated={refetch}
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Solicitudes</h4>
            <p className="text-muted small mb-3">
              Trámites iniciados por personas o comercializadores.
            </p>
          </div>
          {user?.rol !== "supervisor" && (
            <CButton
              color="primary"
              onClick={() => navigate("/solicitudes/registro")}
            >
              <CIcon icon={cilPlus} className="me-2" /> Nueva Solicitud
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda("")}
              placeholder="Buscar solicitud..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando solicitudes...</span>
            </div>
          )}

          {error && !loading && (
            <CAlert color="danger" className="d-flex align-items-center gap-2">
              <span>{error}</span>
              <CButton
                color="danger"
                variant="outline"
                size="sm"
                onClick={refetch}
              >
                Reintentar
              </CButton>
            </CAlert>
          )}

          {!loading && !error && (
            <>
              {solicitudesFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {solicitudes?.length === 0
                    ? "No hay solicitudes registradas aún."
                    : "No se encontraron solicitudes."}
                </CAlert>
              ) : (
                <CTable
                  hover
                  responsive
                  striped
                  align="middle"
                  className="mb-0"
                >
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Solicitante</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell>Tipo de Trámite</CTableHeaderCell>
                      <CTableHeaderCell>Categoría</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Estado
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Ver
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Editar
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {solicitudesPaginadas.map((sol, index) => (
                      <CTableRow key={sol.id_solicitudes}>
                        <CTableDataCell className="text-muted small">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {sol.representantes &&
                          sol.representantes.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {sol.representantes.map((r) => (
                                <div key={r.id_persona}>
                                  <span className="fw-semibold">
                                    {r.razon_social || "—"}
                                  </span>
                                  <span className="text-muted small ms-1">
                                    ({r.ci_rif || "—"})
                                  </span>
                                  {r.cargo ? (
                                    <span className="text-muted small ms-1">
                                      · {r.cargo}
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : sol.persona ? (
                            `${sol.ci_rif || "—"} — ${sol.persona}`
                          ) : (
                            sol.id_persona || "—"
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {sol.comercializador || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {TIPO_LABEL[sol.tipo_tramite] ?? sol.tipo_tramite}
                        </CTableDataCell>
                        <CTableDataCell>
                          {sol.tipo_tramite === "Licencia" &&
                          sol.categoria_licencia ? (
                            sol.categoria_licencia
                          ) : sol.tipo_tramite === "Participacion" &&
                            sol.tipo_participacion ? (
                            <span>{sol.tipo_participacion}</span>
                          ) : sol.tipo_tramite === "Autorizacion_especial" &&
                            sol.tipo_autorizacion_especial ? (
                            <span>{sol.tipo_autorizacion_especial}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(sol.created_at).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={getEstadoBadge(sol.estado)}
                            shape="rounded-pill"
                          >
                            {sol.estado}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            onClick={() => setModalDataId(sol.id_solicitudes)}
                          >
                            <CIcon icon={cilMagnifyingGlass} />
                          </CButton>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {user?.rol !== "supervisor" && (
                            <CButton
                              size="sm"
                              color="warning"
                              variant="outline"
                              onClick={() =>
                                setModalEditarId(sol.id_solicitudes)
                              }
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
              {totalPaginas > 1 && (
                <Paginacion
                  currentPage={paginaActual}
                  totalPages={totalPaginas}
                  onPageChange={setPaginaActual}
                />
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default SolicitudesListaView;
