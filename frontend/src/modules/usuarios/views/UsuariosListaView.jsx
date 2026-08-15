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
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import { useAuth } from '../../auth/store/AuthContext'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const USUARIOS_SEARCH_FIELDS = [
  'nombre_usuario',
  'email',
  'rol',
  'estado',
]

const ROLE_LABELS = {
  superAdmin: 'Super Administrador',
  gerente: 'Gerente',
  gestor_de_tramites: 'Gestor de Trámites',
  supervisor: 'Supervisor',
}

const UsuariosListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: usuarios, loading, error, refetch } = useFetch('/usuarios')
  const [paginaActual, setPaginaActual] = React.useState(1)
  const [busqueda, setBusqueda] = React.useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const usuariosFiltrados = React.useMemo(
    () => filterBySearch(usuarios, debouncedBusqueda, USUARIOS_SEARCH_FIELDS),
    [usuarios, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = usuariosFiltrados ? Math.ceil(usuariosFiltrados.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const usuariosPaginados = usuariosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || []

  React.useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  return (
    <CContainer fluid>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Usuarios</h4>
            <p className="text-muted small mb-3">
              Usuarios registrados en el sistema con sus roles y estados.
            </p>
          </div>
          {(user?.rol === 'superAdmin' || user?.rol === 'gerente') && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/usuarios/registro')}
            >
              + Nuevo Usuario
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar usuario..."
            />
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando usuarios...</span>
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
              {usuariosFiltrados.length === 0 ? (
                <CAlert color="info">
                  {usuarios?.length === 0
                    ? 'No hay usuarios registrados aun.'
                    : 'No se encontraron usuarios.'}
                </CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre de Usuario</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Rol</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {usuariosPaginados.map((usuario, index) => (
                      <CTableRow key={usuario.id_usuario}>
                        <CTableDataCell className="text-muted small">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {usuario.nombre_usuario}
                        </CTableDataCell>
                        <CTableDataCell>{usuario.email}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={['superAdmin', 'gerente'].includes(usuario.rol) ? 'danger' : 'info'}>
                            {ROLE_LABELS[usuario.rol] || usuario.rol}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={usuario.estado === 'activo' ? 'success' : 'secondary'}>
                            {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </CBadge>
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

export default UsuariosListaView
