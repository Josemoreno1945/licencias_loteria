import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow,
  CCol,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const getEstadoDocColor = (estado) => {
  switch (estado) {
    case 'vigente':    return 'success'
    case 'vencido':    return 'danger'
    case 'suspendido': return 'warning'
    case 'anulado':    return 'secondary'
    default:           return 'secondary'
  }
}

const getEstadoSolicitudColor = (estado) => {
  switch (estado) {
    case 'Aprobado':  return 'success'
    case 'Rechazada': return 'danger'
    case 'Pendiente': return 'warning'
    default:          return 'secondary'
  }
}

const BuscadorDetalleModal = ({
  visible,
  onClose,
  detalle,
  loading,
  error,
  onOpenPersona,
  onOpenLicencia,
  onOpenSolicitud,
}) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState('licencias')

  React.useEffect(() => {
    if (visible) setActiveTab('licencias')
  }, [visible])

  if (!visible) return null

  const persona = detalle?.persona || null

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      alignment="center"
      scrollable
    >
      <CModalHeader>
        <CModalTitle>
          Detalle del Consultado
          {persona && (
            <span className="text-muted fw-normal fs-6 ms-3">
              {persona.ci_rif} — {persona.razon_social}
            </span>
          )}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <CSpinner color="primary" />
            <span className="ms-3 text-muted">Cargando información...</span>
          </div>
        )}

        {error && !loading && (
          <CAlert color="danger">{error}</CAlert>
        )}

        {!loading && !error && persona && (
          <>
            {/* ── Bloque de datos de la persona ── */}
            <CRow className="mb-4 p-3 bg-light rounded">
              <CCol md={6}>
                <p className="mb-1">
                  <span className="fw-semibold text-muted small">CI / RIF</span>
                </p>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-bold fs-5">{persona.ci_rif}</span>
                  {/* Botón de navegación interna: va a la lista de personas */}
                  <CButton
                    size="sm"
                    color="primary"
                    variant="outline"
                    onClick={() => onOpenPersona(persona.id_persona)}
                    title="Ver detalle de persona"
                  >
                    Ver Persona
                  </CButton>
                </div>
                <p className="mb-1">
                  <span className="fw-semibold text-muted small">Nombre / Razón Social</span>
                </p>
                <p className="fw-bold mb-2">{persona.razon_social}</p>
                <p className="mb-1">
                  <span className="fw-semibold text-muted small">Tipo de Persona</span>
                </p>
                <CBadge color={persona.tipo_persona === 'natural' ? 'info' : 'warning'}>
                  {persona.tipo_persona === 'natural' ? 'Natural' : 'Jurídica'}
                </CBadge>
              </CCol>
              <CCol md={6}>
                <p className="mb-1">
                  <span className="fw-semibold text-muted small">Teléfono</span>
                </p>
                <p className="mb-2">{persona.telefono || <span className="text-muted">—</span>}</p>
                <p className="mb-1">
                  <span className="fw-semibold text-muted small">Email</span>
                </p>
                <p className="mb-2">{persona.email || <span className="text-muted">—</span>}</p>
                <p className="mb-1">
                  <span className="fw-semibold text-muted small">Dirección Fiscal</span>
                </p>
                <p className="mb-0">{persona.direccion_fiscal || <span className="text-muted">—</span>}</p>
              </CCol>
            </CRow>

            {/* ── Tabs de documentos ── */}
            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'licencias'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('licencias')}
                >
                  Licencias ({detalle.licencias?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'solicitudes'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('solicitudes')}
                >
                  Solicitudes ({detalle.solicitudes?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'representantes'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('representantes')}
                >
                  Representantes ({detalle.representantes?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'centros_apuesta'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('centros_apuesta')}
                >
                  Centros de Apuesta ({detalle.centros_apuesta?.length || 0})
                </CNavLink>
              </CNavItem>

              <CNavItem>
                <CNavLink
                  active={activeTab === 'participaciones'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('participaciones')}
                >
                  Participaciones ({detalle.participaciones?.length || 0})
                </CNavLink>
              </CNavItem>

              {/* ── Placeholder Autorizaciones Especiales ── */}
              {/* TODO: activar cuando el módulo esté listo
              <CNavItem>
                <CNavLink
                  active={activeTab === 'autorizaciones'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('autorizaciones')}
                >
                  Autorizaciones ({detalle.autorizaciones_especiales?.length || 0})
                </CNavLink>
              </CNavItem>
              */}
            </CNav>

            <CTabContent>

              {/* ── TAB: LICENCIAS ── */}
              <CTabPane visible={activeTab === 'licencias'}>
                {detalle.licencias?.length === 0 ? (
                  <CAlert color="info">Esta persona no tiene licencias emitidas.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Nº Documento</CTableHeaderCell>
                        <CTableHeaderCell>Categoría</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Expedición</CTableHeaderCell>
                        <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                        <CTableHeaderCell>Comercializador</CTableHeaderCell>
                        <CTableHeaderCell>Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.licencias.map((lic, idx) => (
                        <CTableRow key={lic.id_documento}>
                          <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                          <CTableDataCell className="fw-semibold">{lic.numero_documento}</CTableDataCell>
                          <CTableDataCell>{lic.categoria}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoDocColor(lic.estado_documento)}>
                              {lic.estado_documento}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{lic.fecha_expedicion?.slice(0, 10)}</CTableDataCell>
                          <CTableDataCell>{lic.fecha_vencimiento?.slice(0, 10)}</CTableDataCell>
                          <CTableDataCell>
                            {lic.comercializador ? (
                              <span className="d-flex align-items-center gap-1">
                                {lic.comercializador}
                                {/* Botón deep-link: va a la lista de comercializadores */}
                                <CButton
                                  size="sm"
                                  color="secondary"
                                  variant="ghost"
                                  className="py-0 px-1"
                                  title="Ver comercializadores"
                                  onClick={() => { onClose(); navigate('/comercializadores/lista', { state: { openModalId: lic.id_comercializador } }) }}
                                >
                                  ↗
                                </CButton>
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {/* Botón para abrir el modal anidado */}
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              onClick={() => onOpenLicencia(lic.id_documento)}
                            >
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              {/* ── TAB: SOLICITUDES ── */}
              <CTabPane visible={activeTab === 'solicitudes'}>
                {detalle.solicitudes?.length === 0 ? (
                  <CAlert color="info">Esta persona no tiene solicitudes registradas.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Tipo Trámite</CTableHeaderCell>
                        <CTableHeaderCell>Categoría</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Comercializador</CTableHeaderCell>
                        <CTableHeaderCell>Registrado por</CTableHeaderCell>
                        <CTableHeaderCell>Fecha</CTableHeaderCell>
                        <CTableHeaderCell>Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.solicitudes.map((sol, idx) => (
                        <CTableRow key={sol.id_solicitudes}>
                          <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                          <CTableDataCell>{sol.tipo_tramite}</CTableDataCell>
                          <CTableDataCell>{sol.categoria_licencia || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoSolicitudColor(sol.estado)}>
                              {sol.estado}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{sol.comercializador || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>{sol.registrado_por}</CTableDataCell>
                          <CTableDataCell>{sol.created_at?.slice(0, 10)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              onClick={() => onOpenSolicitud(sol.id_solicitudes)}
                            >
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              {/* ── TAB: REPRESENTANTES ── */}
              <CTabPane visible={activeTab === 'representantes'}>
                {detalle.representantes?.length === 0 ? (
                  <CAlert color="info">Esta persona no es representante de ningun comercializador.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Comercializador</CTableHeaderCell>
                        <CTableHeaderCell>RIF</CTableHeaderCell>
                        <CTableHeaderCell>Cargo</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.representantes.map((rep, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                          <CTableDataCell className="fw-semibold">{rep.comercializador}</CTableDataCell>
                          <CTableDataCell>{rep.rif}</CTableDataCell>
                          <CTableDataCell>{rep.cargo || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={rep.estado === 'activo' ? 'success' : 'secondary'}>
                              {rep.estado}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              {/* ── TAB: CENTROS DE APUESTA ── */}
              <CTabPane visible={activeTab === 'centros_apuesta'}>
                {detalle.centros_apuesta?.length === 0 ? (
                  <CAlert color="info">Esta persona no tiene centros de apuesta a su cargo.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Nombre Agencia</CTableHeaderCell>
                        <CTableHeaderCell>Direccion</CTableHeaderCell>
                        <CTableHeaderCell>Comercializador</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.centros_apuesta.map((centro, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                          <CTableDataCell className="fw-semibold">{centro.nombre_agencia}</CTableDataCell>
                          <CTableDataCell>{centro.direccion || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>{centro.comercializador || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={centro.estado === 'activo' ? 'success' : 'secondary'}>
                              {centro.estado}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'participaciones'}>
                {detalle.participaciones?.length === 0 ? (
                  <CAlert color="info">Esta persona no tiene participaciones registradas.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Nº Archivo</CTableHeaderCell>
                        <CTableHeaderCell>Nº Documento</CTableHeaderCell>
                        <CTableHeaderCell>Tipo</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Comercializador</CTableHeaderCell>
                        <CTableHeaderCell>Expedición</CTableHeaderCell>
                        <CTableHeaderCell>Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.participaciones.map((par, idx) => (
                        <CTableRow key={par.id_documento}>
                          <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                          <CTableDataCell>{par.nro_archivo || '—'}</CTableDataCell>
                          <CTableDataCell>{par.numero_documento}</CTableDataCell>
                          <CTableDataCell>{par.tipo || '—'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoDocColor(par.estado_documento)}>
                              {par.estado_documento}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{par.comercializador || '—'}</CTableDataCell>
                          <CTableDataCell>{par.fecha_expedicion?.slice(0, 10)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton size="sm" color="primary" variant="outline"
                              onClick={() => { onClose(); navigate('/participaciones/lista', { state: { openModalId: par.id_documento } }) }}>
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              {/* ── TAB PLACEHOLDER: AUTORIZACIONES ESPECIALES ── */}
              {/* TODO: descomentar y conectar datos cuando el módulo esté listo
              <CTabPane visible={activeTab === 'autorizaciones'}>
                {detalle.autorizaciones_especiales?.length === 0 ? (
                  <CAlert color="info">Esta persona no tiene autorizaciones especiales.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Nº Mesa</CTableHeaderCell>
                        <CTableHeaderCell>Nº Documento</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Operadora</CTableHeaderCell>
                        <CTableHeaderCell>Expedición</CTableHeaderCell>
                        <CTableHeaderCell>Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.autorizaciones_especiales.map((aut, idx) => (
                        <CTableRow key={aut.id_documento}>
                          <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                          <CTableDataCell>{aut.nro_mesa}</CTableDataCell>
                          <CTableDataCell>{aut.numero_documento}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoDocColor(aut.estado_documento)}>
                              {aut.estado_documento}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{aut.operadora}</CTableDataCell>
                          <CTableDataCell>{aut.fecha_expedicion?.slice(0, 10)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton size="sm" color="primary" variant="outline"
                              onClick={() => { onClose(); navigate('/autorizaciones/lista', { state: { openModalId: aut.id_documento } }) }}>
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>
              */}

            </CTabContent>
          </>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default BuscadorDetalleModal
