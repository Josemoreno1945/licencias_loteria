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
  CBadge,
  CSpinner,
  CAlert,
  CButton,
} from '@coreui/react'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const AUTORIZACIONES_SEARCH_FIELDS = [
  'numero_documento',
  'nro_mesa',
  'ci_rif',
  'persona',
  'operadora',
  'centro_apuesta',
  'agencia_texto',
]

const AutorizacionesListaView = () => {
  const { data: autorizaciones, loading, error, refetch } = useFetch('/autorizaciones-especiales')
  const [paginaActual, setPaginaActual] = React.useState(1)
  const [busqueda, setBusqueda] = React.useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const autorizacionesFiltradas = React.useMemo(
    () => filterBySearch(autorizaciones, debouncedBusqueda, AUTORIZACIONES_SEARCH_FIELDS),
    [autorizaciones, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = autorizacionesFiltradas ? Math.ceil(autorizacionesFiltradas.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const autorizacionesPaginadas = autorizacionesFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || []

  React.useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'vigente':
        return 'success'
      case 'vencido':
        return 'warning'
      case 'suspendido':
        return 'danger'
      case 'anulado':
        return 'secondary'
      default:
        return 'info'
    }
  }

  return (
    <CContainer fluid>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Autorizaciones Especiales</h4>
            <p className="text-muted small mb-3">
              Autorizaciones especiales registradas en el sistema.
            </p>
          </div>
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar autorización..."
            />
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando autorizaciones...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <CAlert color="danger" className="d-flex align-items-center gap-2">
              <span>{error}</span>
              <CButton color="danger" variant="outline" size="sm" onClick={refetch}>
                Reintentar
              </CButton>
            </CAlert>
          )}

          {/* Tabla */}
          {!loading && !error && (
            <>
              {autorizacionesFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {autorizaciones?.length === 0
                    ? 'No hay autorizaciones especiales registradas aun.'
                    : 'No se encontraron autorizaciones.'}
                </CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nro. Documento</CTableHeaderCell>
                      <CTableHeaderCell>Nro. Mesa</CTableHeaderCell>
                      <CTableHeaderCell>Persona</CTableHeaderCell>
                      <CTableHeaderCell>Operadora</CTableHeaderCell>
                      <CTableHeaderCell>Agencia</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {autorizacionesPaginadas.map((aut, index) => (
                      <CTableRow key={aut.id_documento}>
                        <CTableDataCell className="text-muted small">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {aut.numero_documento}
                        </CTableDataCell>
                        <CTableDataCell>{aut.nro_mesa}</CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-semibold">{aut.ci_rif}</div>
                          <div className="text-muted small">{aut.persona}</div>
                        </CTableDataCell>
                        <CTableDataCell>{aut.operadora || <span className="text-muted">—</span>}</CTableDataCell>
                        <CTableDataCell>
                          {aut.centro_apuesta || aut.agencia_texto || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getEstadoBadge(aut.estado_documento)}>
                            {aut.estado_documento}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {aut.fecha_vencimiento?.slice(0, 10)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <span className="text-muted small">—</span>
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
  )
}

export default AutorizacionesListaView
