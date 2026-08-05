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

const JuegosListaView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: juegos, loading, error, refetch } = useFetch('/juegos');

  return (
    <CContainer fluid>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Juegos</h4>
            <p className="text-muted small mb-3">
              Catálogo de juegos de azar asociados a sus respectivas operadoras.
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
              {juegos && juegos.length === 0 ? (
                <CAlert color="info">No hay juegos registrados aún.</CAlert>
              ) : (
                <CTable hover responsive striped align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre del Juego</CTableHeaderCell>
                      <CTableHeaderCell>Operadora (Propietaria)</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {juegos && juegos.map((juego, index) => (
                      <CTableRow key={juego.id_juego}>
                        <CTableDataCell className="text-muted small">
                          {index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {juego.nombre}
                        </CTableDataCell>
                        <CTableDataCell>
                          {juego.operadora_razon_social || juego.id_operadora}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={juego.estado === 'activo' ? 'success' : 'secondary'}>
                            {juego.estado === 'activo' ? 'Activo' : 'Inactivo'}
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

export default JuegosListaView;
