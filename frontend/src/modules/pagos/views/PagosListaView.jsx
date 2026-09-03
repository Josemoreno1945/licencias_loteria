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
  CSpinner,
  CAlert,
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilMagnifyingGlass } from "@coreui/icons";
import useFetch from "../../../hooks/useFetch";
import useDebounce from "../../../hooks/useDebounce";
import { filterBySearch } from "../../../utils/helpers";
import PagosDetalleModal from "../components/PagosDetalleModal";
import Buscador from "../../../components/Buscador";
import Paginacion from "../../../components/Paginacion";

const PAGOS_SEARCH_FIELDS = [
  "banco",
  "num_referencia",
  "fecha_pago",
  "monto",
  "licencia",
  "autorizacion",
  "participacion",
  "responsable_texto",
  "registrado_por",
];

const fmtFecha = (f) => {
  if (!f) return "—";
  const d = new Date(f);
  return Number.isNaN(d.getTime())
    ? f
    : d.toLocaleDateString();
};

const fmtMoneda = (m) => {
  if (m === null || m === undefined || m === "") return "—";
  const n = Number(m);
  return Number.isNaN(n)
    ? String(m)
    : n.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const PagosListaView = () => {
  const { data: pagos, loading, error, refetch } = useFetch("/pagos");

  const [modalVerId, setModalVerId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const pagosFiltrados = useMemo(
    () =>
      filterBySearch(pagos, debouncedBusqueda, PAGOS_SEARCH_FIELDS),
    [pagos, debouncedBusqueda],
  );

  const PAGE_SIZE = 10;
  const totalPaginas = pagosFiltrados
    ? Math.ceil(pagosFiltrados.length / PAGE_SIZE)
    : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const pagosPaginados =
    pagosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  return (
    <CContainer fluid>
      <PagosDetalleModal
        idPago={modalVerId}
        onClose={() => setModalVerId(null)}
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Pagos</h4>
            <p className="text-muted small mb-3">
              Listado de pagos registrados para licencias, autorizaciones y
              participaciones.
            </p>
          </div>
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda("")}
              placeholder="Buscar pago..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando pagos...</span>
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
              {pagosFiltrados?.length === 0 ? (
                <CAlert color="info">
                  {pagos?.length === 0
                    ? "No hay pagos registrados aun."
                    : "No se encontraron pagos."}
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
                      <CTableHeaderCell>Banco</CTableHeaderCell>
                      <CTableHeaderCell>Referencia</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Monto (Bs.)</CTableHeaderCell>
                      <CTableHeaderCell>Documento</CTableHeaderCell>
                      <CTableHeaderCell>Registrado Por</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Ver
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {pagosPaginados.map((pago, index) => {
                      const documento =
                        pago.licencia ||
                        pago.autorizacion ||
                        pago.participacion ||
                        null;
                      return (
                        <CTableRow key={pago.id_pago}>
                          <CTableDataCell className="row-number">
                            {startIndex + index + 1}
                          </CTableDataCell>
                          <CTableDataCell className="fw-semibold">
                            {pago.banco || "—"}
                          </CTableDataCell>
                          <CTableDataCell>
                            {pago.num_referencia || "—"}
                          </CTableDataCell>
                          <CTableDataCell>
                            {fmtFecha(pago.fecha_pago)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end fw-semibold">
                            {fmtMoneda(pago.monto)}
                          </CTableDataCell>
                          <CTableDataCell>
                            {documento || (
                              <span className="text-muted">—</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {pago.registrado_por || "—"}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              className="action-btn"
                              onClick={() => setModalVerId(pago.id_pago)}
                            >
                              <CIcon icon={cilMagnifyingGlass} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      );
                    })}
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

export default PagosListaView;