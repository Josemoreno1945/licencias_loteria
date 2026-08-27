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
  cilDescription,
  cilBuilding,
  cilLocationPin,

} from '@coreui/icons'

// ── Sub-componentes de UI (calco exacto de Licencias / Participaciones) ─────────
const Separator = () => <hr className="my-4 border-primary opacity-25" />

// Tarjeta de información de solo lectura (datos heredados de la solicitud)
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
const AutorizacionesForm = ({
  formData,
  handleInputChange,
  onSubmit,
  solicitudes,
  solicitudSeleccionada,
  loadingDeps,
  loadingDetalleSolicitud,
  bancos,
  documentosAnteriores,
  loadingDocs,
  isEditMode,
}) => {

  // Autocalcula fecha de vencimiento: +1 año desde expedición
  const calcularVencimiento = (fechaExpedicion) => {
    if (!fechaExpedicion) return ''
    const d = new Date(fechaExpedicion)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }

  // Si el usuario NO ha tocado vencimiento, usamos el calculado
  const vencimientoValue = formData.fecha_vencimiento || calcularVencimiento(formData.fecha_expedicion)

  // Tipo de autorización actual del documento (heredado de la solicitud, editable en el Paso 2)
  const tipoActual = formData.tipo || solicitudSeleccionada?.tipo_autorizacion_especial || 'Mesa'

  return (
    <CForm onSubmit={onSubmit}>

      {/* ═══════════════════════════════════════════════════════════════
           PASO 1 — SOLICITUD DE ORIGEN
         ═══════════════════════════════════════════════════════════════ */}

      <h6 className="text-primary fw-semibold mb-3 mt-1" style={{ letterSpacing: '0.04em' }}>
        1. Solicitud de Origen
      </h6>

      <CRow className="mb-3">
        <CCol md={12} className="mb-3">
          <CFormLabel>
            Solicitud Pendiente <span className="text-danger">*</span>
            <span className="text-muted small ms-2">(Solo aparecen solicitudes de tipo Autorización Especial pendientes)</span>
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
              <option value="">Seleccione la solicitud pendiente...</option>
              {solicitudes.map((sol) => (
                <option key={sol.id_solicitudes} value={sol.id_solicitudes}>
                  {sol.comercializador
                    ? `${sol.comercializador}${sol.persona ? ` — ${sol.persona}` : ''}`
                    : sol.persona || sol.id_solicitudes}
                  {sol.tipo_autorizacion_especial ? ` [${sol.tipo_autorizacion_especial}]` : ''}
                </option>
              ))}
            </CFormSelect>
            {(loadingDeps || loadingDetalleSolicitud) && (
              <CInputGroupText><CSpinner size="sm" /></CInputGroupText>
            )}
          </CInputGroup>
        </CCol>
      </CRow>

      {/* ── Panel autocompletado: datos heredados de la solicitud (solo lectura) ── */}
      {!loadingDetalleSolicitud && solicitudSeleccionada && (
        <>
          {/* Datos de la Comercializadora + Representante + Tipo de Autorización */}
          <InfoCard
            titulo="📋 Comercializadora"
            campos={[
              { label: 'Razón Social', value: solicitudSeleccionada.comercializador },
              { label: 'RIF', value: solicitudSeleccionada.comercializador_rif },
              { label: 'Dirección Fiscal', value: solicitudSeleccionada.comercializador_direccion },
              { label: 'Teléfono', value: solicitudSeleccionada.comercializador_telefono },
              { label: 'Email', value: solicitudSeleccionada.comercializador_email },
            ]}
          >
            {/* Tipo de Autorización Especial heredado de la solicitud (BLOQUEADO) */}
            {solicitudSeleccionada.tipo_autorizacion_especial && (
              <div className="mt-2 pt-2 border-top">
                <p className="text-info fw-semibold small mb-1" style={{ letterSpacing: '0.05em' }}>
                  🛡️ Tipo de Autorización Especial (heredado de la solicitud)
                </p>
                <CBadge color="primary" shape="rounded-pill" className="px-3 py-1 fs-6">
                  {solicitudSeleccionada.tipo_autorizacion_especial}
                </CBadge>
              </div>
            )}
            <div className="mt-3 pt-2 border-top">
              <p className="text-info fw-semibold small mb-2" style={{ letterSpacing: '0.05em' }}>
                👤 Representante Legal Titular (Firmante)
              </p>
              <CRow className="gy-1 mb-2">
                <CCol md={6}>
                  <span className="text-muted small">Cédula / RIF: </span>
                  <span className="small fw-semibold">{solicitudSeleccionada.ci_rif || '—'}</span>
                </CCol>
                <CCol md={6}>
                  <span className="text-muted small">Nombre / Razón Social: </span>
                  <span className="small fw-semibold">{solicitudSeleccionada.persona || '—'}</span>
                </CCol>
                <CCol md={6}>
                  <span className="text-muted small">Tipo de Persona: </span>
                  <span className="small fw-semibold">{solicitudSeleccionada.tipo_persona || '—'}</span>
                </CCol>
              </CRow>
            </div>
          </InfoCard>

          {/* Centro de Apuesta de la solicitud (heredado / bloqueado) */}
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
                  <CRow className="gy-1 mb-2">
                    <CCol md={6}>
                      <span className="text-muted small">Cédula / RIF: </span>
                      <span className="small fw-semibold">{solicitudSeleccionada.centro_apuesta_representante_ci || '—'}</span>
                    </CCol>
                    <CCol md={6}>
                      <span className="text-muted small">Nombre / Razón Social: </span>
                      <span className="small fw-semibold">{solicitudSeleccionada.centro_apuesta_representante || '—'}</span>
                    </CCol>
                  </CRow>
                </div>
              )}
            </InfoCard>
          )}
        </>
      )}

      <Separator />

      {/* ═══════════════════════════════════════════════════════════════
           PASO 2 — DATOS DEL DOCUMENTO
         ═══════════════════════════════════════════════════════════════ */}

      <h6 className="text-primary fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>
        2. Datos del Documento
      </h6>

      {/* Fila 0: Tipo de Autorización (editable, pre-cargado con el valor heredado) */}
      <CRow className="mb-3">
        <CCol md={4} className="mb-3">
          <CFormLabel>Tipo de Autorización <span className="text-danger">*</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="tipo"
              value={formData.tipo || 'Mesa'}
              onChange={handleInputChange}
              required
            >
              <option value="Movil">Móvil</option>
              <option value="Localidad">Localidad</option>
              <option value="Mesa">Mesa</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 1: N° Documento + Papel de Seguridad */}
      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>N° de Documento <span className="text-danger">*</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="numero_documento"
              value={formData.numero_documento}
              onChange={handleInputChange}
              placeholder="Ej: 06°-AE000123-CA-2026"
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Papel de Seguridad <span className="text-danger">*</span></CFormLabel>
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

      {/* Fila 2: Tipo de Emisión + Fecha Expedición + Fecha Vencimiento */}
      <CRow className="mb-3">
        <CCol md={4} className="mb-3">
          <CFormLabel>Tipo de Emisión <span className="text-danger">*</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="tipo_emision"
              value={formData.tipo_emision}
              onChange={handleInputChange}
            >
              <option value="Inscripcion">Inscripción (nueva)</option>
              <option value="Renovacion">Renovación</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Expedición <span className="text-danger">*</span></CFormLabel>
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

        <CCol md={4} className="mb-3">
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

      {/* Fila 3: Renovación → Documento Anterior */}
      {formData.tipo_emision === 'Renovacion' && (
        <CRow className="mb-3">
          <CCol md={12} className="mb-3">
            <CFormLabel>Documento Anterior <span className="text-danger">*</span></CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
              <CFormSelect
                name="id_documento_anterior"
                value={formData.id_documento_anterior || ''}
                onChange={handleInputChange}
                required
                disabled={loadingDocs}
              >
                <option value="">Seleccione el documento anterior...</option>
                {documentosAnteriores.map((doc) => (
                  <option key={doc.id_documento} value={doc.id_documento}>
                    {doc.numero_documento} — {doc.fecha_expedicion ? new Date(doc.fecha_expedicion).toLocaleDateString() : '—'}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>
        </CRow>
      )}

      {/* Fila 4: Nro de Mesa (visible siempre; aplica solo cuando el tipo es 'Mesa') */}
      <CRow className="mb-3">
        <CCol md={4} className="mb-3">
          <CFormLabel>
            N° de Mesa {tipoActual === 'Mesa' && <span className="text-danger">*</span>}
            <span className="text-muted small ms-2">(Solo aplica para el tipo Mesa)</span>
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="nro_mesa"
              type="number"
              min="1"
              value={formData.nro_mesa || ''}
              onChange={handleInputChange}
              placeholder="Ej: 12"
              disabled={tipoActual !== 'Mesa'}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 5: Agencia Texto + Número LOT */}
      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>Agencia (Texto libre)</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilBuilding} /></CInputGroupText>
            <CFormInput
              name="agencia_texto"
              value={formData.agencia_texto || ''}
              onChange={handleInputChange}
              placeholder="Solo si la agencia no está catalogada"
            />
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
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
      </CRow>

      {/* Fila 6: Dirección del Establecimiento (común) */}
      <CRow className="mb-3">
        <CCol md={12} className="mb-3">
          <CFormLabel>Dirección del Establecimiento</CFormLabel>
          <CFormInput
            name="direccion_establecimiento"
            value={formData.direccion_establecimiento || ''}
            onChange={handleInputChange}
            placeholder="Dirección fiscal del establecimiento"
          />
        </CCol>
      </CRow>

      {/* Fila 7: Direcciones propias de la Autorización Especial */}
      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>Dirección del Centro Asignado</CFormLabel>
          <CFormTextarea
            name="direccion_centro_asignado"
            value={formData.direccion_centro_asignado || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Dirección del centro de apuesta asignado"
          />
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Dirección de la Localidad</CFormLabel>
          <CFormTextarea
            name="direccion_localidad"
            value={formData.direccion_localidad || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Dirección de la localidad (tipo Localidad)"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={12} className="mb-3">
          <CFormLabel>Dirección del Responsable</CFormLabel>
          <CFormTextarea
            name="direccion_responsable"
            value={formData.direccion_responsable || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Dirección del responsable"
          />
        </CCol>
      </CRow>

      {/* Fila 8: Observaciones / Detalles Extra */}
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel>Observaciones del Documento (Opcional)</CFormLabel>
          <CFormTextarea
            name="detalles_extra"
            value={formData.detalles_extra || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Anotaciones adicionales sobre este documento..."
          />
        </CCol>
      </CRow>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════════
           PASO 3 — DATOS DEL PAGO
         ═══════════════════════════════════════════════════════════════ */}

      <h6 className="text-primary fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>
        3. Datos del Pago
      </h6>

      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>Banco <span className="text-danger">*</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="id_banco"
              value={formData.id_banco || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione el banco...</option>
              {bancos.map((banco) => (
                <option key={banco.id_banco} value={banco.id_banco}>
                  {banco.nombre}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>N° de Referencia <span className="text-danger">*</span></CFormLabel>
          <CFormInput
            name="num_referencia"
            value={formData.num_referencia || ''}
            onChange={handleInputChange}
            placeholder="Número de referencia bancaria"
            required
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4} className="mb-3">
          <CFormLabel>Monto (Bs.) <span className="text-danger">*</span></CFormLabel>
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
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Tasa del Día <span className="text-danger">*</span></CFormLabel>
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
        </CCol>

        <CCol md={4} className="mb-3">
          <CFormLabel>Fecha de Pago <span className="text-danger">*</span></CFormLabel>
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

      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>Responsable del Pago (Opcional)</CFormLabel>
          <CFormInput
            name="responsable_texto"
            value={formData.responsable_texto || ''}
            onChange={handleInputChange}
            placeholder="Nombre del responsable"
          />
        </CCol>
        <CCol md={6} className="mb-3">
          <CFormLabel>Observaciones del Pago (Opcional)</CFormLabel>
          <CFormInput
            name="observaciones_pago"
            value={formData.observaciones_pago || ''}
            onChange={handleInputChange}
            placeholder="Notas sobre el pago"
          />
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-4">
        <CButton type="submit" color="primary" disabled={loadingDeps} size="lg">
          <CIcon icon={cilPlus} className="me-2" />
          {isEditMode ? 'Actualizar Autorización' : 'Emitir Autorización'}
        </CButton>
      </div>

    </CForm>
  )
}

export default AutorizacionesForm
