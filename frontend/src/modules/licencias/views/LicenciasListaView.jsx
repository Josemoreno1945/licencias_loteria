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
import LicenciaDetalleModal from "../components/LicenciaDetalleModal";
import LicenciasEditarModal from "../components/LicenciasEditarModal";
import Buscador from "../../../components/Buscador";
import Paginacion from "../../../components/Paginacion";

const LICENCIAS_SEARCH_FIELDS = [
  "numero_documento",
  "persona",
  "ci_rif",
  "categoria",
  "estado_documento",
  "comercializador",
  "numero_lot",
];

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "vigente":    return "success";
    case "vencido":    return "warning";
    case "suspendido": return "danger";
    case "anulado":    return "secondary";
    default:           return "info";
  }
};

const getCategoriaBadge = (categoria) => {
  switch (categoria) {
    case "Operador":                            return "primary";
    case "Comercializador":                     return "info";
    case "Centro_de_apuesta":                   return "warning";
    case "Responsable_de_programa_informatico": return "secondary";
    default:                                    return "dark";
  }
};

const LicenciasListaView = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { data: licencias, loading, error, refetch } = useFetch("/licencias");

  const [modalDataId,   setModalDataId]   = useState(null);
  const [modalEditarId, setModalEditarId] = useState(null);
  const [paginaActual,  setPaginaActual]  = useState(1);
  const [busqueda,      setBusqueda]      = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const licenciasFiltradas = useMemo(
    () => filterBySearch(licencias, debouncedBusqueda, LICENCIAS_SEARCH_FIELDS),
    [licencias, debouncedBusqueda],
  );

  const PAGE_SIZE     = 10;
  const totalPaginas  = licenciasFiltradas
    ? Math.ceil(licenciasFiltradas.length / PAGE_SIZE)
    : 0;
  const startIndex    = (paginaActual - 1) * PAGE_SIZE;
  const licenciasPaginadas =
    licenciasFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  useEffect(() => {
    if (location.state?.openModalId) {
      setModalDataId(location.state.openModalId);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  return (
    <CContainer fluid>
      <LicenciaDetalleModal
        idLicencia={modalDataId}
        onClose={() => setModalDataId(null)}
      />
      <LicenciasEditarModal
        idLicencia={modalEditarId}
        onClose={() => setModalEditarId(null)}
        onUpdated={refetch}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Licencias</h4>
            <p className="text-muted small mb-3">
              Documentos emitidos a operadores, comercializadores y centros de apuesta.
            </p>
          </div>
          {user?.rol !== "supervisor" && (
            <CButton
              color="primary"
              onClick={() => navigate("/licencias/registro")}
            >
              <CIcon icon={cilPlus} className="me-2" /> Emitir Licencia
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda("")}
              placeholder="Buscar licencia..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando licencias...</span>
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
              {licenciasFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {licencias?.length === 0
                    ? "No hay licencias emitidas aún."
                    : "No se encontraron licencias."}
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
                    {licenciasPaginadas.map((licencia, index) => (
                      <CTableRow key={licencia.id_documento}>
                        <CTableDataCell className="row-number">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {licencia.numero_documento}
                        </CTableDataCell>
                        <CTableDataCell>
                          {licencia.numero_lot || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-semibold">{licencia.ci_rif}</div>
                          <div className="text-muted small">{licencia.persona}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {licencia.comercializador || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={getCategoriaBadge(licencia.categoria)}
                            shape="rounded-pill"
                            className="status-badge"
                          >
                            {licencia.categoria || "—"}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={getEstadoBadge(licencia.estado_documento)}
                            shape="rounded-pill"
                            className="status-badge"
                          >
                            {licencia.estado_documento}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {licencia.fecha_vencimiento?.slice(0, 10)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            className="action-btn"
                            onClick={() => setModalDataId(licencia.id_documento)}
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
                              onClick={() => setModalEditarId(licencia.id_documento)}
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

export default LicenciasListaView;
