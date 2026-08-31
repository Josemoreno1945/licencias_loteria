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
  CBadge,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilClipboard,
  cilCalendar,
  cilList,
  cilPlus,
  cilDollar,
  cilUser,
  cilNotes,
  cilHome,
  cilDescription,
} from '@coreui/icons'

// ── Sub-componentes de UI ─────────────────────────────────────────────────────
const Separator = () => <hr className="my-4 border-primary opacity-25" />

const SectionTitle = ({ step, title }) => (
  <h6 className="text-primary fw-semibold mb-3 mt-1" style={{ letterSpacing: '0.04em' }}>
    {step}. {title}
  </h6>
)

const InfoCard = ({ titulo, campos, children }) => (
  <CCard className="border-start border-start-3 border-start-info mb-3">
    <CCardBody className="py-3 px-3">
      <p className="text-info fw-semibold small mb-2" style={{ letterSpacing: '0.05em' }}>
        {titulo}
      </p>
      {campos && (
        <CRow className="gy-1 mb-2">
          {campos.map(({ label, value }) => (
            <CCol key={label} md={6}>
              <span className="text-muted small">{label}: </span>
              <span className="small fw-semibold">{value || '—'}</span>
            </CCol>
          ))}
        </CRow>
      )}
      {children}
    </CCardBody>
  </CCard>
)

