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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilAddressBook,
  cilBuilding,
  cilPhone,
  cilEnvelopeClosed,
  cilHome,
} from '@coreui/icons'

const ComercializadoresForm = ({ formData, handleInputChange, onSubmit }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        {/* RIF */}
        <CCol md={6} className="mb-3">
          <CFormLabel>RIF</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilAddressBook} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="rif"
              placeholder="Ej: J-12345678-9"
              value={formData.rif}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        {/* Estado */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Estado</CFormLabel>
          <CInputGroup>
            <CFormSelect
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              required
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Razón Social */}
        <CCol md={12} className="mb-3">
          <CFormLabel>Razón Social</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBuilding} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="razon_social"
              placeholder="Nombre de la empresa comercializadora"
              value={formData.razon_social}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Dirección Fiscal */}
        <CCol md={12} className="mb-3">
          <CFormLabel>Dirección Fiscal (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilHome} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="direccion_fiscal"
              placeholder="Dirección fiscal completa"
              value={formData.direccion_fiscal}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Teléfono */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Teléfono (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilPhone} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="telefono"
              placeholder="Ej: 0414-1234567"
              value={formData.telefono}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>

        {/* Email */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Correo Electrónico (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilEnvelopeClosed} />
            </CInputGroupText>
            <CFormInput
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-3">
        <CButton type="submit" color="primary" size="lg">
          Registrar Comercializador
        </CButton>
      </div>
    </CForm>
  )
}

export default ComercializadoresForm
