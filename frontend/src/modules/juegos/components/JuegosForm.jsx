import React, { useEffect, useState } from 'react';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilGamepad,
} from '@coreui/icons';
import axiosInstance from '../../../api/axiosInstance';

const JuegosForm = ({ formData, handleInputChange, onSubmit, isEditMode }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        {/* Nombre del Juego */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Nombre del Juego</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilGamepad} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="nombre"
              placeholder="Ej: Triple A"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-3">
        <CButton type="submit" color="primary" size="lg">
          {isEditMode ? 'Guardar cambios' : 'Registrar Juego'}
        </CButton>
      </div>
    </CForm>
  );
};

export default JuegosForm;
