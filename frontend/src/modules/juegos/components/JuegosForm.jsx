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
  cilBuilding,
} from '@coreui/icons';
import axiosInstance from '../../../api/axiosInstance';

const JuegosForm = ({ formData, handleInputChange, onSubmit }) => {
  const [operadoras, setOperadoras] = useState([]);
  const [loadingOps, setLoadingOps] = useState(false);

  useEffect(() => {
    const fetchOperadoras = async () => {
      setLoadingOps(true);
      try {
        const res = await axiosInstance.get('/operadoras/activas');
        setOperadoras(res.data || []);
      } catch (error) {
        console.error("Error al cargar operadoras:", error);
      } finally {
        setLoadingOps(false);
      }
    };
    fetchOperadoras();
  }, []);

  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        {/* Operadora */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Operadora (Propietaria del Juego)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBuilding} />
            </CInputGroupText>
            <CFormSelect
              name="id_operadora"
              value={formData.id_operadora}
              onChange={handleInputChange}
              required
              disabled={loadingOps}
            >
              <option value="">Seleccione una operadora...</option>
              {operadoras.map((op) => (
                <option key={op.id_operadora} value={op.id_operadora}>
                  {op.rif} — {op.razon_social}
                </option>
              ))}
            </CFormSelect>
            {loadingOps && <CInputGroupText><CSpinner size="sm" /></CInputGroupText>}
          </CInputGroup>
        </CCol>

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
          Registrar Juego
        </CButton>
      </div>
    </CForm>
  );
};

export default JuegosForm;
