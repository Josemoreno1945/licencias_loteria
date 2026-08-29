import React from 'react';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilUser,
  cilAddressBook,
  cilBuilding,
  cilPhone,
  cilEnvelopeClosed,
} from '@coreui/icons';

const PersonasForm = ({ formData, handleInputChange, onSubmit, isEditMode }) => {
  return (
    <CForm onSubmit={onSubmit}>
      {/* Datos de identificación */}
      <CRow className="mb-3 g-3">
        <CCol md={6} className="mb-0">
          <CFormLabel>Tipo de Persona</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormSelect
              name="tipo_persona"
              value={formData.tipo_persona}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="natural">Natural</option>
              <option value="juridica">Jurídica</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-0">
          <CFormLabel>
            {formData.tipo_persona === 'juridica' ? 'RIF' : 'Cédula de Identidad'}
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilAddressBook} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="ci_rif"
              placeholder={formData.tipo_persona === 'juridica' ? 'Ej: J-12345678-9' : 'Ej: V-12345678'}
              value={formData.ci_rif}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Nombres / Razón Social */}
      <CRow className="mb-3 g-3">
        <CCol md={12} className="mb-0">
          <CFormLabel>
            {formData.tipo_persona === 'juridica' ? 'Razón Social' : 'Nombre Completo'}
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBuilding} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="razon_social"
              placeholder={formData.tipo_persona === 'juridica' ? 'Nombre de la empresa' : 'Nombres y Apellidos'}
              value={formData.razon_social}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Datos de contacto */}
      <CRow className="mb-3 g-3">
        <CCol md={6} className="mb-0">
          <CFormLabel>Teléfono</CFormLabel>
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

        <CCol md={6} className="mb-0">
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

      {/* Dirección Fiscal */}
      <CRow className="mb-3 g-3">
        <CCol md={12} className="mb-0">
          <CFormLabel>Dirección Fiscal</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBuilding} />
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

      <div className="d-flex justify-content-end mt-3">
        <CButton type="submit" color="primary" size="lg">
          {isEditMode ? 'Guardar cambios' : 'Registrar Persona'}
        </CButton>
      </div>
    </CForm>
  );
};

export default PersonasForm;
