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
import { useNavigate, useLocation } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import LicenciaDetalleModal from '../components/LicenciaDetalleModal'

const LicenciasListaView = () => {
  const navigate = useNavigate()
  const { data: licencias, loading, error } = useFetch('/licencias')
  
  const location = useLocation()
  const [modalDataId, setModalDataId] = React.useState(null)

  React.useEffect(() => {
    if (location.state?.openModalId) {
      setModalDataId(location.state.openModalId)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  return (
    <CContainer fluid>
      <LicenciaDetalleModal 
        idLicencia={modalDataId} 
        onClose={() => setModalDataId(null)} 
      />
      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1 text-primary">Licencias</h4>
            <p className="text-muted small">Listado de licencias emitidas en el sistema.</p>
          </div>
          <CButton color="primary" onClick={() => navigate('/licencias/registro')}>
            <CIcon icon={cilPlus} className="me-2" /> Emitir Licencia
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <CSpinner />
            </div>
          )}
          {error && <CAlert color="danger">{error}</CAlert>}
          {!loading && !error && licencias?.length === 0 && (
            <CAlert color="info">No se encontraron licencias emitidas.</CAlert>
          )}
          {!loading && !error && licencias?.length > 0 && (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Documento</CTableHeaderCell>
                  <CTableHeaderCell>Persona</CTableHeaderCell>
                  <CTableHeaderCell>Categoría</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Expedición</CTableHeaderCell>
                  <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {licencias.map((licencia, index) => (
                  <CTableRow key={licencia.id_documento}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{licencia.numero_documento}</CTableDataCell>
                    <CTableDataCell>{licencia.persona}</CTableDataCell>
                    <CTableDataCell>{licencia.categoria}</CTableDataCell>
                    <CTableDataCell>{licencia.estado_documento}</CTableDataCell>
                    <CTableDataCell>{licencia.fecha_expedicion?.slice(0, 10)}</CTableDataCell>
                    <CTableDataCell>{licencia.fecha_vencimiento?.slice(0, 10)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() => setModalDataId(licencia.id_documento)}
                      >
                        Ver
                      </CButton>
                    </CTableDataCell>
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

export default LicenciasListaView
