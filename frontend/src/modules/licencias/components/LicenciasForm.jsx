import React from 'react'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CFormTextarea,
  CFormSwitch,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilClipboard, cilGamepad, cilCalendar, cilList, cilPlus } from '@coreui/icons'

const LicenciasForm = ({
  formData,
  handleInputChange,
  onSubmit,
  solicitudes,
  juegos,
  loadingDeps,
}) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Solicitud de Licencia</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilList} />
            </CInputGroupText>
            <CFormSelect
              name="id_solicitud"
              value={formData.id_solicitud}
              onChange={handleInputChange}
              required
              disabled={loadingDeps}
            >
              <option value="">Seleccione una solicitud...</option>
              {solicitudes.map((solicitud) => (
                <option key={solicitud.id_solicitudes} value={solicitud.id_solicitudes}>
                  {solicitud.id_solicitudes.slice(0, 8)}... — {solicitud.persona} — {solicitud.estado}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Juego Autorizado (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilGamepad} />
            </CInputGroupText>
            <CFormSelect
              name="juegos"
              value={formData.juegos || ''}
              onChange={handleInputChange}
              disabled={loadingDeps || juegos.length === 0}
            >
              <option value="">Seleccione un juego...</option>
              {juegos.map((juego) => (
                <option key={juego.id_juego} value={juego.id_juego}>
                  {juego.nombre} — {juego.operadora_razon_social ?? juego.razon_social}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Número de Documento</CFormLabel>
          <CFormInput
            name="numero_documento"
            value={formData.numero_documento}
            onChange={handleInputChange}
            required
          />
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Papel de Seguridad</CFormLabel>
          <CFormInput
            name="papel_seguridad"
            value={formData.papel_seguridad}
            onChange={handleInputChange}
            required
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4} className="mb-3">
          <CFormLabel>Tipo de Emisión</CFormLabel>
          <CFormSelect
            name="tipo_emision"
            value={formData.tipo_emision}
            onChange={handleInputChange}
          >
            <option value="Inscripcion">Inscripción</option>
            <option value="Renovacion">Renovación</option>
          </CFormSelect>
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Expedición</CFormLabel>
          <CFormInput
            name="fecha_expedicion"
            type="date"
            value={formData.fecha_expedicion}
            onChange={handleInputChange}
            required
          />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Emisión</CFormLabel>
          <CFormInput
            name="fecha_emision"
            type="date"
            value={formData.fecha_emision}
            onChange={handleInputChange}
            required
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Vencimiento</CFormLabel>
          <CFormInput
            name="fecha_vencimiento"
            type="date"
            value={formData.fecha_vencimiento}
            onChange={handleInputChange}
          />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Entrega</CFormLabel>
          <CFormInput
            name="fecha_entrega"
            type="date"
            value={formData.fecha_entrega}
            onChange={handleInputChange}
          />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Número LOT (Opcional)</CFormLabel>
          <CFormInput
            name="numero_lot"
            value={formData.numero_lot}
            onChange={handleInputChange}
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={12} className="mb-3">
          <CFormLabel>Dirección del Establecimiento</CFormLabel>
          <CFormTextarea
            name="direccion_establecimiento"
            value={formData.direccion_establecimiento || ''}
            onChange={handleInputChange}
            rows={3}
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={12} className="mb-3">
          <CFormLabel>Observaciones / Detalles Extra</CFormLabel>
          <CFormTextarea
            name="detalles_extra"
            value={formData.detalles_extra || ''}
            onChange={handleInputChange}
            rows={3}
          />
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end">
        <CButton type="submit" color="primary" disabled={loadingDeps}>
          <CIcon icon={cilPlus} className="me-2" /> Emitir Licencia
        </CButton>
      </div>
    </CForm>
  )
}

export default LicenciasForm