// ── Componente principal ──────────────────────────────────────────────────────
const ParticipacionesForm = ({
  formData,
  handleInputChange,
  onSubmit,
  solicitudes,
  solicitudSeleccionada,
  loadingDeps,
  loadingDetalleSolicitud,
  bancos,
  isEditMode,
}) => {
  const calcularVencimiento = (fechaExpedicion) => {
    if (!fechaExpedicion) return ''
    const d = new Date(fechaExpedicion)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }

  const vencimientoValue = formData.fecha_vencimiento || calcularVencimiento(formData.fecha_expedicion)

  const juegosReferencia = (() => {
    if (!solicitudSeleccionada?.juegos) return []
    if (Array.isArray(solicitudSeleccionada.juegos)) return solicitudSeleccionada.juegos
    try { return JSON.parse(solicitudSeleccionada.juegos) } catch { return [] }
  })()

  return (
    <CForm onSubmit={onSubmit}>

      {/* ═══ PASO 1 — SOLICITUD DE ORIGEN ═══ */}
      <SectionTitle step="1" title="Solicitud de Origen" />

      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel>
            Solicitud Pendiente
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="id_solicitud"
              value={formData.id_solicitud}
              onChange={handleInputChange}
              required
              disabled={loadingDeps || isEditMode}
            >
              <option value="">Seleccione una solicitud...</option>
              {solicitudes.map((sol) => (
                <option key={sol.id_solicitudes} value={sol.id_solicitudes}>
                  {sol.comercializador
                    ? `${sol.comercializador}${sol.persona ? ` — ${sol.persona}` : ''}`
                    : sol.persona || sol.id_solicitudes}
                </option>
              ))}
            </CFormSelect>
            {(loadingDeps || loadingDetalleSolicitud) && (
              <CInputGroupText><CSpinner size="sm" /></CInputGroupText>
            )}
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Panel autocompletado */}
      {!loadingDetalleSolicitud && solicitudSeleccionada && (
        <>
          <InfoCard
            titulo="📋 Comercializadora"
            campos={[
              { label: 'Razón Social', value: solicitudSeleccionada.comercializador },
              { label: 'RIF', value: solicitudSeleccionada.comercializador_rif },
              { label: 'Dirección', value: solicitudSeleccionada.comercializador_direccion },
              { label: 'Teléfono', value: solicitudSeleccionada.comercializador_telefono },
              { label: 'Email', value: solicitudSeleccionada.comercializador_email },
            ]}
          >
            {solicitudSeleccionada.tipo_participacion && (
              <div className="mt-2 pt-2 border-top">
                <p className="text-info fw-semibold small mb-1" style={{ letterSpacing: '0.05em' }}>
                  🗂️ Tipo de Participación
                </p>
                <CBadge color="primary" shape="rounded-pill" className="px-3 py-1">
                  {solicitudSeleccionada.tipo_participacion}
                </CBadge>
              </div>
            )}
            <div className="mt-3 pt-2 border-top">
              <p className="text-info fw-semibold small mb-2" style={{ letterSpacing: '0.05em' }}>
                👤 Representante Legal
              </p>
              <CRow className="gy-1">
                <CCol md={4}>
                  <span className="text-muted small">Cédula / RIF: </span>
                  <span className="small fw-semibold">{solicitudSeleccionada.ci_rif || '—'}</span>
                </CCol>
                <CCol md={4}>
                  <span className="text-muted small">Nombre: </span>
                  <span className="small fw-semibold">{solicitudSeleccionada.persona || '—'}</span>
                </CCol>
                <CCol md={4}>
                  <span className="text-muted small">Tipo: </span>
                  <span className="small fw-semibold">{solicitudSeleccionada.tipo_persona || '—'}</span>
                </CCol>
              </CRow>
            </div>
          </InfoCard>

          {solicitudSeleccionada.centro_apuesta && (
            <InfoCard
              titulo="🏢 Centro de Apuesta"
              campos={[
                { label: 'Agencia', value: solicitudSeleccionada.centro_apuesta },
                { label: 'Dirección', value: solicitudSeleccionada.centro_apuesta_direccion },
              ]}
            >
              {solicitudSeleccionada.centro_apuesta_representante && (
                <div className="mt-3 pt-2 border-top">
                  <p className="text-info fw-semibold small mb-2" style={{ letterSpacing: '0.05em' }}>
                    👤 Dueño / Representante
                  </p>
                  <CRow className="gy-1">
                    <CCol md={6}>
                      <span className="text-muted small">Cédula / RIF: </span>
                      <span className="small fw-semibold">{solicitudSeleccionada.centro_apuesta_representante_ci || '—'}</span>
                    </CCol>
                    <CCol md={6}>
                      <span className="text-muted small">Nombre: </span>
                      <span className="small fw-semibold">{solicitudSeleccionada.centro_apuesta_representante || '—'}</span>
                    </CCol>
                  </CRow>
                </div>
              )}
            </InfoCard>
          )}

          {juegosReferencia.length > 0 && (
            <InfoCard titulo="🎮 Juegos Autorizados">
              <div className="d-flex flex-wrap gap-1 mt-1">
                {juegosReferencia.map((j) => (
                  <CBadge key={j.id_juego} color="info" shape="rounded-pill" className="px-2 py-1 small">
                    {j.nombre}
                  </CBadge>
                ))}
              </div>
            </InfoCard>
          )}
        </>
      )}

      <Separator />

      {/* ═══ PASO 2 — DATOS DEL DOCUMENTO ═══ */}
      <SectionTitle step="2" title="Datos del Documento" />

      {/* Fila 1: Licencia/Autorización + Territorio */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Licencia o Autorización</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="licencia_autorizacion"
              value={formData.licencia_autorizacion || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Licencia">Licencia</option>
              <option value="Autorizacion Especial">Autorización Especial</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel>Territorio</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="territorio"
              value={formData.territorio || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="Nacional">Nacional</option>
              <option value="Estadal">Estadal</option>
              <option value="Municipal">Municipal</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 2: N° Archivo + N° Documento + Papel de Seguridad */}
      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel>N° de Archivo</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="nro_archivo"
              value={formData.nro_archivo || ''}
              onChange={handleInputChange}
              placeholder="Ej: ARC-000123"
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={4}>
          <CFormLabel>N° de Documento</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="numero_documento"
              value={formData.numero_documento}
              onChange={handleInputChange}
              placeholder="Ej: 06°-P000123-CA-2026"
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={4}>
          <CFormLabel>Papel de Seguridad</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="papel_seguridad"
              value={formData.papel_seguridad}
              onChange={handleInputChange}
              placeholder="Código del papel"
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 3: LOT + Tipo Emisión */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Número LOT</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilDescription} /></CInputGroupText>
            <CFormInput
              name="numero_lot"
              value={formData.numero_lot || ''}
              onChange={handleInputChange}
              placeholder="Ej: LOT-000123"
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel>Tipo de Emisión</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="tipo_emision"
              value={formData.tipo_emision}
              onChange={handleInputChange}
            >
              <option value="Inscripcion">Inscripción</option>
              <option value="Renovacion">Renovación</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 4: Fecha Expedición + Fecha Vencimiento */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Fecha de Expedición</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
            <CFormInput
              name="fecha_expedicion"
              type="date"
              value={formData.fecha_expedicion}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel>Fecha de Vencimiento</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
            <CFormInput
              name="fecha_vencimiento"
              type="date"
              value={vencimientoValue}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 5: Dirección del Establecimiento */}
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel>Dirección del Establecimiento</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilHome} /></CInputGroupText>
            <CFormInput
              name="direccion_establecimiento"
              value={formData.direccion_establecimiento || ''}
              onChange={handleInputChange}
              placeholder="Dirección fiscal del establecimiento"
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 6: Observaciones */}
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel>Observaciones <span className="text-muted small fw-normal">(Opcional)</span></CFormLabel>
          <CFormTextarea
            name="detalles_extra"
            value={formData.detalles_extra || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Anotaciones adicionales sobre el documento..."
          />
        </CCol>
      </CRow>

      <Separator />

      {/* ═══ PASO 3 — DATOS DEL PAGO ═══ */}
      <SectionTitle step="3" title="Datos del Pago" />

      {/* Fila 1: Banco + Referencia */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Banco</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
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

        <CCol md={6}>
          <CFormLabel>N° de Referencia</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="num_referencia"
              value={formData.num_referencia || ''}
              onChange={handleInputChange}
              placeholder="Referencia bancaria"
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 2: Monto + Tasa + Fecha de Pago */}
      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel>Monto (Bs.)</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilDollar} /></CInputGroupText>
            <CFormInput
              name="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={4}>
          <CFormLabel>Tasa del Día</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilDollar} /></CInputGroupText>
            <CFormInput
              name="tasa_dia"
              type="number"
              step="0.0001"
              min="0"
              value={formData.tasa_dia || ''}
              onChange={handleInputChange}
              placeholder="Tasa BCV"
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={4}>
          <CFormLabel>Fecha de Pago</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
            <CFormInput
              name="fecha_pago"
              type="date"
              value={formData.fecha_pago || ''}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 3: Responsable + Observaciones de Pago */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Responsable <span className="text-muted small fw-normal">(Opcional)</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
            <CFormInput
              name="responsable_texto"
              value={formData.responsable_texto || ''}
              onChange={handleInputChange}
              placeholder="Nombre del responsable"
            />
          </CInputGroup>
        </CCol>
        <CCol md={6}>
          <CFormLabel>Observaciones del Pago <span className="text-muted small fw-normal">(Opcional)</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilNotes} /></CInputGroupText>
            <CFormInput
              name="observaciones_pago"
              value={formData.observaciones_pago || ''}
              onChange={handleInputChange}
              placeholder="Notas sobre el pago"
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-4">
        <CButton type="submit" color="primary" disabled={loadingDeps} size="lg">
          <CIcon icon={cilPlus} className="me-2" />
          {isEditMode ? 'Actualizar Participación' : 'Emitir Participación'}
        </CButton>
      </div>

    </CForm>
  )
}

export default ParticipacionesForm
