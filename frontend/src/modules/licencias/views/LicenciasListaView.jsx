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
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import { useAuth } from '../../auth/store/AuthContext'
import LicenciaDetalleModal from '../components/LicenciaDetalleModal'
import LicenciasEditarModal from '../components/LicenciasEditarModal'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const LICENCIAS_SEARCH_FIELDS = [
  'numero_documento',
  'persona',
  'ci_rif',
  'categoria',
  'estado_documento',
  'comercializador',
  'numero_lot',
]

const LicenciasListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: licencias, loading, error, refetch } = useFetch('/licencias')

  const location = useLocation()
  const [modalDataId, setModalDataId] = React.useState(null)
  const [modalEditarId, setModalEditarId] = React.useState(null)
  const [paginaActual, setPaginaActual] = React.useState(1)
  const [busqueda, setBusqueda] = React.useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const licenciasFiltradas = React.useMemo(
    () => filterBySearch(licencias, debouncedBusqueda, LICENCIAS_SEARCH_FIELDS),
    [licencias, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = licenciasFiltradas ? Math.ceil(licenciasFiltradas.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const licenciasPaginadas = licenciasFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || []

  React.useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  React.useEffect(() => {
    if (location.state?.openModalId) {
      setModalDataId(location.state.openModalId)
      window.history.replaceState({}, '')
    }
  }, [location.state])

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
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1 text-primary">Licencias</h4>
            <p className="text-muted small">Listado de licencias emitidas en el sistema.</p>
          </div>
          <CButton color="primary" onClick={() => navigate('/licencias/registro')}>
            <CIcon icon={cilPlus} className="me-2" /> Emitir Licencia
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar licencia..."
            />
          </div>
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <CSpinner />
            </div>
          )}
          {error && <CAlert color="danger">{error}</CAlert>}
          {!loading && !error && licenciasFiltradas.length === 0 && (
            <CAlert color="info">
              {licencias?.length === 0
                ? 'No se encontraron licencias emitidas.'
                : 'No se encontraron licencias.'}
            </CAlert>
          )}
          {!loading && !error && licenciasFiltradas.length > 0 && (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Documento</CTableHeaderCell>
                  <CTableHeaderCell>Persona</CTableHeaderCell>
                  <CTableHeaderCell>Categoría</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Expedición</CTableHeaderCell>
                  <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                    <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {licenciasPaginadas.map((licencia, index) => (
                  <CTableRow key={licencia.id_documento}>
                    <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                    <CTableDataCell>{licencia.numero_documento}</CTableDataCell>
                    <CTableDataCell>{licencia.persona}</CTableDataCell>
                    <CTableDataCell>{licencia.categoria}</CTableDataCell>
                    <CTableDataCell>{licencia.estado_documento}</CTableDataCell>
                    <CTableDataCell>{licencia.fecha_expedicion?.slice(0, 10)}</CTableDataCell>
                    <CTableDataCell>{licencia.fecha_vencimiento?.slice(0, 10)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        className="me-1"
                        onClick={() => setModalDataId(licencia.id_documento)}
                      >
                        Ver
                      </CButton>
                      {user?.rol !== 'supervisor' && (
                        <CButton
                          size="sm"
                          color="warning"
                          variant="outline"
                          onClick={() => setModalEditarId(licencia.id_documento)}
                        >
                          Editar
                        </CButton>
                      )}
                    </CTableDataCell>
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

export default LicenciasListaView
