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
import CentrosApuestaDetalleModal from "../components/CentrosApuestaDetalleModal";
import CentrosApuestaEditarModal from "../components/CentrosApuestaEditarModal";
import Buscador from "../../../components/Buscador";
import Paginacion from "../../../components/Paginacion";

const CENTROS_APOYO_SEARCH_FIELDS = [
  "nombre_agencia",
  "comercializador_razon_social",
  "persona_razon_social",
  "direccion",
];

const CentrosApuestaListaView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: centros, loading, error, refetch } =
    useFetch("/centros_apuesta");

  const [modalVerId, setModalVerId] = useState(null);
  const [modalEditarCentroId, setModalEditarCentroId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const centrosFiltrados = useMemo(
    () =>
      filterBySearch(centros, debouncedBusqueda, CENTROS_APOYO_SEARCH_FIELDS),
    [centros, debouncedBusqueda],
  );

  const PAGE_SIZE = 10;
  const totalPaginas = centrosFiltrados
    ? Math.ceil(centrosFiltrados.length / PAGE_SIZE)
    : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const centrosPaginados =
    centrosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  useEffect(() => {
    if (location.state?.openModalId) {
      setModalVerId(location.state.openModalId);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  return (
    <CContainer fluid>
      <CentrosApuestaDetalleModal
        idCentro={modalVerId}
        onClose={() => setModalVerId(null)}
      />
      <CentrosApuestaEditarModal
        idCentro={modalEditarCentroId}
        onClose={() => setModalEditarCentroId(null)}
        onUpdated={refetch}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Centros de Apuesta</h4>
            <p className="text-muted small mb-3">
              Agencias fisicas (puntos de venta) registradas en el sistema.
            </p>
          </div>
          {user?.rol !== "supervisor" && (
            <CButton
              color="primary"
              onClick={() => navigate("/centros-apuesta/registro")}
            >
              <CIcon icon={cilPlus} className="me-2" /> Nuevo Centro
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda("")}
              placeholder="Buscar centro de apuesta..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">
                Cargando centros de apuesta...
              </span>
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
              {centrosFiltrados?.length === 0 ? (
                <CAlert color="info">
                  {centros?.length === 0
                    ? "No hay centros de apuesta registrados aun."
                    : "No se encontraron centros de apuesta."}
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
                      <CTableHeaderCell>Nombre Agencia</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell>Representante Legal</CTableHeaderCell>
                      <CTableHeaderCell>Direccion</CTableHeaderCell>
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
                    {centrosPaginados.map((centro, index) => (
                      <CTableRow key={centro.id_centro}>
                        <CTableDataCell className="row-number">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {centro.nombre_agencia}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.comercializador_razon_social || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.representantes &&
                          centro.representantes.length > 0 ? (
                            <ul className="list-unstyled mb-0">
                              {centro.representantes.map((rep, idx) => (
                                <li key={rep.id_persona || idx} className="mb-1">
                                  <span className="fw-semibold small">
                                    {rep.ci_rif || "—"}
                                  </span>
                                  <br />
                                  <span className="text-muted small">
                                    {rep.razon_social || "—"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : centro.persona_razon_social ? (
                            <>
                              <span className="fw-semibold">
                                {centro.persona_ci_rif}
                              </span>
                              <br />
                              <span className="text-muted small">
                                {centro.persona_razon_social}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.direccion || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={centro.estado === "activo" ? "success" : "secondary"}
                            shape="rounded-pill"
                            className="status-badge"
                          >
                            {centro.estado === "activo" ? "Activo" : "Inactivo"}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            className="action-btn"
                            onClick={() => setModalVerId(centro.id_centro)}
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
                              onClick={() =>
                                setModalEditarCentroId(centro.id_centro)
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

export default CentrosApuestaListaView;