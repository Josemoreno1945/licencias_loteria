import React, { useState, useEffect, useMemo } from "react";
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
import { useNavigate } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilMagnifyingGlass, cilPencil } from "@coreui/icons";
import useFetch from "../../../hooks/useFetch";
import useDebounce from "../../../hooks/useDebounce";
import { filterBySearch } from "../../../utils/helpers";
import { useAuth } from "../../auth/store/AuthContext";
import BancosDetalleModal from "../components/BancosDetalleModal";
import BancosEditarModal from "../components/BancosEditarModal";
import Buscador from "../../../components/Buscador";
import Paginacion from "../../../components/Paginacion";

const BANCOS_SEARCH_FIELDS = ["nombre", "codigo", "estado"];

const BancosListaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: bancos, loading, error, refetch } = useFetch("/bancos");

  const [modalVerId, setModalVerId] = useState(null);
  const [modalEditarBancoId, setModalEditarBancoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const bancosFiltrados = useMemo(
    () => filterBySearch(bancos, debouncedBusqueda, BANCOS_SEARCH_FIELDS),
    [bancos, debouncedBusqueda],
  );

  const PAGE_SIZE = 10;
  const totalPaginas = bancosFiltrados
    ? Math.ceil(bancosFiltrados.length / PAGE_SIZE)
    : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const bancosPaginados =
    bancosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  return (
    <CContainer fluid>
      <BancosDetalleModal
        idBanco={modalVerId}
        onClose={() => setModalVerId(null)}
      />
      <BancosEditarModal
        idBanco={modalEditarBancoId}
        onClose={() => setModalEditarBancoId(null)}
        onUpdated={refetch}
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Bancos</h4>
            <p className="text-muted small mb-3">
              Catalogo de bancos registrados en el sistema.
            </p>
          </div>
          {user?.rol !== "supervisor" && (
            <CButton
              color="primary"
              onClick={() => navigate("/bancos/registro")}
            >
              <CIcon icon={cilPlus} className="me-2" /> Nuevo Banco
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda("")}
              placeholder="Buscar banco..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando bancos...</span>
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
              {bancosFiltrados?.length === 0 ? (
                <CAlert color="info">
                  {bancos?.length === 0
                    ? "No hay bancos registrados aun."
                    : "No se encontraron bancos."}
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
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Codigo BCV</CTableHeaderCell>
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
                    {bancosPaginados.map((banco, index) => (
                      <CTableRow key={banco.id_banco}>
                        <CTableDataCell className="row-number">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {banco.nombre}
                        </CTableDataCell>
                        <CTableDataCell>
                          {banco.codigo || (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge
                            color={banco.estado === "activo" ? "success" : "secondary"}
                            shape="rounded-pill"
                            className="status-badge"
                          >
                            {banco.estado === "activo" ? "Activo" : "Inactivo"}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            className="action-btn"
                            onClick={() => setModalVerId(banco.id_banco)}
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
                                setModalEditarBancoId(banco.id_banco)
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

export default BancosListaView;