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
  CFormTextarea,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilUser,
  cilDescription,
  cilBuilding,
  cilBriefcase,
  cilNotes,
} from '@coreui/icons';
import axiosInstance from '../../../api/axiosInstance';
import { useAuth } from '../../auth/store/AuthContext';

const SolicitudesForm = ({ formData, handleInputChange, onSubmit }) => {
  const { user } = useAuth();
  
  const [personas, setPersonas] = useState([]);
  const [comercializadores, setComercializadores] = useState([]);
  const [operadoras, setOperadoras] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      setLoadingDeps(true);
      try {
        const [resPersonas, resComer, resOp] = await Promise.all([
          axiosInstance.get('/personas'),
          axiosInstance.get('/comercializadores'),
          axiosInstance.get('/operadoras/activas')
        ]);
        setPersonas(resPersonas.data || []);
        setComercializadores(resComer.data || []);
        setOperadoras(resOp.data || []);
      } catch (error) {
        console.error("Error al cargar dependencias de solicitudes:", error);
      } finally {
        setLoadingDeps(false);
      }
    };
    fetchDependencies();
  }, []);

  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        {/* Persona (Solicitante) */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Persona (Solicitante)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormSelect
              name="id_persona"
              value={formData.id_persona}
              onChange={handleInputChange}
              required
              disabled={loadingDeps}
            >
              <option value="">Seleccione...</option>
              {personas.map((p) => (
                <option key={p.id_persona} value={p.id_persona}>
                  {p.ci_rif} — {p.razon_social}
                </option>
              ))}
            </CFormSelect>
            {loadingDeps && <CInputGroupText><CSpinner size="sm" /></CInputGroupText>}
          </CInputGroup>
        </CCol>

        {/* Tipo de Trámite */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Tipo de Trámite</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilDescription} />
            </CInputGroupText>
            <CFormSelect
              name="tipo_tramite"
              value={formData.tipo_tramite}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Licencia">Licencia</option>
              <option value="Participacion">Participación</option>
              <option value="Autorizacion_especial">Autorización Especial</option>
              <option value="Otro">Otro</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Categoría de Licencia (Solo si el trámite es Licencia) */}
        {formData.tipo_tramite === 'Licencia' && (
          <CCol md={6} className="mb-3">
            <CFormLabel>Categoría de Licencia</CFormLabel>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilBriefcase} />
              </CInputGroupText>
              <CFormSelect
                name="categoria_licencia"
                value={formData.categoria_licencia || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Operador">Operador</option>
                <option value="Comercializador">Comercializador</option>
                <option value="Centro_de_apuesta">Centro de Apuesta</option>
                <option value="Responsable_de_programa_informatico">Responsable de Prog. Informático</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>
        )}

        {/* Comercializador vinculado (Opcional) */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Comercializador Vinculado (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBuilding} />
            </CInputGroupText>
            <CFormSelect
              name="id_comercializador"
              value={formData.id_comercializador || ''}
              onChange={handleInputChange}
              disabled={loadingDeps}
            >
              <option value="">Ninguno...</option>
              {comercializadores.map((c) => (
                <option key={c.id_comercializadores} value={c.id_comercializadores}>
                  {c.rif} — {c.razon_social}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>

        {/* Operadora vinculada (Opcional) */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Operadora Vinculada (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilBuilding} />
            </CInputGroupText>
            <CFormSelect
              name="id_operadora"
              value={formData.id_operadora || ''}
              onChange={handleInputChange}
              disabled={loadingDeps}
            >
              <option value="">Ninguna...</option>
              {operadoras.map((op) => (
                <option key={op.id_operadora} value={op.id_operadora}>
                  {op.rif} — {op.razon_social}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Descripción del Trámite */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Descripción del Trámite</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilNotes} />
            </CInputGroupText>
            <CFormTextarea
              name="descripcion_tramite"
              rows={3}
              placeholder="Detalle breve del trámite..."
              value={formData.descripcion_tramite || ''}
              onChange={handleInputChange}
            ></CFormTextarea>
          </CInputGroup>
        </CCol>

        {/* Observaciones */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Observaciones</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilNotes} />
            </CInputGroupText>
            <CFormTextarea
              name="observaciones"
              rows={3}
              placeholder="Anotaciones internas o adicionales..."
              value={formData.observaciones || ''}
              onChange={handleInputChange}
            ></CFormTextarea>
          </CInputGroup>
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-3">
        <CButton type="submit" color="primary" size="lg">
          Registrar Solicitud
        </CButton>
      </div>
    </CForm>
  );
};

export default SolicitudesForm;
