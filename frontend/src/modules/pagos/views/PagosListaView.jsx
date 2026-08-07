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
  CSpinner,
  CAlert,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'

const PagosListaView = () => {
  const navigate = useNavigate()
  const { data: pagos, loading, error } = useFetch('/pagos')

  return (
    <CContainer fluid>
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1 text-primary">Pagos</h4>
            <p className="text-muted small">Listado de pagos registrados para licencias.</p>
          </div>
          <CButton color="primary" onClick={() => navigate('/pagos/registro')}>
            <CIcon icon={cilPlus} className="me-2" /> Nuevo Pago
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <CSpinner />
            </div>
          )}
          {error && <CAlert color="danger">{error}</CAlert>}
          {!loading && !error && pagos?.length === 0 && (
            <CAlert color="info">No hay pagos registrados todavía.</CAlert>
          )}
          {!loading && !error && pagos?.length > 0 && (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Banco</CTableHeaderCell>
                  <CTableHeaderCell>Referencia</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Monto</CTableHeaderCell>
                  <CTableHeaderCell>Licencia</CTableHeaderCell>
                  <CTableHeaderCell>Registrado Por</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {pagos.map((pago, index) => (
                  <CTableRow key={pago.id_pago}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{pago.banco}</CTableDataCell>
                    <CTableDataCell>{pago.num_referencia}</CTableDataCell>
                    <CTableDataCell>{pago.fecha_pago}</CTableDataCell>
                    <CTableDataCell>{pago.monto}</CTableDataCell>
                    <CTableDataCell>{pago.licencia || '—'}</CTableDataCell>
                    <CTableDataCell>{pago.registrado_por}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default PagosListaView
