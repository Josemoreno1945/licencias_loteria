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
  cilBuilding,
  cilSave,
} from '@coreui/icons'

// ── Sub-componentes de UI ─────────────────────────────────────────────────────
const Separator = () => <hr className="form-separator" />

const SectionTitle = ({ title }) => (
  <p className="form-section-title">{title}</p>
)

const InfoCard = ({ titulo, campos, children }) => (
  <div className="info-card mb-3">
    <p className="info-card-title">{titulo}</p>
    {campos && (
      <CRow className="gy-1 mb-2">
        {campos.map(({ label, value }) => (
          <CCol key={label} md={6}>
            <span className="info-card-field">
              <span className="label">{label}: </span>
              <span className="value">{value || '—'}</span>
            </span>
          </CCol>
        ))}
      </CRow>
    )}
    {children}
  </div>
)

// ── Componente principal ──────────────────────────────────────────────────────
const AutorizacionesForm = ({
  formData,
  handleInputChange,
  onSubmit,
  onCancel,
  solicitudes,
  solicitudSeleccionada,
  loadingDeps,
  loadingDetalleSolicitud,
  bancos,
  documentosAnteriores,
  loadingDocs,
  isEditMode,
}) => {
  const calcularVencimiento = (fechaExpedicion) => {
    if (!fechaExpedicion) return ''
    const d = new Date(fechaExpedicion)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }

  const vencimientoValue = formData.fecha_vencimiento || calcularVencimiento(formData.fecha_expedicion)
  const tipoActual = solicitudSeleccionada?.tipo_autorizacion_especial || formData.tipo || 'Mesa'

  const juegosReferencia = (() => {
    if (!solicitudSeleccionada?.juegos) return []
    if (Array.isArray(solicitudSeleccionada.juegos))
      return solicitudSeleccionada.juegos
    try {
      return JSON.parse(solicitudSeleccionada.juegos)
    } catch {
      return []
    }
  })()

  const representantesList = (() => {
    if (!solicitudSeleccionada?.representantes) return []
    if (Array.isArray(solicitudSeleccionada.representantes))
      return solicitudSeleccionada.representantes
    try {
      return JSON.parse(solicitudSeleccionada.representantes)
    } catch {
      return []
    }
  })()

  return (
    <CForm onSubmit={onSubmit}>

      {/* ═══ SOLICITUD DE ORIGEN ═══ */}
      <SectionTitle title="Solicitud de Origen" />

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
              {solicitudes?.map((sol) => (
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
            {solicitudSeleccionada.tipo_autorizacion_especial && (
              <div className="mt-2 pt-2 border-top">
                <p className="info-card-title">🛡️ Tipo de Autorización</p>
                <CBadge color="primary" shape="rounded-pill" className="px-3 py-1">
                  {solicitudSeleccionada.tipo_autorizacion_especial}
                </CBadge>
              </div>
            )}
            <div className="mt-3 pt-2 border-top">
              <p className="info-card-title">👤 Representante Legal</p>
              {representantesList.length > 0 ? (
                <CRow className="gy-1">
                  {representantesList.map((rep, i) => (
                    <React.Fragment key={rep.id_persona || i}>
                      <CCol md={4}>
                        <span className="info-card-field">
                          <span className="label">Cédula / RIF: </span>
                          <span className="value">{rep.ci_rif || '—'}</span>
                        </span>
                      </CCol>
                      <CCol md={4}>
                        <span className="info-card-field">
                          <span className="label">Nombre: </span>
                          <span className="value">{rep.razon_social || '—'}</span>
                        </span>
                      </CCol>
                      <CCol md={4}>
                        <span className="info-card-field">
                          <span className="label">Cargo: </span>
                          <span className="value">{rep.cargo || '—'}</span>
                        </span>
                      </CCol>
                    </React.Fragment>
                  ))}
                </CRow>
              ) : (
                <CRow className="gy-1">
                  <CCol md={4}>
                    <span className="info-card-field">
                      <span className="label">Cédula / RIF: </span>
                      <span className="value">{solicitudSeleccionada.ci_rif || '—'}</span>
                    </span>
                  </CCol>
                  <CCol md={4}>
                    <span className="info-card-field">
                      <span className="label">Nombre: </span>
                      <span className="value">{solicitudSeleccionada.persona || '—'}</span>
                    </span>
                  </CCol>
                  <CCol md={4}>
                    <span className="info-card-field">
                      <span className="label">Tipo: </span>
                      <span className="value">{solicitudSeleccionada.tipo_persona || '—'}</span>
                    </span>
                  </CCol>
                </CRow>
              )}
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
                  <p className="info-card-title">👤 Dueño / Representante</p>
                  <CRow className="gy-1">
                    <CCol md={6}>
                      <span className="info-card-field">
                        <span className="label">Cédula / RIF: </span>
                        <span className="value">{solicitudSeleccionada.centro_apuesta_representante_ci || '—'}</span>
                      </span>
                    </CCol>
                    <CCol md={6}>
                      <span className="info-card-field">
                        <span className="label">Nombre: </span>
                        <span className="value">{solicitudSeleccionada.centro_apuesta_representante || '—'}</span>
                      </span>
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
                  <CBadge key={j.id_juego} color="primary" shape="rounded-pill" className="game-badge">
                    {j.nombre}
                  </CBadge>
                ))}
              </div>
            </InfoCard>
          )}
        </>
      )}

      <Separator />

      {/* ═══ DATOS DEL DOCUMENTO ═══ */}
      <SectionTitle title="Datos del Documento" />

      {/* Fila 1: N° de Mesa */}
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel>
            N° de Mesa{' '}
            {tipoActual === 'Mesa' && <span className="text-danger">*</span>}
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

      {/* Fila 2: N° Documento + Papel de Seguridad */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>N° de Documento</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="numero_documento"
              value={formData.numero_documento || ''}
              onChange={handleInputChange}
              placeholder="Ej: 06°-AE000123-CA-2026"
              required
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel>Papel de Seguridad</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilClipboard} /></CInputGroupText>
            <CFormInput
              name="papel_seguridad"
              value={formData.papel_seguridad || ''}
              onChange={handleInputChange}
              placeholder="Código del papel"
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 3: Tipo Emisión + LOT */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Tipo de Emisión</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilList} /></CInputGroupText>
            <CFormSelect
              name="tipo_emision"
              value={formData.tipo_emision || 'Inscripcion'}
              onChange={handleInputChange}
            >
              <option value="Inscripcion">Inscripción</option>
              <option value="Renovacion">Renovación</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>

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
      </CRow>

      {/* Fila 4: Fecha Expedición + Vencimiento */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Fecha de Expedición</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
            <CFormInput
              name="fecha_expedicion"
              type="date"
              value={formData.fecha_expedicion || ''}
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
              value={vencimientoValue || ''}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Fila 5: Renovación → Documento Anterior (condicional) */}
      {formData.tipo_emision === 'Renovacion' && (
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Documento Anterior</CFormLabel>
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
                {documentosAnteriores?.map((doc) => (
                  <option key={doc.id_documento} value={doc.id_documento}>
                    {doc.numero_documento} — {doc.fecha_expedicion ? new Date(doc.fecha_expedicion).toLocaleDateString() : '—'}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
          </CCol>
        </CRow>
      )}

      {/* Fila 6: Dirección del Establecimiento */}
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

      {/* Fila 7: Direcciones propias de la Autorización Especial */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Dir. del Centro Asignado</CFormLabel>
          <CFormTextarea
            name="direccion_centro_asignado"
            value={formData.direccion_centro_asignado || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Dirección del centro de apuesta asignado"
          />
        </CCol>

        <CCol md={6}>
          <CFormLabel>Dir. de la Localidad</CFormLabel>
          <CFormTextarea
            name="direccion_localidad"
            value={formData.direccion_localidad || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Dirección de la localidad (tipo Localidad)"
          />
        </CCol>
      </CRow>

      {/* Fila 8: Dir. del Responsable + Observaciones */}
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Dir. del Responsable</CFormLabel>
          <CFormTextarea
            name="direccion_responsable"
            value={formData.direccion_responsable || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Dirección del responsable"
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel>Observaciones <span className="text-muted small fw-normal">(Opcional)</span></CFormLabel>
          <CFormTextarea
            name="detalles_extra"
            value={formData.detalles_extra || ''}
            onChange={handleInputChange}
            rows={2}
            placeholder="Anotaciones adicionales..."
          />
        </CCol>
      </CRow>

      <Separator />

      {/* ═══ DATOS DEL PAGO ═══ */}
      <SectionTitle title="Datos del Pago" />

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
              {bancos?.map((banco) => (
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

      <div className="form-footer">
        {onCancel && (
          <CButton
            type="button"
            color="secondary"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </CButton>
        )}
        <CButton type="submit" color="primary" disabled={loadingDeps} size="lg">
          <CIcon icon={isEditMode ? cilSave : cilPlus} className="me-2" />
          {isEditMode ? 'Actualizar Autorización' : 'Emitir Autorización'}
        </CButton>
      </div>

    </CForm>
  )
}

export default AutorizacionesForm
