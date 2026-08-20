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
  CCard,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilClipboard, cilList, cilCalendar, cilPlus, cilCreditCard, cilLocationPin } from '@coreui/icons'

const SectionTitle = ({ icon, title }) => (
  <div className="d-flex align-items-center gap-2 mb-3 mt-4">
    <CIcon icon={icon} size="lg" className="text-primary" />
    <h5 className="mb-0 text-primary fw-bold">{title}</h5>
  </div>
)

const Separator = () => (
  <hr className="my-4 border-primary opacity-25" />
)

const AutorizacionesForm = ({
  formData,
  handleInputChange,
  onSubmit,
  solicitudes,
  centrosApuesta,
  loadingDeps,
  bancos,
  isEditMode,
}) => {
  return (
    <CForm onSubmit={onSubmit}>
      {/* ═══════════════════════════════════════════════════════════════
            SECCIÓN 1: DATOS DE LA AUTORIZACIÓN
          ═══════════════════════════════════════════════════════════════ */}

      <SectionTitle icon={cilClipboard} title="Datos de la Autorización" />

      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Solicitud de Autorización</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilList} />
            </CInputGroupText>
            <CFormSelect
              name="id_solicitud"
              value={formData.id_solicitud}
              onChange={handleInputChange}
              required
              disabled={loadingDeps || isEditMode}
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
          <CFormLabel>Número de Mesa</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilClipboard} />
            </CInputGroupText>
            <CFormInput
              name="nro_mesa"
              type="number"
              min="1"
              value={formData.nro_mesa || ''}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Número de Documento</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilClipboard} />
            </CInputGroupText>
            <CFormInput
              name="numero_documento"
              value={formData.numero_documento || ''}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Papel de Seguridad</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilClipboard} />
            </CInputGroupText>
            <CFormInput
              name="papel_seguridad"
              value={formData.papel_seguridad || ''}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4} className="mb-3">
          <CFormLabel>Tipo de Emisión</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilList} />
            </CInputGroupText>
            <CFormSelect
              name="tipo_emision"
              value={formData.tipo_emision || 'Inscripcion'}
              onChange={handleInputChange}
              disabled={loadingDeps || isEditMode}
            >
              <option value="Inscripcion">Inscripción</option>
              <option value="Renovacion">Renovación</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Expedición</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilCalendar} />
            </CInputGroupText>
            <CFormInput
              name="fecha_expedicion"
              type="date"
              value={formData.fecha_expedicion || ''}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Vencimiento</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilCalendar} />
            </CInputGroupText>
            <CFormInput
              name="fecha_vencimiento"
              type="date"
              value={formData.fecha_vencimiento || ''}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Centro de Apuesta (Opcional)</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilLocationPin} />
            </CInputGroupText>
            <CFormSelect
              name="id_centro"
              value={formData.id_centro || ''}
              onChange={handleInputChange}
              disabled={loadingDeps || isEditMode}
            >
              <option value="">Ninguno / Agencia libre</option>
              {centrosApuesta.map((centro) => (
                <option key={centro.id_centro} value={centro.id_centro}>
                  {centro.nombre_agencia} — {centro.comercializador_razon_social || centro.direccion}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Agencia Texto (Opcional)</CFormLabel>
          <CFormInput
            name="agencia_texto"
            value={formData.agencia_texto || ''}
            onChange={handleInputChange}
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={12} className="mb-3">
          <CFormLabel>Dirección del Establecimiento (Opcional)</CFormLabel>
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
          <CFormLabel>Observaciones / Detalles Extra (Opcional)</CFormLabel>
          <CFormTextarea
            name="detalles_extra"
            value={formData.detalles_extra || ''}
            onChange={handleInputChange}
            rows={3}
          />
        </CCol>
      </CRow>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════════
            SECCIÓN 2: DATOS DEL PAGO
          ═══════════════════════════════════════════════════════════════ */}

      <SectionTitle icon={cilCreditCard} title="Datos del Pago" />

      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Banco</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilList} />
            </CInputGroupText>
            <CFormSelect
              name="id_banco"
              value={formData.id_banco || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un banco...</option>
              {bancos.map((banco) => (
                <option key={banco.id_banco} value={banco.id_banco}>
                  {banco.nombre}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Número de Referencia</CFormLabel>
          <CFormInput
            name="num_referencia"
            value={formData.num_referencia || ''}
            onChange={handleInputChange}
            required
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4} className="mb-3">
          <CFormLabel>Monto</CFormLabel>
          <CFormInput
            name="monto"
            type="number"
            step="0.01"
            value={formData.monto || ''}
            onChange={handleInputChange}
            required
          />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Tasa del Día</CFormLabel>
          <CFormInput
            name="tasa_dia"
            type="number"
            step="0.0001"
            value={formData.tasa_dia || ''}
            onChange={handleInputChange}
            required
          />
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Pago</CFormLabel>
          <CFormInput
            name="fecha_pago"
            type="date"
            value={formData.fecha_pago || ''}
            onChange={handleInputChange}
            required
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={6} className="mb-3">
          <CFormLabel>Responsable (Opcional)</CFormLabel>
          <CFormInput
            name="responsable_texto"
            value={formData.responsable_texto || ''}
            onChange={handleInputChange}
          />
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Observaciones del Pago (Opcional)</CFormLabel>
          <CFormInput
            name="observaciones_pago"
            value={formData.observaciones_pago || ''}
            onChange={handleInputChange}
          />
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-4">
        <CButton type="submit" color="primary" disabled={loadingDeps} size="lg">
          <CIcon icon={cilPlus} className="me-2" /> {isEditMode ? 'Actualizar Autorización' : 'Emitir Autorización'}
        </CButton>
      </div>
    </CForm>
  )
}

export default AutorizacionesForm
