import React, { useState, useEffect, useMemo } from 'react'
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
import { useNavigate, useLocation } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass, cilPencil } from '@coreui/icons'
import useFetch from '../../../hooks/useFetch'
import useDebounce from '../../../hooks/useDebounce'
import { filterBySearch } from '../../../utils/helpers'
import { useAuth } from '../../auth/store/AuthContext'
import PersonaDetalleModal from '../components/PersonaDetalleModal'
import PersonasEditarModal from '../components/PersonasEditarModal'
import Buscador from '../../../components/Buscador'
import Paginacion from '../../../components/Paginacion'

const PERSONAS_SEARCH_FIELDS = [
  'ci_rif',
  'razon_social',
  'tipo_persona',
  'telefono',
  'email',
]

const PersonasListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: personas, loading, error, refetch } = useFetch('/personas')

  const location = useLocation()
  const [modalDataId, setModalDataId] = useState(null)
  const [modalEditarPersonaId, setModalEditarPersonaId] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const debouncedBusqueda = useDebounce(busqueda, 400)

  const personasFiltradas = useMemo(
    () => filterBySearch(personas, debouncedBusqueda, PERSONAS_SEARCH_FIELDS),
    [personas, debouncedBusqueda]
  )

  const PAGE_SIZE = 10
  const totalPaginas = personasFiltradas ? Math.ceil(personasFiltradas.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const personasPaginadas = personasFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || []

  useEffect(() => {
    setPaginaActual(1)
  }, [debouncedBusqueda])

  useEffect(() => {
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
      <PersonasEditarModal
        idPersona={modalEditarPersonaId}
        onClose={() => setModalEditarPersonaId(null)}
        onUpdated={refetch}
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
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar persona..."
            />
          </div>

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
              {personasFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {personas?.length === 0
                    ? 'No hay personas registradas aun.'
                    : 'No se encontraron personas.'}
                </CAlert>
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
                       
                       <CTableHeaderCell className="text-center">Ver</CTableHeaderCell>
                       <CTableHeaderCell className="text-center">Editar</CTableHeaderCell>
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
                          {persona.tipo_persona === 'natural' ? 'Natural' : 'Jurídica'}
                        </CTableDataCell>
                         <CTableDataCell>
                           {persona.telefono || <span className="text-muted">—</span>}
                         </CTableDataCell>
                         <CTableDataCell>
                           {persona.email || <span className="text-muted">—</span>}
                         </CTableDataCell>
                         <CTableDataCell className="text-center">
                           <CButton
                             size="sm"
                             color="primary"
                             variant="outline"
                             onClick={() => setModalDataId(persona.id_persona)}
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
                               onClick={() => setModalEditarPersonaId(persona.id_persona)}
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

export default PersonasListaView
