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
import { useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass, cilPencil } from '@coreui/icons';
import useFetch from '../../../hooks/useFetch';
import useDebounce from '../../../hooks/useDebounce';
import { filterBySearch } from '../../../utils/helpers';
import { useAuth } from '../../auth/store/AuthContext';
import JuegosDetalleModal from '../components/JuegosDetalleModal';
import JuegosEditarModal from '../components/JuegosEditarModal';
import Buscador from '../../../components/Buscador';
import Paginacion from '../../../components/Paginacion';

const JUEGOS_SEARCH_FIELDS = [
  'nombre',
  'estado',
];

const JuegosListaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: juegos, loading, error, refetch } = useFetch('/juegos');
  const [modalVerId, setModalVerId] = React.useState(null);
  const [modalEditarJuegoId, setModalEditarJuegoId] = React.useState(null);
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [busqueda, setBusqueda] = React.useState('');
  const debouncedBusqueda = useDebounce(busqueda, 400);

  const juegosFiltrados = React.useMemo(
    () => filterBySearch(juegos, debouncedBusqueda, JUEGOS_SEARCH_FIELDS),
    [juegos, debouncedBusqueda]
  );

  const PAGE_SIZE = 10;
  const totalPaginas = juegosFiltrados ? Math.ceil(juegosFiltrados.length / PAGE_SIZE) : 0;
  const startIndex = (paginaActual - 1) * PAGE_SIZE;
  const juegosPaginados = juegosFiltrados?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  React.useEffect(() => {
    setPaginaActual(1);
  }, [debouncedBusqueda]);

  return (
    <CContainer fluid>
      <JuegosDetalleModal
        idJuego={modalVerId}
        onClose={() => setModalVerId(null)}
      />
      <JuegosEditarModal
        idJuego={modalEditarJuegoId}
        onClose={() => setModalEditarJuegoId(null)}
        onUpdated={refetch}
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Juegos</h4>
            <p className="text-muted small mb-3">
              Catálogo de juegos de azar.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/juegos/registro')}
            >
              + Nuevo Juego
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          <div className="mb-3 buscador-container">
            <Buscador
              value={busqueda}
              onChange={setBusqueda}
              onClear={() => setBusqueda('')}
              placeholder="Buscar juego..."
            />
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando juegos...</span>
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
              {juegosFiltrados?.length === 0 ? (
                <CAlert color="info">
                  {juegos?.length === 0
                    ? 'No hay juegos registrados aún.'
                    : 'No se encontraron juegos.'}
                </CAlert>
              ) : (
                <>
                  <CTable hover responsive striped align="middle" className="mb-0">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Nombre del Juego</CTableHeaderCell>
                         <CTableHeaderCell>Estado</CTableHeaderCell>
                         <CTableHeaderCell className="text-center">Ver</CTableHeaderCell>
                         <CTableHeaderCell className="text-center">Editar</CTableHeaderCell>
                       </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {juegosPaginados.map((juego, index) => (
                        <CTableRow key={juego.id_juego}>
                          <CTableDataCell className="text-muted small">
                            {startIndex + index + 1}
                          </CTableDataCell>
                          <CTableDataCell className="fw-semibold">
                            {juego.nombre}
                          </CTableDataCell>
                           <CTableDataCell>
                             <CBadge color={juego.estado === 'activo' ? 'success' : 'secondary'}>
                               {juego.estado === 'activo' ? 'Activo' : 'Inactivo'}
                             </CBadge>
                           </CTableDataCell>
                           <CTableDataCell className="text-center">
                             <CButton
                               size="sm"
                               color="primary"
                               variant="outline"
                               onClick={() => setModalVerId(juego.id_juego)}
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
                                 onClick={() => setModalEditarJuegoId(juego.id_juego)}
                               >
                                 <CIcon icon={cilPencil} />
                               </CButton>
                             )}
                           </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  <Paginacion
                    currentPage={paginaActual}
                    totalPages={totalPaginas}
                    onPageChange={setPaginaActual}
                  />
                </>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default JuegosListaView;
