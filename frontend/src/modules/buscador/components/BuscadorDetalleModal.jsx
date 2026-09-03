import React, { useEffect, useState } from 'react'
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
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilLocationPin, cilUser } from '@coreui/icons'

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
  onOpenLicencia,
  onOpenSolicitud,
  onOpenParticipacion,
  onOpenAutorizacion,
  onOpenComercializador,
  onOpenCentro,
}) => {
  const [activeTab, setActiveTab] = useState('licencias')

  useEffect(() => {
    if (visible) setActiveTab('licencias')
  }, [visible])

  if (!visible) return null

  const persona = detalle?.persona || null
  const hasResults = !!detalle && (
    (detalle.licencias?.length || 0) +
    (detalle.solicitudes?.length || 0) +
    (detalle.participaciones?.length || 0) +
    (detalle.representantes?.length || 0) +
    (detalle.centros_apuesta?.length || 0) > 0
  )

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      alignment="center"
      scrollable
    >
      <CModalHeader className="border-bottom-0 pb-0">
        <CModalTitle className="d-flex flex-column">
          <span className="text-primary fw-bold">Detalle del Consultado</span>
          {persona && (
            <span className="text-muted fw-normal fs-6 mt-1">
              {persona.ci_rif} · {persona.razon_social}
            </span>
          )}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="pt-3">
        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <CSpinner color="primary" />
            <span className="ms-3 text-muted">Cargando información…</span>
          </div>
        )}

        {error && !loading && <CAlert color="danger">{error}</CAlert>}

        {!loading && !error && persona && (
          <>
            <CRow className="mb-4 p-3 bg-light rounded">
              <CCol md={6} className="mb-3 mb-md-0">
                <div className="detail-field-label">CI / RIF</div>
                <div className="fw-bold fs-5 mb-3">{persona.ci_rif}</div>
                <div className="detail-field-label">Razón Social</div>
                <p className="fw-bold mb-3">{persona.razon_social}</p>
                <div className="detail-field-label">Tipo de Persona</div>
                <CBadge color={persona.tipo_persona === 'natural' ? 'info' : 'warning'} className="status-badge">
                  {persona.tipo_persona === 'natural' ? 'Natural' : 'Jurídica'}
                </CBadge>
              </CCol>
              <CCol md={6}>
                <div className="detail-field-label">Teléfono</div>
                <p className="mb-3">{persona.telefono || <span className="text-muted">—</span>}</p>
                <div className="detail-field-label">Email</div>
                <p className="mb-3">{persona.email || <span className="text-muted">—</span>}</p>
                <div className="detail-field-label">Dirección Fiscal</div>
                <p className="mb-0">{persona.direccion_fiscal || <span className="text-muted">—</span>}</p>
              </CCol>
            </CRow>

            <hr className="section-divider" />

            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink active={activeTab === 'licencias'} onClick={() => setActiveTab('licencias')} style={{ cursor: 'pointer' }}>
                  Licencias ({detalle.licencias?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 'solicitudes'} onClick={() => setActiveTab('solicitudes')} style={{ cursor: 'pointer' }}>
                  Solicitudes ({detalle.solicitudes?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 'participaciones'} onClick={() => setActiveTab('participaciones')} style={{ cursor: 'pointer' }}>
                  Participaciones ({detalle.participaciones?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 'representantes'} onClick={() => setActiveTab('representantes')} style={{ cursor: 'pointer' }}>
                  Comercializadoras ({detalle.representantes?.length || 0})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 'centros_apuesta'} onClick={() => setActiveTab('centros_apuesta')} style={{ cursor: 'pointer' }}>
                  Centros de Apuesta ({detalle.centros_apuesta?.length || 0})
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              <CTabPane visible={activeTab === 'licencias'}>
                {!detalle.licencias?.length ? (
                  <CAlert color="info" className="text-center mb-0">Sin licencias emitidas.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small module-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nº Documento</CTableHeaderCell>
                        <CTableHeaderCell>Categoría</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Expedición</CTableHeaderCell>
                        <CTableHeaderCell>Vencimiento</CTableHeaderCell>
                        <CTableHeaderCell>Comercializadora</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.licencias.map((lic) => (
                        <CTableRow key={lic.id_documento}>
                          <CTableDataCell className="fw-semibold">{lic.numero_documento}</CTableDataCell>
                          <CTableDataCell>{lic.categoria}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoDocColor(lic.estado_documento)} className="status-badge">
                              {lic.estado_documento}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{lic.fecha_expedicion?.slice(0, 10) || '—'}</CTableDataCell>
                          <CTableDataCell>{lic.fecha_vencimiento?.slice(0, 10) || '—'}</CTableDataCell>
                          <CTableDataCell>
                            {lic.comercializador ? (
                              <div className="d-flex align-items-center gap-2">
                                <span className="text-truncate" style={{ maxWidth: 140 }}>{lic.comercializador}</span>
                                {lic.id_comercializador && (
                                  <CButton size="sm" color="primary" variant="outline" className="py-0 px-2"
                                    onClick={() => onOpenComercializador?.(lic.id_comercializador)}>
                                    <CIcon icon={cilBuilding} size="sm" className="me-1" />Ver
                                  </CButton>
                                )}
                              </div>
                            ) : <span className="text-muted">—</span>}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CButton size="sm" color="primary" variant="outline"
                              onClick={() => onOpenLicencia?.(lic.id_documento)}>
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'solicitudes'}>
                {!detalle.solicitudes?.length ? (
                  <CAlert color="info" className="text-center mb-0">Sin solicitudes registradas.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small module-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Tipo Trámite</CTableHeaderCell>
                        <CTableHeaderCell>Categoría</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Comercializadora</CTableHeaderCell>
                        <CTableHeaderCell>Registrado por</CTableHeaderCell>
                        <CTableHeaderCell>Fecha</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.solicitudes.map((sol) => (
                        <CTableRow key={sol.id_solicitudes}>
                          <CTableDataCell>{sol.tipo_tramite}</CTableDataCell>
                          <CTableDataCell>{sol.categoria_licencia || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoSolicitudColor(sol.estado)} className="status-badge">
                              {sol.estado}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {sol.comercializador ? (
                              <div className="d-flex align-items-center gap-2">
                                <span className="text-truncate" style={{ maxWidth: 120 }}>{sol.comercializador}</span>
                                {sol.id_comercializador && (
                                  <CButton size="sm" color="primary" variant="outline" className="py-0 px-2"
                                    onClick={() => onOpenComercializador?.(sol.id_comercializador)}>
                                    <CIcon icon={cilBuilding} size="sm" className="me-1" />Ver
                                  </CButton>
                                )}
                              </div>
                            ) : <span className="text-muted">—</span>}
                          </CTableDataCell>
                          <CTableDataCell>{sol.registrado_por}</CTableDataCell>
                          <CTableDataCell>{sol.created_at?.slice(0, 10) || '—'}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CButton size="sm" color="primary" variant="outline"
                              onClick={() => onOpenSolicitud?.(sol.id_solicitudes)}>
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'participaciones'}>
                {!detalle.participaciones?.length ? (
                  <CAlert color="info" className="text-center mb-0">Sin participaciones registradas.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small module-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nº Archivo</CTableHeaderCell>
                        <CTableHeaderCell>Nº Documento</CTableHeaderCell>
                        <CTableHeaderCell>Tipo</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell>Comercializadora</CTableHeaderCell>
                        <CTableHeaderCell>Expedición</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.participaciones.map((par) => (
                        <CTableRow key={par.id_documento}>
                          <CTableDataCell>{par.nro_archivo || '—'}</CTableDataCell>
                          <CTableDataCell className="fw-semibold">{par.numero_documento}</CTableDataCell>
                          <CTableDataCell>{par.tipo || '—'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getEstadoDocColor(par.estado_documento)} className="status-badge">
                              {par.estado_documento}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {par.comercializador ? (
                              <div className="d-flex align-items-center gap-2">
                                <span className="text-truncate" style={{ maxWidth: 120 }}>{par.comercializador}</span>
                                {par.id_comercializador && (
                                  <CButton size="sm" color="primary" variant="outline" className="py-0 px-2"
                                    onClick={() => onOpenComercializador?.(par.id_comercializador)}>
                                    <CIcon icon={cilBuilding} size="sm" className="me-1" />Ver
                                  </CButton>
                                )}
                              </div>
                            ) : <span className="text-muted">—</span>}
                          </CTableDataCell>
                          <CTableDataCell>{par.fecha_expedicion?.slice(0, 10) || '—'}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CButton size="sm" color="primary" variant="outline"
                              onClick={() => onOpenParticipacion?.(par.id_documento)}>
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'representantes'}>
                {!detalle.representantes?.length ? (
                  <CAlert color="info" className="text-center mb-0">No es representante de ninguna comercializadora.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small module-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Comercializadora</CTableHeaderCell>
                        <CTableHeaderCell>RIF</CTableHeaderCell>
                        <CTableHeaderCell>Cargo</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.representantes.map((rep) => (
                        <CTableRow key={rep.id_c_representantes || `${rep.id_comercializador}-${rep.rif}`}>
                          <CTableDataCell className="fw-semibold">{rep.comercializador}</CTableDataCell>
                          <CTableDataCell>{rep.rif}</CTableDataCell>
                          <CTableDataCell>{rep.cargo || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={rep.estado === 'activo' ? 'success' : 'secondary'} className="status-badge">
                              {rep.estado}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {rep.id_comercializador && (
                              <CButton size="sm" color="primary" variant="outline"
                                onClick={() => onOpenComercializador?.(rep.id_comercializador)}>
                                <CIcon icon={cilBuilding} className="me-1" />
                                Ver Comercializadora
                              </CButton>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'centros_apuesta'}>
                {!detalle.centros_apuesta?.length ? (
                  <CAlert color="info" className="text-center mb-0">No tiene centros de apuesta a su cargo.</CAlert>
                ) : (
                  <CTable hover responsive striped align="middle" className="mb-0 small module-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Agencia</CTableHeaderCell>
                        <CTableHeaderCell>Dirección</CTableHeaderCell>
                        <CTableHeaderCell>Comercializadora</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalle.centros_apuesta.map((centro) => (
                        <CTableRow key={centro.id_centro}>
                          <CTableDataCell className="fw-semibold">{centro.nombre_agencia}</CTableDataCell>
                          <CTableDataCell>{centro.direccion || <span className="text-muted">—</span>}</CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-truncate" style={{ maxWidth: 120 }}>{centro.comercializador}</span>
                              {centro.id_comercializador && (
                                <CButton size="sm" color="primary" variant="outline" className="py-0 px-2"
                                  onClick={() => onOpenComercializador?.(centro.id_comercializador)}>
                                  <CIcon icon={cilBuilding} size="sm" className="me-1" />Ver
                                </CButton>
                              )}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={centro.estado === 'activo' ? 'success' : 'secondary'} className="status-badge">
                              {centro.estado}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {centro.id_centro && (
                              <CButton size="sm" color="primary" variant="outline"
                                onClick={() => onOpenCentro?.(centro.id_centro)}>
                                <CIcon icon={cilLocationPin} className="me-1" />
                                Ver Centro
                              </CButton>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>
            </CTabContent>

            {!hasResults && (
              <CAlert color="secondary" className="text-center mt-3 mb-0">
                Esta persona no tiene documentos, solicitudes ni entidades asociadas.
              </CAlert>
            )}
          </>
        )}
      </CModalBody>

      <CModalFooter className="border-top-0">
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default BuscadorDetalleModal
