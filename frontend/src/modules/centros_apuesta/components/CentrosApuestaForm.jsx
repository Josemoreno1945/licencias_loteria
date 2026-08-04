import React from 'react'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilHome, cilUser } from '@coreui/icons'

const CentrosApuestaForm = ({
  formData,
  handleInputChange,
  onSubmit,
  comercializadores,
  personas,
  loadingDeps,
}) => {
  return (
    <CForm onSubmit={onSubmit}>
      {loadingDeps ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <CSpinner color="primary" />
          <span className="ms-3 text-muted">Cargando datos del formulario...</span>
        </div>
      ) : (
        <>
          <CRow className="mb-4">
            {/* Nombre de la Agencia */}
            <CCol md={12} className="mb-3">
              <CFormLabel>Nombre de la Agencia</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="nombre_agencia"
                  placeholder="Nombre del punto de venta / agencia"
                  value={formData.nombre_agencia}
                  onChange={handleInputChange}
                  required
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            {/* Comercializador */}
            <CCol md={6} className="mb-3">
              <CFormLabel>Comercializador</CFormLabel>
              <CInputGroup>
                <CFormSelect
                  name="id_comercializador"
                  value={formData.id_comercializador}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un comercializador...</option>
                  {comercializadores.map((com) => (
                    <option key={com.id_comercializadores} value={com.id_comercializadores}>
                      {com.rif} — {com.razon_social}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            </CCol>

            {/* Encargado / Persona */}
            <CCol md={6} className="mb-3">
              <CFormLabel>Encargado / Dueño Local</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormSelect
                  name="id_persona"
                  value={formData.id_persona}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione una persona...</option>
                  {personas.map((p) => (
                    <option key={p.id_persona} value={p.id_persona}>
                      {p.ci_rif} — {p.razon_social}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            {/* Dirección */}
            <CCol md={8} className="mb-3">
              <CFormLabel>Dirección del Centro</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilHome} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="direccion"
                  placeholder="Dirección física del centro de apuesta"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </CInputGroup>
            </CCol>

            {/* Estado */}
            <CCol md={4} className="mb-3">
              <CFormLabel>Estado</CFormLabel>
              <CFormSelect
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end mt-3">
            <CButton type="submit" color="primary" size="lg">
              Registrar Centro de Apuesta
            </CButton>
          </div>
        </>
      )}
    </CForm>
  )
}

export default CentrosApuestaForm
