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
import { cilBank, cilCode } from '@coreui/icons'

const BancosForm = ({ formData, handleInputChange, onSubmit, isEditMode }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        {/* Nombre del Banco */}
        <CCol md={8} className="mb-3">
          <CFormLabel>Nombre del Banco</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBank} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="nombre"
              placeholder="Ej: Banco de Venezuela"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        {/* Codigo BCV */}
        <CCol md={4} className="mb-3">
          <CFormLabel>Codigo BCV</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilCode} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="codigo"
              placeholder="Ej: 0102"
              value={formData.codigo}
              onChange={handleInputChange}
              maxLength={10}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Estado */}
        <CCol md={4} className="mb-3">
          <CFormLabel>Estado</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBank} />
            </CInputGroupText>
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

      <div className="d-flex justify-content-end mt-3">
        <CButton type="submit" color="primary" size="lg">
          {isEditMode ? 'Guardar cambios' : 'Registrar Banco'}
        </CButton>
      </div>
    </CForm>
  )
}

export default BancosForm
