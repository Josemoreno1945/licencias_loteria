import React from 'react'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBank, cilMoney, cilCalendar, cilUser, cilCheckCircle } from '@coreui/icons'

const PagosForm = ({ formData, handleInputChange, bancos, licencias, loadingDeps, onSubmit }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Banco</CFormLabel>
          <CFormSelect
            name="id_banco"
            value={formData.id_banco}
            onChange={handleInputChange}
            required
            disabled={loadingDeps || bancos.length === 0}
          >
            <option value="">Seleccione un banco...</option>
            {bancos.map((banco) => (
              <option key={banco.id_banco} value={banco.id_banco}>
                {banco.nombre} {banco.codigo ? `(${banco.codigo})` : ''}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Licencia</CFormLabel>
          <CFormSelect
            name="id_licencia"
            value={formData.id_licencia}
            onChange={handleInputChange}
            required
            disabled={loadingDeps || licencias.length === 0}
          >
            <option value="">Seleccione una licencia...</option>
            {licencias.map((licencia) => (
              <option key={licencia.id_documento} value={licencia.id_documento}>
                {licencia.numero_documento} — {licencia.persona}
              </option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4} className="mb-3">
          <CFormLabel>Número de Referencia</CFormLabel>
          <CFormInput name="num_referencia" value={formData.num_referencia} onChange={handleInputChange} required />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Pago</CFormLabel>
          <CFormInput name="fecha_pago" type="date" value={formData.fecha_pago} onChange={handleInputChange} required />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Monto</CFormLabel>
          <CFormInput name="monto" type="number" step="0.01" value={formData.monto} onChange={handleInputChange} required />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4} className="mb-3">
          <CFormLabel>Tasa del Día</CFormLabel>
          <CFormInput name="tasa_dia" type="number" step="0.0001" value={formData.tasa_dia} onChange={handleInputChange} required />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Responsable</CFormLabel>
          <CFormInput name="responsable_texto" value={formData.responsable_texto} onChange={handleInputChange} />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Observaciones</CFormLabel>
          <CFormTextarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows={3} />
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end">
        <CButton
          type="submit"
          color="primary"
          disabled={loadingDeps || bancos.length === 0 || licencias.length === 0}
        >
          <CIcon icon={cilCheckCircle} className="me-2" /> Registrar Pago
        </CButton>
      </div>
    </CForm>
  )
}

export default PagosForm
