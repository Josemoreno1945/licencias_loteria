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
import useFetch from '../../../hooks/useFetch';
import { useAuth } from '../../auth/store/AuthContext';

const SolicitudesListaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: solicitudes, loading, error, refetch } = useFetch('/solicitudes');

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
              {solicitudes && solicitudes.length === 0 ? (
                <CAlert color="info">No hay solicitudes registradas aún.</CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Solicitante</CTableHeaderCell>
                      <CTableHeaderCell>Tipo de Trámite</CTableHeaderCell>
                      <CTableHeaderCell>Categoría</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {solicitudes && solicitudes.map((sol, index) => (
                      <CTableRow key={sol.id_solicitudes}>
                        <CTableDataCell className="text-muted small">
                          {index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {sol.persona_razon_social || sol.id_persona}
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
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default SolicitudesListaView;
