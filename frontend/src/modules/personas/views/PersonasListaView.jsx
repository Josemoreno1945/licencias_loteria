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
import { useNavigate, useLocation } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import { useAuth } from '../../auth/store/AuthContext'
import PersonaDetalleModal from '../components/PersonaDetalleModal'
import Paginacion from '../../../components/Paginacion'

const PersonasListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: personas, loading, error, refetch } = useFetch('/personas')
  
  const location = useLocation()
  const [modalDataId, setModalDataId] = React.useState(null)
  const [paginaActual, setPaginaActual] = React.useState(1)

  const PAGE_SIZE = 10
  const totalPaginas = personas ? Math.ceil(personas.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const personasPaginadas = personas?.slice(startIndex, startIndex + PAGE_SIZE) || []

  React.useEffect(() => {
    if (location.state?.openModalId) {
      setModalDataId(location.state.openModalId)
      // Limpiar el state para que no se reabra al recargar
      window.history.replaceState({}, '')
    }
  }, [location.state])

  return (
    <CContainer fluid>
      <PersonaDetalleModal 
        idPersona={modalDataId} 
        onClose={() => setModalDataId(null)} 
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Personas</h4>
            <p className="text-muted small mb-3">
              Personas naturales y juridicas registradas en el sistema.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/personas/registro')}
            >
              + Nueva Persona
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          {/* Estado de carga */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando personas...</span>
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
              {personas && personas.length === 0 ? (
                <CAlert color="info">No hay personas registradas aun.</CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>CI / RIF</CTableHeaderCell>
                      <CTableHeaderCell>Nombre / Razon Social</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Telefono</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {personasPaginadas.map((persona, index) => (
                      <CTableRow key={persona.ci_rif}>
                        <CTableDataCell className="text-muted small">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {persona.ci_rif}
                        </CTableDataCell>
                        <CTableDataCell>{persona.razon_social}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={persona.tipo_persona === 'natural' ? 'info' : 'warning'}
                          >
                            {persona.tipo_persona === 'natural' ? 'Natural' : 'Juridica'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {persona.telefono || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {persona.email || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            onClick={() => setModalDataId(persona.id_persona)}
                          >
                            Ver
                          </CButton>
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

export default PersonasListaView
