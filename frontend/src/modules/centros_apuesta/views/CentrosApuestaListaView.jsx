import React, { useState, useEffect } from 'react'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGamepad, cilMagnifyingGlass, cilPencil } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../auth/store/AuthContext'
import CentrosApuestaDetalleModal from '../components/CentrosApuestaDetalleModal'
import CentrosApuestaEditarModal from '../components/CentrosApuestaEditarModal'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const CENTROS_APOYO_SEARCH_FIELDS = [
  'nombre_agencia',
  'comercializador_razon_social',
  'persona_razon_social',
  'direccion',
]

const CentrosApuestaListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: centros, loading, error, refetch } = useFetch('/centros_apuesta')
  const [modalVerId, setModalVerId] = React.useState(null)
  const [modalEditarCentroId, setModalEditarCentroId] = React.useState(null)
  const [paginaActual, setPaginaActual] = React.useState(1)
  const [busqueda, setBusqueda] = React.useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const centrosFiltrados = React.useMemo(
    () => filterBySearch(centros, debouncedBusqueda, CENTROS_APOYO_SEARCH_FIELDS),
    [centros, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = centrosFiltrados ? Math.ceil(centrosFiltrados.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const centrosPaginados = centrosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || []

  React.useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  // --- Estado para el modal de permisos ---
  const [permisosModal, setPermisosModal] = useState({ visible: false, centro: null })
  const [permisos, setPermisos] = useState([])
  const [loadingPermisos, setLoadingPermisos] = useState(false)
  const [errorPermisos, setErrorPermisos] = useState(null)

  // --- Funciones para Permisos ---
  const handleVerPermisos = async (centro) => {
    setPermisosModal({ visible: true, centro })
    setLoadingPermisos(true)
    setErrorPermisos(null)
    try {
      const res = await axiosInstance.get(`/permisos-juego/por-comercializador/${centro.id_comercializador}`)
      setPermisos(res.data || [])
    } catch {
      setErrorPermisos('No se pudieron cargar los permisos de juegos.')
    } finally {
      setLoadingPermisos(false)
    }
  }

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
      {/* Modal de Permisos de Juegos */}
      <CModal
        size="lg"
        visible={permisosModal.visible}
        onClose={() => setPermisosModal({ visible: false, centro: null })}
        alignment="center"
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilGamepad} className="me-2" />
            Juegos Autorizados — {permisosModal.centro?.nombre_agencia}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingPermisos && (
            <div className="d-flex justify-content-center py-4">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando permisos...</span>
            </div>
          )}
          {errorPermisos && <CAlert color="danger">{errorPermisos}</CAlert>}
          {!loadingPermisos && !errorPermisos && (
            <>
              {permisos.length === 0 ? (
                <CAlert color="info">El comercializador de este centro no tiene juegos autorizados.</CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Juego</CTableHeaderCell>
                      <CTableHeaderCell>Vigencia</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {permisos.map((p, index) => (
                      <CTableRow key={p.id_permiso_juego}>
                        <CTableDataCell className="text-muted small">{index + 1}</CTableDataCell>
                        <CTableDataCell className="fw-semibold">{p.nombre_juego || '—'}</CTableDataCell>
                        <CTableDataCell>
                          <span className="d-block small">Inicio: {new Date(p.fecha_inicio).toLocaleDateString()}</span>
                          <span className="d-block small">Fin: {p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString() : 'Sin Vencimiento'}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={p.estado === 'activo' ? 'success' : 'secondary'}>
                            {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setPermisosModal({ visible: false, centro: null })}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Centros de Apuesta</h4>
            <p className="text-muted small mb-3">
              Agencias físicas (puntos de venta) registradas en el sistema.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/centros-apuesta/registro')}
            >
              + Nuevo Centro
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar centro de apuesta..."
            />
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando centros de apuesta...</span>
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
              {centrosFiltrados?.length === 0 ? (
                <CAlert color="info">
                  {centros?.length === 0
                    ? 'No hay centros de apuesta registrados aun.'
                    : 'No se encontraron centros de apuesta.'}
                </CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre Agencia</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell>Representante Legal</CTableHeaderCell>
                      <CTableHeaderCell>Dirección</CTableHeaderCell>
                       <CTableHeaderCell>Estado</CTableHeaderCell>
                       <CTableHeaderCell className="text-center">Ver</CTableHeaderCell>
                       <CTableHeaderCell className="text-center">Editar</CTableHeaderCell>
                       
                     </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {centrosPaginados.map((centro, index) => (
                      <CTableRow key={centro.id_centro}>
                        <CTableDataCell className="text-muted small">
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
                          {centro.representantes && centro.representantes.length > 0 ? (
                            <ul className="list-unstyled mb-0">
                              {centro.representantes.map((rep, idx) => (
                                <li key={idx} className="mb-1">
                                  <span className="fw-semibold small">{rep.ci_rif}</span>
                                  <br />
                                  <span className="text-muted small">{rep.razon_social}</span>
                                </li>
                              ))}
                            </ul>
                          ) : centro.persona_razon_social ? (
                            <>
                              <span className="fw-semibold">{centro.persona_ci_rif}</span>
                              <br />
                              <span className="text-muted small">{centro.persona_razon_social}</span>
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {centro.direccion || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={centro.estado === 'activo' ? 'success' : 'secondary'}>
                            {centro.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              onClick={() => setModalVerId(centro.id_centro)}
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
                                onClick={() => setModalEditarCentroId(centro.id_centro)}
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

export default CentrosApuestaListaView
