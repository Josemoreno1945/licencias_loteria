import { useState, useEffect, useMemo } from 'react'
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
import CIcon from '@coreui/icons-react'
import { cilPlus, cilMagnifyingGlass, cilPencil } from '@coreui/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import { useAuth } from '../../auth/store/AuthContext'
import AutorizacionesDetalleModal from '../components/AutorizacionesDetalleModal'
import AutorizacionesEditarModal from '../components/AutorizacionesEditarModal'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const AUTORIZACIONES_SEARCH_FIELDS = [
  'numero_documento',
  'nro_mesa',
  'ci_rif',
  'persona',
  'centro_apuesta',
  'agencia_texto',
]

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'vigente':    return 'success'
    case 'vencido':    return 'warning'
    case 'suspendido': return 'danger'
    case 'anulado':    return 'secondary'
    default:           return 'info'
  }
}

const getTipoBadge = (tipo) => {
  switch (tipo) {
    case 'Mesa':      return 'primary'
    case 'Movil':     return 'info'
    case 'Localidad': return 'warning'
    default:          return 'dark'
  }
}

const AutorizacionesListaView = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const { data: autorizaciones, loading, error, refetch } = useFetch('/autorizaciones-especiales')
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [modalDetalleId, setModalDetalleId] = useState(null)
  const [modalEditarId, setModalEditarId] = useState(null)
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const autorizacionesFiltradas = useMemo(
    () => filterBySearch(autorizaciones, debouncedBusqueda, AUTORIZACIONES_SEARCH_FIELDS),
    [autorizaciones, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = autorizacionesFiltradas ? Math.ceil(autorizacionesFiltradas.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const autorizacionesPaginadas = autorizacionesFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || []

  useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  useEffect(() => {
    if (location.state?.openModalId) {
      setModalDetalleId(location.state.openModalId)
      window.history.replaceState({}, "")
    }
  }, [location.state])

  return (
    <CContainer fluid>
      <AutorizacionesDetalleModal
        idAutorizacion={modalDetalleId}
        onClose={() => setModalDetalleId(null)}
      />
      <AutorizacionesEditarModal
        idAutorizacion={modalEditarId}
        onClose={() => setModalEditarId(null)}
        onUpdated={refetch}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Autorizaciones Especiales</h4>
            <p className="text-muted small mb-3">
              Autorizaciones especiales registradas en el sistema.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton color="primary" onClick={() => navigate('/autorizaciones/registro')}>
              <CIcon icon={cilPlus} className="me-2" /> Emitir Autorización
            </CButton>
          )}
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

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando autorizaciones...</span>
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
              {autorizacionesFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {autorizaciones?.length === 0
                    ? 'No hay autorizaciones especiales registradas aun.'
                    : 'No se encontraron autorizaciones.'}
                </CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0 module-table">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nro. Documento</CTableHeaderCell>
                      <CTableHeaderCell>Nro. Mesa</CTableHeaderCell>
                      <CTableHeaderCell>Persona</CTableHeaderCell>
                      <CTableHeaderCell>Agencia</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Tipo</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                      <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Ver</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Editar</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {autorizacionesPaginadas.map((aut, index) => (
                      <CTableRow key={aut.id_documento}>
                        <CTableDataCell className="row-number">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {aut.numero_documento}
                        </CTableDataCell>
                        <CTableDataCell>{aut.nro_mesa || <span className="text-muted">—</span>}</CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-semibold">{aut.ci_rif}</div>
                          <div className="text-muted small">{aut.persona}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {aut.centro_apuesta || aut.agencia_texto || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={getTipoBadge(aut.tipo)} shape="rounded-pill" className="status-badge">
                            {aut.tipo || '—'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={getEstadoBadge(aut.estado_documento)} shape="rounded-pill" className="status-badge">
                            {aut.estado_documento}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {aut.fecha_vencimiento?.slice(0, 10)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            className="action-btn"
                            onClick={() => setModalDetalleId(aut.id_documento)}
                          >
                            <CIcon icon={cilMagnifyingGlass} />
                          </CButton>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {user?.rol !== 'supervisor' && (
                            <CButton
                              size="sm"
                              color="warning"
                              variant="outline"
                              className="action-btn"
                              onClick={() => setModalEditarId(aut.id_documento)}
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
  )
}

export default AutorizacionesListaView
