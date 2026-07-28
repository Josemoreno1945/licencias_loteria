import { CContainer, CRow, CCol, CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

const DashboardView = () => {
  return (
    <CContainer fluid>
      <h2 className="mb-4">Dashboard</h2>
      <CRow>
        <CCol sm={6} lg={3} className="mb-4">
          <CCard className="text-center border-primary">
            <CCardBody>
              <CCardTitle>Licencias</CCardTitle>
              <CCardText className="fs-2 fw-bold text-primary">0</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3} className="mb-4">
          <CCard className="text-center border-success">
            <CCardBody>
              <CCardTitle>Operadoras</CCardTitle>
              <CCardText className="fs-2 fw-bold text-success">0</CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default DashboardView
