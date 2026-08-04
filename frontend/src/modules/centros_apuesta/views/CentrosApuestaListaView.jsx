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
import { useAuth } from '../../auth/store/AuthContext'

const CentrosApuestaListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: centros, loading, error, refetch } = useFetch('/centros_apuesta')

  return (
    <CContainer fluid>
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
              {centros && centros.length === 0 ? (
                <CAlert color="info">No hay centros de apuesta registrados aun.</CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre Agencia</CTableHeaderCell>
                      <CTableHeaderCell>Comercializador</CTableHeaderCell>
                      <CTableHeaderCell>Encargado</CTableHeaderCell>
                      <CTableHeaderCell>Dirección</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {centros && centros.map((centro, index) => (
                      <CTableRow key={centro.id_centro}>
                        <CTableDataCell className="text-muted small">
                          {index + 1}
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
                          {centro.persona_razon_social ? (
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
  )
}

export default CentrosApuestaListaView
