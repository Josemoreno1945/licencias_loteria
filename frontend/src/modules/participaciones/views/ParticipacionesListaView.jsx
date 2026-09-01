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
import CIcon from "@coreui/icons-react";
import { cilPlus, cilMagnifyingGlass, cilPencil } from "@coreui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import useDebounce from "../../../hooks/useDebounce";
import { filterBySearch } from "../../../utils/helpers";
import { useAuth } from "../../auth/store/AuthContext";
import ParticipacionesDetalleModal from "../components/ParticipacionesDetalleModal";
import ParticipacionesEditarModal from "../components/ParticipacionesEditarModal";
import Buscador from "../../../components/Buscador";
import Paginacion from "../../../components/Paginacion";

const PARTICIPACIONES_SEARCH_FIELDS = [
  "numero_documento",
  "nro_archivo",
  "numero_lot",
  "ci_rif",
  "persona",
  "comercializador",
  "tipo",
];

const getTipoBadge = (tipo) => {
  switch (tipo) {
    case "Archivo":       return "primary";
    case "Certificacion": return "info";
    case "Rectificacion": return "warning";
    case "Nulidad":       return "danger";
    default:              return "secondary";
  }
};

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "vigente":    return "success";
    case "vencido":    return "warning";
    case "suspendido": return "danger";
    case "anulado":    return "secondary";
    default:           return "info";
  }
};

const ParticipacionesListaView = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { data: participaciones, loading, error, refetch } = useFetch("/participaciones");

  const [paginaActual,    setPaginaActual]    = useState(1);
  const [busqueda,        setBusqueda]        = useState("");
  const [modalDetalleId,  setModalDetalleId]  = useState(null);
  const [modalEditarId,   setModalEditarId]   = useState(null);
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const participacionesFiltradas = useMemo(
    () =>
      filterBySearch(
        participaciones,
        debouncedBusqueda,
        PARTICIPACIONES_SEARCH_FIELDS,
      ),
    [participaciones, debouncedBusqueda],
  );

  const PAGE_SIZE = 10;
  const totalPaginas = participacionesFiltradas
    ? Math.ceil(participacionesFiltradas.length / PAGE_SIZE)
    : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const participacionesPaginadas =
    participacionesFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  useEffect(() => {
    if (location.state?.openModalId) {
      setModalDetalleId(location.state.openModalId);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  return (
    <CContainer fluid>
      <ParticipacionesDetalleModal
        idParticipacion={modalDetalleId}
        onClose={() => setModalDetalleId(null)}
      />
      <ParticipacionesEditarModal
        idParticipacion={modalEditarId}
        onClose={() => setModalEditarId(null)}
        onUpdated={refetch}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Participaciones</h4>
            <p className="text-muted small mb-3">
              Documentos de participación emitidos a comercializadores autorizados.
            </p>
          </div>
          {user?.rol !== "supervisor" && (
            <CButton
              color="primary"
              onClick={() => navigate("/participaciones/registro")}
            >
              <CIcon icon={cilPlus} className="me-2" /> Emitir Participación
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda("")}
              placeholder="Buscar participación..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando participaciones...</span>
            </div>
          )}

          {error && !loading && (
            <CAlert color="danger" className="d-flex align-items-center gap-2">
              <span>{error}</span>
              <CButton color="danger" variant="outline" size="sm" onClick={refetch}>
                Reintentar
              </CButton>
            </CAlert>
          )}

          {!loading && !error && (
            <>
              {participacionesFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {participaciones?.length === 0
                    ? "No hay participaciones registradas aún."
                    : "No se encontraron participaciones."}
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
                      <CTableHeaderCell>Nro. Documento</CTableHeaderCell>
                      <CTableHeaderCell>N° Archivo</CTableHeaderCell>
                      <CTableHeaderCell>N° LOT</CTableHeaderCell>
                      <CTableHeaderCell>Persona</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Tipo</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                      <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Ver</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Editar</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {participacionesPaginadas.map((par, index) => (
                      <CTableRow key={par.id_documento}>
                        <CTableDataCell className="row-number">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {par.numero_documento}
                        </CTableDataCell>
                        <CTableDataCell>
                          {par.nro_archivo || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {par.numero_lot || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-semibold">{par.ci_rif}</div>
                          <div className="text-muted small">{par.persona}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {par.comercializador || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={getTipoBadge(par.tipo)}
                            shape="rounded-pill"
                            className="status-badge"
                          >
                            {par.tipo ?? "—"}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={getEstadoBadge(par.estado_documento)}
                            shape="rounded-pill"
                            className="status-badge"
                          >
                            {par.estado_documento}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {par.fecha_vencimiento?.slice(0, 10)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            className="action-btn"
                            onClick={() => setModalDetalleId(par.id_documento)}
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
                              className="action-btn"
                              onClick={() => setModalEditarId(par.id_documento)}
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

export default ParticipacionesListaView;
