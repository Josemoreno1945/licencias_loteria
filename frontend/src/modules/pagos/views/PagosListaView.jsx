import React from 'react'
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
} from '@coreui/react'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const PAGOS_SEARCH_FIELDS = [
  'banco',
  'num_referencia',
  'fecha_pago',
  'monto',
  'licencia',
  'responsable_texto',
]

const PagosListaView = () => {
  const { data: pagos, loading, error } = useFetch('/pagos')
  const [paginaActual, setPaginaActual] = React.useState(1)
  const [busqueda, setBusqueda] = React.useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const pagosFiltrados = React.useMemo(
    () => filterBySearch(pagos, debouncedBusqueda, PAGOS_SEARCH_FIELDS),
    [pagos, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = pagosFiltrados ? Math.ceil(pagosFiltrados.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const pagosPaginados = pagosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || []

  React.useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  return (
    <CContainer fluid>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1 text-primary">Pagos</h4>
            <p className="text-muted small">Listado de pagos registrados para licencias.</p>
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar pago..."
            />
          </div>
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <CSpinner />
            </div>
          )}
          {error && <CAlert color="danger">{error}</CAlert>}
          {!loading && !error && pagosFiltrados?.length === 0 && (
            <CAlert color="info">
              {pagos?.length === 0
                ? 'No hay pagos registrados todavía.'
                : 'No se encontraron pagos.'}
            </CAlert>
          )}
          {!loading && !error && pagosFiltrados?.length > 0 && (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Banco</CTableHeaderCell>
                  <CTableHeaderCell>Referencia</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Monto</CTableHeaderCell>
                  <CTableHeaderCell>Licencia</CTableHeaderCell>
                  <CTableHeaderCell>Registrado Por</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {pagosPaginados.map((pago, index) => (
                  <CTableRow key={pago.id_pago}>
                    <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                    <CTableDataCell>{pago.banco}</CTableDataCell>
                    <CTableDataCell>{pago.num_referencia}</CTableDataCell>
                    <CTableDataCell>{pago.fecha_pago}</CTableDataCell>
                    <CTableDataCell>{pago.monto}</CTableDataCell>
                    <CTableDataCell>{pago.licencia || '—'}</CTableDataCell>
                    <CTableDataCell>{pago.registrado_por}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
            <Paginacion
              currentPage={paginaActual}
              totalPages={totalPaginas}
              onPageChange={setPaginaActual}
            />
          </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default PagosListaView
