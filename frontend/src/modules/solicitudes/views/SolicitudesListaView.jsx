import React from 'react';
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
} from '@coreui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass } from '@coreui/icons';
import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { filterBySearch } from '../../../utils/helpers';
import { useAuth } from '../../auth/store/AuthContext';
import SolicitudDetalleModal from '../components/SolicitudDetalleModal';
import Buscador from '../../../components/Buscador';
import Paginacion from '../../../components/Paginacion';

const SOLICITUDES_SEARCH_FIELDS = [
  'ci_rif',
  'persona',
  'comercializador',
  'operadora',
  'tipo_tramite',
  'categoria_licencia',
  'estado',
];

const SolicitudesListaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: solicitudes, loading, error, refetch } = useFetch('/solicitudes');

  const location = useLocation();
  const [modalDataId, setModalDataId] = React.useState(null);
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [busqueda, setBusqueda] = React.useState('');
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const solicitudesFiltradas = React.useMemo(
    () => filterBySearch(solicitudes, debouncedBusqueda, SOLICITUDES_SEARCH_FIELDS),
    [solicitudes, debouncedBusqueda]
  );

  const PAGE_SIZE = 10;
  const totalPaginas = solicitudesFiltradas ? Math.ceil(solicitudesFiltradas.length / PAGE_SIZE) : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const solicitudesPaginadas = solicitudesFiltradas?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  React.useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  React.useEffect(() => {
    if (location.state?.openModalId) {
      setModalDataId(location.state.openModalId);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return 'success';
      case 'Rechazada':
        return 'danger';
      case 'Pendiente':
      default:
        return 'warning';
    }
  };

  return (
    <CContainer fluid>
      <SolicitudDetalleModal 
        idSolicitud={modalDataId} 
        onClose={() => setModalDataId(null)} 
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Solicitudes</h4>
            <p className="text-muted small mb-3">
              Trámites iniciados por personas o comercializadores.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/solicitudes/registro')}
            >
              + Nueva Solicitud
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar solicitud..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando solicitudes...</span>
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
              {solicitudesFiltradas?.length === 0 ? (
                <CAlert color="info">
                  {solicitudes?.length === 0
                    ? 'No hay solicitudes registradas aún.'
                    : 'No se encontraron solicitudes.'}
                </CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Solicitante</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell>Operadora</CTableHeaderCell>
                      <CTableHeaderCell>Tipo de Trámite</CTableHeaderCell>
                      <CTableHeaderCell>Categoría</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                       <CTableHeaderCell>Estado</CTableHeaderCell>
                       <CTableHeaderCell className="text-center">Ver</CTableHeaderCell>
                     </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {solicitudesPaginadas.map((sol, index) => (
                      <CTableRow key={sol.id_solicitudes}>
                        <CTableDataCell className="text-muted small">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {sol.persona ? `${sol.ci_rif} — ${sol.persona}` : sol.id_persona || '—'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {sol.comercializador || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {sol.operadora || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {sol.tipo_tramite}
                        </CTableDataCell>
                        <CTableDataCell>
                          {sol.categoria_licencia || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(sol.created_at).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getEstadoBadge(sol.estado)}>
                            {sol.estado}
                          </CBadge>
                         </CTableDataCell>
                         <CTableDataCell className="text-center">
                           <CButton
                             size="sm"
                             color="primary"
                             variant="outline"
                             onClick={() => setModalDataId(sol.id_solicitudes)}
                           >
                             <CIcon icon={cilMagnifyingGlass} />
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
  );
};

export default SolicitudesListaView;
