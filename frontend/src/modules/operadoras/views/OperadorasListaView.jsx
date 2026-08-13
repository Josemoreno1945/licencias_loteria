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
import Paginacion from '../../../components/Paginacion'

const OperadorasListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: operadoras, loading, error, refetch } = useFetch('/operadoras')

  const [paginaActual, setPaginaActual] = React.useState(1)
  const PAGE_SIZE = 10
  const totalPaginas = operadoras ? Math.ceil(operadoras.length / PAGE_SIZE) : 0
  const startIndex = (paginaActual - 1) * PAGE_SIZE
  const operadorasPaginadas = operadoras?.slice(startIndex, startIndex + PAGE_SIZE) || []

  return (
    <CContainer fluid>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center pb-0">
          <div>
            <h4 className="mb-1 text-primary">Lista de Operadoras</h4>
            <p className="text-muted small mb-3">
              Empresas propietarias de juegos de azar registradas en el sistema.
            </p>
          </div>
          {user?.rol !== 'supervisor' && (
            <CButton
              color="primary"
              size="sm"
              onClick={() => navigate('/operadoras/registro')}
            >
              + Nueva Operadora
            </CButton>
          )}
        </CCardHeader>

        <CCardBody>
          {/* Estado de carga */}
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
              <span className="ms-3 text-muted">Cargando operadoras...</span>
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
              {operadoras && operadoras.length === 0 ? (
                <CAlert color="info">No hay operadoras registradas aun.</CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>RIF</CTableHeaderCell>
                      <CTableHeaderCell>Razón Social</CTableHeaderCell>
                      <CTableHeaderCell>Dirección Fiscal</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {operadorasPaginadas.map((operadora, index) => (
                      <CTableRow key={operadora.id_operadora}>
                        <CTableDataCell className="text-muted small">
                          {startIndex + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {operadora.rif}
                        </CTableDataCell>
                        <CTableDataCell>{operadora.razon_social}</CTableDataCell>
                        <CTableDataCell>
                          {operadora.direccion_fiscal || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={operadora.estado === 'activo' ? 'success' : 'secondary'}>
                            {operadora.estado === 'activo' ? 'Activo' : 'Inactivo'}
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

export default OperadorasListaView
