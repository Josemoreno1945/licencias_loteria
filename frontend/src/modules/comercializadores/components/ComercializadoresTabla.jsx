import React from 'react'
import {
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
import CIcon from '@coreui/icons-react'
import { cilPeople, cilGamepad, cilPlus } from '@coreui/icons'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const COMERCIALIZADORES_SEARCH_FIELDS = [
  'rif',
  'razon_social',
  'telefono',
  'email',
  'estado',
]

const ComercializadoresTabla = ({
  comercializadores,
  loading,
  error,
  refetch,
  user,
  onNavegarRegistro,
  onVerRepresentantes,
  onVerPermisos,
  paginaActual,
  totalPaginas,
  onPageChange,
}) => {
  const PAGE_SIZE = 10

  const [busqueda, setBusqueda] = React.useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)
  const comercializadoresFiltrados = React.useMemo(
    () => filterBySearch(comercializadores, debouncedBusqueda, COMERCIALIZADORES_SEARCH_FIELDS),
    [comercializadores, debouncedBusqueda]
  )

  React.useEffect(() => {
    onPageChange(1)
  }, [debouncedBusqueda])

  const totalPaginasFiltrado = comercializadoresFiltrados ? Math.ceil(comercializadoresFiltrados.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const comercializadoresPaginados = comercializadoresFiltrados?.slice(startIndex, endIndex) || []

  return (
    <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
      <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
        <div>
          <h4 className="mb-1 text-primary">Lista de Comercializadores</h4>
          <p className="text-muted small mb-3">
            Empresas autorizadas a comercializar juegos de azar.
          </p>
        </div>
        {user?.rol !== 'supervisor' && (
          <CButton
            color="primary"
            size="sm"
            onClick={onNavegarRegistro}
          >
            <CIcon icon={cilPlus} className="me-1" /> + Nuevo Comercializador
          </CButton>
        )}
      </CCardHeader>

      <CCardBody>
        <div className="mb-3 buscador-container">
          <Buscador
            value={busqueda}
            onChange={setBusqueda}
            onClear={() => setBusqueda('')}
            placeholder="Buscar comercializador..."
          />
        </div>

        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <CSpinner color="primary" />
            <span className="ms-3 text-muted">Cargando comercializadores...</span>
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
            {comercializadores && comercializadoresFiltrados.length === 0 ? (
              <CAlert color="info">No se encontraron comercializadores.</CAlert>
            ) : (
              <>
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>RIF</CTableHeaderCell>
                      <CTableHeaderCell>Razón Social</CTableHeaderCell>
                      <CTableHeaderCell>Teléfono</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Representantes</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Juegos</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {comercializadoresPaginados.map((com, index) => (
                      <CTableRow key={com.id_comercializadores}>
                        <CTableDataCell className="text-muted small">{startIndex + index + 1}</CTableDataCell>
                        <CTableDataCell className="fw-semibold">{com.rif}</CTableDataCell>
                        <CTableDataCell>{com.razon_social}</CTableDataCell>
                        <CTableDataCell>
                          {com.telefono || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {com.email || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={com.estado === 'activo' ? 'success' : 'secondary'}>
                            {com.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            onClick={() => onVerRepresentantes(com)}
                          >
                            <CIcon icon={cilPeople} className="me-1" />
                            Ver
                          </CButton>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="success"
                            variant="outline"
                            size="sm"
                            onClick={() => onVerPermisos(com)}
                          >
                            <CIcon icon={cilGamepad} className="me-1" />
                            Juegos
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                <Paginacion
                  currentPage={paginaActual}
                  totalPages={totalPaginasFiltrado}
                  onPageChange={onPageChange}
                />
              </>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ComercializadoresTabla
