import React, { useEffect, useState, useCallback } from 'react';
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
  CAlert,
  CBadge,
  CCard,
  CCardBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilDescription,
  cilBuilding,
  cilBriefcase,
  cilNotes,
  cilUser,
  cilHome,
  cilPhone,
  cilCheckAlt,
  cilX,
  cilTask,
} from '@coreui/icons';
import axiosInstance from '../../../api/axiosInstance';

// ── Componente de tarjeta de información de entidad (solo lectura) ──────────
const InfoCard = ({ titulo, campos }) => (
  <CCard className="border-start border-start-3 border-start-info mb-3">
    <CCardBody className="py-2 px-3">
      <p className="text-info fw-semibold small mb-2" style={{ letterSpacing: '0.05em' }}>
        {titulo}
      </p>
      <CRow className="gy-1">
        {campos.map(({ label, value }) => (
          <CCol key={label} md={6}>
            <span className="text-muted small">{label}: </span>
            <span className="small fw-semibold">{value || '—'}</span>
          </CCol>
        ))}
      </CRow>
    </CCardBody>
  </CCard>
);

// ── Selector de juegos con checkboxes ────────────────────────────────────────
const SelectorJuegos = ({ juegos, seleccionados, onChange, loading }) => {
  const toggle = (id_juego) => {
    const nuevos = seleccionados.includes(id_juego)
      ? seleccionados.filter((j) => j !== id_juego)
      : [...seleccionados, id_juego];
    onChange(nuevos);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted small py-2">
        <CSpinner size="sm" /> Cargando juegos disponibles...
      </div>
    );
  }

  if (!juegos.length) {
    return <CAlert color="warning" className="py-2 small">No hay juegos activos disponibles.</CAlert>;
  }

  return (
    <div
      className="border rounded p-2"
      style={{ maxHeight: '180px', overflowY: 'auto', background: '#f8f9fa' }}
    >
      {juegos.map((j) => {
        const checked = seleccionados.includes(j.id_juego);
        return (
          <div
            key={j.id_juego}
            onClick={() => toggle(j.id_juego)}
            className={`d-flex align-items-center gap-2 px-2 py-1 rounded mb-1 cursor-pointer ${
              checked ? 'bg-primary bg-opacity-10 border border-primary' : 'hover-bg'
            }`}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <CIcon
              icon={checked ? cilCheckAlt : cilX}
              size="sm"
              className={checked ? 'text-primary' : 'text-secondary'}
            />
            <span className="small fw-semibold">{j.nombre}</span>
            <span className="text-muted small ms-auto">{j.operadora_razon_social}</span>
            {checked && (
              <CBadge color="primary" shape="rounded-pill" className="ms-1" style={{ fontSize: '0.65rem' }}>
                ✓
              </CBadge>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const SolicitudesForm = ({ formData, handleInputChange, handleJuegosChange, onSubmit }) => {

  // ── Listas de catálogos ──
  const [comercializadores, setComercializadores] = useState([]);
  const [centros, setCentros] = useState([]);
  const [juegos, setJuegos] = useState([]);

  // ── Datos autocompletados ──
  const [detalleComercializador, setDetalleComercializador] = useState(null);
  const [detalleCentro, setDetalleCentro] = useState(null);

  // ── Estados de carga ──
  const [loadingComercializadores, setLoadingComercializadores] = useState(false);
  const [loadingDetalleC, setLoadingDetalleC] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [loadingDetalleCA, setLoadingDetalleCA] = useState(false);
  const [loadingJuegos, setLoadingJuegos] = useState(false);

  // 1. Cargar comercializadores activos al montar
  useEffect(() => {
    const fetchComercializadores = async () => {
      setLoadingComercializadores(true);
      try {
        const res = await axiosInstance.get('/comercializadores/activos');
        setComercializadores(res.data || []);
      } catch (err) {
        console.error('Error al cargar comercializadores:', err);
      } finally {
        setLoadingComercializadores(false);
      }
    };
    fetchComercializadores();
  }, []);

  // 2. Cargar juegos activos al montar
  useEffect(() => {
    const fetchJuegos = async () => {
      setLoadingJuegos(true);
      try {
        const res = await axiosInstance.get('/juegos/activas');
        setJuegos(res.data || []);
      } catch (err) {
        console.error('Error al cargar juegos:', err);
      } finally {
        setLoadingJuegos(false);
      }
    };
    fetchJuegos();
  }, []);

  // 3. Cuando cambia el comercializador → autocompletar detalle + cargar centros
  useEffect(() => {
    if (!formData.id_comercializador) {
      setDetalleComercializador(null);
      setCentros([]);
      setDetalleCentro(null);
      return;
    }

    const fetchDetalle = async () => {
      setLoadingDetalleC(true);
      setLoadingCentros(true);
      try {
        const [resDetalle, resCentros] = await Promise.all([
          axiosInstance.get(`/comercializadores/${formData.id_comercializador}/detalle-completo`),
          axiosInstance.get(`/centros_apuesta/por-comercializador/${formData.id_comercializador}`),
        ]);
        setDetalleComercializador(resDetalle.data);
        setCentros(resCentros.data || []);
      } catch (err) {
        console.error('Error al cargar detalle del comercializador:', err);
        setDetalleComercializador(null);
        setCentros([]);
      } finally {
        setLoadingDetalleC(false);
        setLoadingCentros(false);
      }
    };
    fetchDetalle();
  }, [formData.id_comercializador]);

  // 4. Cuando cambia el centro → autocompletar detalle
  useEffect(() => {
    if (!formData.id_centro) {
      setDetalleCentro(null);
      return;
    }

    const fetchDetalleCentro = async () => {
      setLoadingDetalleCA(true);
      try {
        const res = await axiosInstance.get(`/centros_apuesta/${formData.id_centro}/detalle-completo`);
        setDetalleCentro(res.data);
      } catch (err) {
        console.error('Error al cargar detalle del centro:', err);
        setDetalleCentro(null);
      } finally {
        setLoadingDetalleCA(false);
      }
    };
    fetchDetalleCentro();
  }, [formData.id_centro]);

  const mostrarCamposLicencia       = formData.tipo_tramite === 'Licencia';
  const mostrarCamposParticipacion  = formData.tipo_tramite === 'Participacion';
  const mostrarCamposAutorizacion   = formData.tipo_tramite === 'Autorizacion_especial';
  const mostrarJuegos               = mostrarCamposLicencia || mostrarCamposParticipacion || mostrarCamposAutorizacion;

  return (
    <CForm onSubmit={onSubmit}>

      {/* ══════════════════════════════════════════════════
          PASO 1 — Tipo de Trámite
      ══════════════════════════════════════════════════ */}
      <h6 className="text-primary fw-semibold mb-3 mt-1" style={{ letterSpacing: '0.04em' }}>
        1. Tipo de Trámite
      </h6>

      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>Tipo de Documento a Solicitar <span className="text-danger">*</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilDescription} /></CInputGroupText>
            <CFormSelect
              name="tipo_tramite"
              value={formData.tipo_tramite}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione el tipo...</option>
              <option value="Licencia">Licencia</option>
              <option value="Participacion">Participación</option>
              <option value="Autorizacion_especial">Autorización Especial</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>

        {/* Categoría de licencia — aparece solo si tipo = Licencia */}
        {mostrarCamposLicencia && (
          <CCol md={6} className="mb-3">
            <CFormLabel>Categoría de Licencia <span className="text-danger">*</span></CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilBriefcase} /></CInputGroupText>
              <CFormSelect
                name="categoria_licencia"
                value={formData.categoria_licencia || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione la categoría...</option>
                <option value="Operador">Operador</option>
                <option value="Comercializador">Comercializador</option>
                <option value="Centro_de_apuesta">Centro de Apuesta</option>
                <option value="Responsable_de_programa_informatico">Responsable de Prog. Informático</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>
        )}
      </CRow>

      <hr className="text-muted opacity-25 mb-4" />

      {/* ══════════════════════════════════════════════════
          PASO 2 — Selección de Entidades con Autocompletado
      ══════════════════════════════════════════════════ */}
      <h6 className="text-primary fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>
        2. Entidades Vinculadas
      </h6>

      <CRow className="mb-2">
        {/* Select de Comercializador */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Comercializador <span className="text-danger">*</span></CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilBuilding} /></CInputGroupText>
            <CFormSelect
              name="id_comercializador"
              value={formData.id_comercializador || ''}
              onChange={handleInputChange}
              disabled={loadingComercializadores}
              required
            >
              <option value="">Seleccione el comercializador...</option>
              {comercializadores.map((c) => (
                <option key={c.id_comercializadores} value={c.id_comercializadores}>
                  {c.rif} — {c.razon_social}
                </option>
              ))}
            </CFormSelect>
            {loadingComercializadores && (
              <CInputGroupText><CSpinner size="sm" /></CInputGroupText>
            )}
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Panel de autocompletado del Comercializador */}
      {loadingDetalleC && (
        <div className="d-flex align-items-center gap-2 text-muted small mb-3">
          <CSpinner size="sm" /> Cargando datos del comercializador...
        </div>
      )}
      {!loadingDetalleC && detalleComercializador && (
        <>
          <InfoCard
            titulo="📋 Datos del Comercializador"
            campos={[
              { label: 'RIF', value: detalleComercializador.rif },
              { label: 'Razón Social', value: detalleComercializador.razon_social },
              { label: 'Dirección Fiscal', value: detalleComercializador.direccion_fiscal },
              { label: 'Teléfono', value: detalleComercializador.telefono },
              { label: 'Email', value: detalleComercializador.email },
            ]}
          />

          {/* Selector de Representante Legal (id_persona) */}
          {detalleComercializador.representantes?.length > 0 ? (
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>
                  Representante Legal Titular <span className="text-danger">*</span>
                  <span className="text-muted small ms-2">(Persona que firma la solicitud)</span>
                </CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormSelect
                    name="id_persona"
                    value={formData.id_persona || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione el representante titular...</option>
                    {detalleComercializador.representantes.map((rep) => (
                      <option key={rep.id_persona} value={rep.id_persona}>
                        {rep.ci_rif} — {rep.razon_social}
                        {rep.cargo ? ` (${rep.cargo})` : ''}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
              </CCol>
            </CRow>
          ) : (
            <CAlert color="warning" className="py-2 small mb-3">
              <CIcon icon={cilX} className="me-1" />
              Este comercializador no tiene representantes activos registrados. Regístrelos primero.
            </CAlert>
          )}
        </>
      )}

      {/* ── Centro de Apuesta (aparece solo cuando hay comercializador seleccionado) ── */}
      {formData.id_comercializador && !loadingDetalleC && (
        <CRow className="mb-2">
          <CCol md={6} className="mb-3">
            <CFormLabel>
              Centro de Apuesta
              <span className="text-muted small ms-2">(Opcional)</span>
            </CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilHome} /></CInputGroupText>
              <CFormSelect
                name="id_centro"
                value={formData.id_centro || ''}
                onChange={handleInputChange}
                disabled={loadingCentros}
              >
                <option value="">Ninguno / No aplica</option>
                {centros.map((ca) => (
                  <option key={ca.id_centro} value={ca.id_centro}>
                    {ca.nombre_agencia}
                  </option>
                ))}
              </CFormSelect>
              {loadingCentros && <CInputGroupText><CSpinner size="sm" /></CInputGroupText>}
            </CInputGroup>
            {!loadingCentros && centros.length === 0 && (
              <p className="text-muted small mt-1 mb-0">
                No hay centros de apuesta activos para este comercializador.
              </p>
            )}
          </CCol>
        </CRow>
      )}

      {/* Panel de autocompletado del Centro de Apuesta */}
      {loadingDetalleCA && (
        <div className="d-flex align-items-center gap-2 text-muted small mb-3">
          <CSpinner size="sm" /> Cargando datos del centro de apuesta...
        </div>
      )}
      {!loadingDetalleCA && detalleCentro && (
        <InfoCard
          titulo="🏢 Datos del Centro de Apuesta"
          campos={[
            { label: 'Agencia', value: detalleCentro.nombre_agencia },
            { label: 'Dirección', value: detalleCentro.direccion },
            {
              label: 'Representantes',
              value: detalleCentro.representantes?.length
                ? detalleCentro.representantes.map((r) => `${r.razon_social} (${r.cargo || 'Rep.'}`).join(', ')
                : 'Sin representantes activos',
            },
          ]}
        />
      )}

      <hr className="text-muted opacity-25 mb-4" />

      {/* ══════════════════════════════════════════════════
          PASO 3 — Campos dinámicos según el Tipo
      ══════════════════════════════════════════════════ */}
      {formData.tipo_tramite && (
        <>
          <h6 className="text-primary fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>
            3. Detalles del Trámite
          </h6>

          <CRow className="mb-3">
            {/* ─ LICENCIA ─ */}
            {mostrarCamposLicencia && (
              <CCol md={6} className="mb-3">
                <CFormLabel>Tipo de Emisión <span className="text-danger">*</span></CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilTask} /></CInputGroupText>
                  <CFormSelect
                    name="tipo_emision"
                    value={formData.tipo_emision || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="Inscripcion">Inscripción (nueva)</option>
                    <option value="Renovacion">Renovación</option>
                  </CFormSelect>
                </CInputGroup>
              </CCol>
            )}

            {/* ─ PARTICIPACIÓN ─ */}
            {mostrarCamposParticipacion && (
              <>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Subtipo de Participación <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilTask} /></CInputGroupText>
                    <CFormSelect
                      name="tipo_participacion"
                      value={formData.tipo_participacion || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="Archivo">Archivo</option>
                      <option value="Certificacion">Certificación</option>
                      <option value="Rectificacion">Rectificación</option>
                      <option value="Nulidad">Nulidad</option>
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel>N° de Autorización CONALOT <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilDescription} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="numero_autorizacion_conalot"
                      placeholder="Ej: CONALOT-2024-001"
                      value={formData.numero_autorizacion_conalot || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Fecha Emisión CONALOT <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilTask} /></CInputGroupText>
                    <CFormInput
                      type="date"
                      name="fecha_emision_conalot"
                      value={formData.fecha_emision_conalot || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Fecha Vencimiento CONALOT <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilTask} /></CInputGroupText>
                    <CFormInput
                      type="date"
                      name="fecha_vencimiento_conalot"
                      value={formData.fecha_vencimiento_conalot || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={12} className="mb-3">
                  <CFormLabel>N° Licencia de Lotería del Táchira <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilDescription} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="numero_licencia_loteriatachira"
                      placeholder="Ej: 06°-L000403-CA-2026"
                      value={formData.numero_licencia_loteriatachira || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
              </>
            )}

            {/* ─ AUTORIZACIÓN ESPECIAL ─ */}
            {mostrarCamposAutorizacion && (
              <>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Tipo de Autorización Especial <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilTask} /></CInputGroupText>
                    <CFormSelect
                      name="tipo_autorizacion_especial"
                      value={formData.tipo_autorizacion_especial || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="Movil">Móvil</option>
                      <option value="Localidad">Localidad</option>
                      <option value="Mesa">Mesa</option>
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
                <CCol md={12} className="mb-3">
                  <CFormLabel>Dirección de la Mesa / Localidad <span className="text-danger">*</span></CFormLabel>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilHome} /></CInputGroupText>
                    <CFormInput
                      type="text"
                      name="direccion_autorizacion_especial"
                      placeholder="Ej: Palotal Parte Alta, Barrio Bolivariano..."
                      value={formData.direccion_autorizacion_especial || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
              </>
            )}
          </CRow>

          {/* ─ Selector de Juegos (aplica a todos los tipos) ─ */}
          {mostrarJuegos && (
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>
                  <CIcon icon={cilCheckAlt} className="me-1 text-primary" />
                  Juegos Autorizados en esta Solicitud
                  {formData.id_juegos?.length > 0 && (
                    <CBadge color="primary" className="ms-2">
                      {formData.id_juegos.length} seleccionado{formData.id_juegos.length > 1 ? 's' : ''}
                    </CBadge>
                  )}
                </CFormLabel>
                <SelectorJuegos
                  juegos={juegos}
                  seleccionados={formData.id_juegos || []}
                  onChange={handleJuegosChange}
                  loading={loadingJuegos}
                />
              </CCol>
            </CRow>
          )}

          <hr className="text-muted opacity-25 mb-4" />
        </>
      )}

      {/* ══════════════════════════════════════════════════
          PASO 4 — Notas y Observaciones
      ══════════════════════════════════════════════════ */}
      <h6 className="text-primary fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>
        {formData.tipo_tramite ? '4.' : '2.'} Notas Internas
      </h6>

      <CRow className="mb-3">
        <CCol md={6} className="mb-3">
          <CFormLabel>Descripción del Trámite</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilNotes} /></CInputGroupText>
            <CFormTextarea
              name="descripcion_tramite"
              rows={3}
              placeholder="Detalle breve del trámite..."
              value={formData.descripcion_tramite || ''}
              onChange={handleInputChange}
            />
          </CInputGroup>
        </CCol>

        <CCol md={6} className="mb-3">
          <CFormLabel>Observaciones</CFormLabel>
          <CInputGroup>
            <CInputGroupText><CIcon icon={cilNotes} /></CInputGroupText>
            <CFormTextarea
              name="observaciones"
              rows={3}
              placeholder="Anotaciones internas o adicionales..."
              value={formData.observaciones || ''}
              onChange={handleInputChange}
            />
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
