import React, { useState, useCallback, useRef } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CAlert,
  CFormSelect,
  CFormLabel,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilUser,
  cilFilterX,
  cilArrowRight,
  cilX,
} from '@coreui/icons'

import { buscarPersonasPorCiRif, getDetallePersona } from '../services/buscador.service'
import BuscadorDetalleModal from '../components/BuscadorDetalleModal'
import LicenciaDetalleModal from '../../licencias/components/LicenciaDetalleModal'
import ComercializadoresDetalleModal from '../../comercializadores/components/ComercializadoresDetalleModal'
import CentrosApuestaDetalleModal from '../../centros_apuesta/components/CentrosApuestaDetalleModal'
import ParticipacionesDetalleModal from '../../participaciones/components/ParticipacionesDetalleModal'
import AutorizacionesDetalleModal from '../../autorizaciones_especiales/components/AutorizacionesDetalleModal'
import SolicitudDetalleModal from '../../solicitudes/components/SolicitudDetalleModal'

const normalizeCiRif = (val) => {
  if (!val) return ''
  return String(val).trim().toUpperCase().replace(/\s+/g, '')
}

const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text || typeof text !== 'string') return text ?? null
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  const lower = highlight.toLowerCase()
  return parts.map((part, i) =>
    part.toLowerCase() === lower ? (
      <mark
        key={i}
        style={{
          backgroundColor: '#fff3cd',
          padding: '0 2px',
          borderRadius: '3px',
          fontWeight: 600,
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

const BuscadorView = () => {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [loadingBusqueda, setLoadingBusqueda] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState(null)
  const [buscado, setBuscado] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [tipoPersona, setTipoPersona] = useState('')
  const [estadoDocumento, setEstadoDocumento] = useState('')
  const [categoria, setCategoria] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Modal principal: detalle de la persona consultada
  const [personaModalVisible, setPersonaModalVisible] = useState(false)
  const [personaDetalle, setPersonaDetalle] = useState(null)
  const [personaLoading, setPersonaLoading] = useState(false)
  const [personaError, setPersonaError] = useState(null)
  const [personaId, setPersonaId] = useState(null)

  // Modales superpuestos (abiertos dentro del propio Buscador, sin redirección)
  const [subModal, setSubModal] = useState({ type: null, id: null })

  const abortControllerRef = useRef(null)

  const buildFilters = useCallback(() => {
    const filters = {}
    if (tipoPersona) filters.tipo_persona = tipoPersona
    if (estadoDocumento) filters.estado_documento = estadoDocumento
    if (categoria) filters.categoria = categoria
    return filters
  }, [tipoPersona, estadoDocumento, categoria])

  const ejecutarBusqueda = useCallback(async (searchTerm, filters = {}, pageNum = 1) => {
    const normalized = normalizeCiRif(searchTerm)
    if (!normalized) {
      setErrorBusqueda('Ingrese una cédula o RIF para iniciar la búsqueda.')
      return
    }

    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoadingBusqueda(true)
    setErrorBusqueda(null)

    try {
      const resultado = await buscarPersonasPorCiRif(
        { ci_rif: normalized, page: pageNum, limit: 10, ...filters },
        { signal: controller.signal },
      )

      if (controller.signal.aborted) return

      setResultados(resultado.rows || [])
      setTotal(resultado.total || 0)
      setTotalPages(resultado.totalPages || 0)
      setPage(resultado.page || pageNum)
      setLastQuery(normalized)
      setBuscado(true)
    } catch (err) {
      if (controller.signal.aborted || err.name === 'CanceledError') return
      setErrorBusqueda(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Error al realizar la búsqueda. Intente de nuevo.',
      )
      setResultados([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      if (!controller.signal.aborted) setLoadingBusqueda(false)
    }
  }, [])

  const handleSubmitBusqueda = (e) => {
    e.preventDefault()
    const normalized = normalizeCiRif(query)
    if (!normalized) {
      setErrorBusqueda('Ingrese una cédula o RIF para iniciar la búsqueda.')
      return
    }
    setQuery(normalized)
    ejecutarBusqueda(normalized, buildFilters(), 1)
  }

  const handlePageChange = (newPage) => {
    if (!lastQuery) return
    ejecutarBusqueda(lastQuery, buildFilters(), newPage)
  }

  const handleLimpiar = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    setQuery('')
    setResultados([])
    setBuscado(false)
    setErrorBusqueda(null)
    setPage(1)
    setTotal(0)
    setTotalPages(0)
    setLastQuery('')
    setTipoPersona('')
    setEstadoDocumento('')
    setCategoria('')
    setShowFilters(false)
    cerrarTodo()
  }

  const handleRetry = () => {
    if (!lastQuery) return
    ejecutarBusqueda(lastQuery, buildFilters(), page)
  }

  // Apertura del modal de detalle de la persona
  const handleVerPersona = async (id) => {
    setPersonaId(id)
    setPersonaModalVisible(true)
    setPersonaDetalle(null)
    setPersonaError(null)
    setPersonaLoading(true)
    try {
      const data = await getDetallePersona(id)
      setPersonaDetalle(data)
    } catch (err) {
      setPersonaError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'No se pudo cargar el detalle de la persona.',
      )
    } finally {
      setPersonaLoading(false)
    }
  }

  const cerrarPersonaModal = () => {
    setPersonaModalVisible(false)
    setPersonaDetalle(null)
    setPersonaError(null)
    setPersonaId(null)
  }

  // Apertura de modales superpuestos (sin redirección)
  const abrirSubModal = (type, id) => {
    if (!id) return
    setSubModal({ type, id })
  }

  const cerrarSubModal = () => {
    setSubModal({ type: null, id: null })
  }

  const cerrarTodo = () => {
    cerrarPersonaModal()
    cerrarSubModal()
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i)

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <CButton size="sm" color="secondary" variant="outline"
          disabled={page === 1 || loadingBusqueda} onClick={() => handlePageChange(page - 1)}>
          Anterior
        </CButton>
        {startPage > 1 && (
          <>
            <CButton size="sm" color="secondary" variant="outline" disabled={loadingBusqueda} onClick={() => handlePageChange(1)}>1</CButton>
            {startPage > 2 && <span className="text-muted px-1">…</span>}
          </>
        )}
        {pages.map((p) => (
          <CButton key={p} size="sm"
            color={p === page ? 'primary' : 'secondary'}
            variant={p === page ? 'solid' : 'outline'}
            disabled={loadingBusqueda} onClick={() => handlePageChange(p)}>
            {p}
          </CButton>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-muted px-1">…</span>}
            <CButton size="sm" color="secondary" variant="outline" disabled={loadingBusqueda} onClick={() => handlePageChange(totalPages)}>{totalPages}</CButton>
          </>
        )}
        <CButton size="sm" color="secondary" variant="outline"
          disabled={page === totalPages || loadingBusqueda} onClick={() => handlePageChange(page + 1)}>
          Siguiente
        </CButton>
      </div>
    )
  }

  return (
    <CContainer fluid className="py-4 px-3 px-md-4">
      {/* Modal principal: detalle de la persona consultada */}
      <BuscadorDetalleModal
        visible={personaModalVisible && !subModal.type}
        onClose={cerrarPersonaModal}
        detalle={personaDetalle}
        loading={personaLoading}
        error={personaError}
        onOpenLicencia={(id) => abrirSubModal('licencia', id)}
        onOpenSolicitud={(id) => abrirSubModal('solicitud', id)}
        onOpenParticipacion={(id) => abrirSubModal('participacion', id)}
        onOpenAutorizacion={(id) => abrirSubModal('autorizacion', id)}
        onOpenComercializador={(id) => abrirSubModal('comercializador', id)}
        onOpenCentro={(id) => abrirSubModal('centro', id)}
      />

      {/* Modales superpuestos — abiertos en el mismo flujo del Buscador */}
      <SolicitudDetalleModal
        idSolicitud={subModal.type === 'solicitud' ? subModal.id : null}
        onClose={cerrarSubModal}
      />
      <LicenciaDetalleModal
        idLicencia={subModal.type === 'licencia' ? subModal.id : null}
        onClose={cerrarSubModal}
      />
      <ComercializadoresDetalleModal
        idComercializador={subModal.type === 'comercializador' ? subModal.id : null}
        onClose={cerrarSubModal}
      />
      <CentrosApuestaDetalleModal
        idCentro={subModal.type === 'centro' ? subModal.id : null}
        onClose={cerrarSubModal}
      />
      <ParticipacionesDetalleModal
        idParticipacion={subModal.type === 'participacion' ? subModal.id : null}
        onClose={cerrarSubModal}
      />
      <AutorizacionesDetalleModal
        idAutorizacion={subModal.type === 'autorizacion' ? subModal.id : null}
        onClose={cerrarSubModal}
      />

      {!buscado && !loadingBusqueda && (
        <div
          className="d-flex flex-column justify-content-center align-items-center w-100"
          style={{ minHeight: '70vh' }}
        >
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: 96, height: 96,
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                boxShadow: '0 6px 20px rgba(99, 132, 255, 0.18)',
              }}
            >
              <CIcon icon={cilSearch} className="text-primary" style={{ width: 48, height: 48 }} />
            </div>
            <h1 className="text-primary fw-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
              Buscador
            </h1>
            <p className="text-muted fs-5 mb-0">
              Ingrese la cédula o RIF para consultar toda la información.
            </p>
          </div>

          <form onSubmit={handleSubmitBusqueda} className="w-100 px-3" style={{ maxWidth: '680px' }}>
            <CInputGroup size="lg" className="shadow-sm buscador-input-group">
              <CInputGroupText className="bg-white border-end-0">
                <CIcon icon={cilUser} className="text-primary" />
              </CInputGroupText>
              <CFormInput
                className="border-start-0 border-end-0 shadow-none"
                id="buscador-ci-rif-main"
                type="text"
                placeholder="Ej: V-12345678 o J-12345678-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{ fontSize: '1.05rem', padding: '0.75rem 0.5rem' }}
              />
              {query && (
                <CButton type="button" color="secondary" variant="ghost" className="border-start-0"
                  onClick={() => setQuery('')} title="Limpiar">
                  <CIcon icon={cilX} />
                </CButton>
              )}
              <CButton type="submit" color="primary" className="px-4 fw-semibold">
                <CIcon icon={cilSearch} className="me-2" />
                Buscar
              </CButton>
            </CInputGroup>
          </form>
        </div>
      )}

      {(buscado || loadingBusqueda || errorBusqueda) && (
        <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
          <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilSearch} className="text-primary" size="lg" />
              <h5 className="mb-0 text-primary fw-bold">Resultados de Búsqueda</h5>
            </div>

            <div className="flex-grow-1" style={{ maxWidth: '520px' }}>
              <form onSubmit={handleSubmitBusqueda}>
                <CInputGroup>
                  <CInputGroupText className="bg-white"><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormInput id="buscador-ci-rif-header" type="text"
                    placeholder="Ej: V-12345678"
                    value={query} onChange={(e) => setQuery(e.target.value)} />
                  <CButton type="submit" color="primary" disabled={loadingBusqueda || !query.trim()}>
                    {loadingBusqueda
                      ? <CSpinner size="sm" className="me-2" />
                      : <CIcon icon={cilSearch} className="me-2" />}
                    Buscar
                  </CButton>
                  <CButton type="button" color="secondary" variant="outline" onClick={handleLimpiar}>
                    Limpiar
                  </CButton>
                </CInputGroup>
              </form>
            </div>
          </CCardHeader>

          <CCardBody>
            <div className="mb-3">
              <CButton size="sm" color="primary" variant="outline"
                onClick={() => setShowFilters(!showFilters)} className="mb-2">
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros avanzados'}
              </CButton>

              {showFilters && (
                <CCard className="border">
                  <CCardBody className="py-3">
                    <CRow className="g-3">
                      <CCol md={4}>
                        <CFormLabel>Tipo de Persona</CFormLabel>
                        <CFormSelect value={tipoPersona} onChange={(e) => setTipoPersona(e.target.value)}>
                          <option value="">Todos</option>
                          <option value="natural">Natural</option>
                          <option value="juridica">Jurídica</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Estado de Documento</CFormLabel>
                        <CFormSelect value={estadoDocumento} onChange={(e) => setEstadoDocumento(e.target.value)}>
                          <option value="">Todos</option>
                          <option value="vigente">Vigente</option>
                          <option value="vencido">Vencido</option>
                          <option value="suspendido">Suspendido</option>
                          <option value="anulado">Anulado</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Categoría de Licencia</CFormLabel>
                        <CFormSelect value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                          <option value="">Todas</option>
                          <option value="Operador">Operador</option>
                          <option value="Comercializador">Comercializador</option>
                          <option value="Centro_de_apuesta">Centro de Apuesta</option>
                          <option value="Responsable_de_programa_informatico">Responsable de Programa Informático</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              )}
            </div>

            {errorBusqueda && !loadingBusqueda && (
              <CAlert color="danger" className="d-flex justify-content-between align-items-center">
                <span>{errorBusqueda}</span>
                <CButton size="sm" color="light" onClick={handleRetry}>Reintentar</CButton>
              </CAlert>
            )}

            {buscado && !loadingBusqueda && !errorBusqueda && resultados.length === 0 && (
              <CAlert color="info" className="text-center py-4">
                <div className="mb-2"><CIcon icon={cilSearch} size="xl" className="text-muted" /></div>
                <strong>No se encontraron resultados para esta búsqueda.</strong>
                <div className="text-muted small mt-1">Verifique la cédula o RIF e intente nuevamente.</div>
              </CAlert>
            )}

            {loadingBusqueda && (
              <div className="d-flex justify-content-center align-items-center py-5">
                <CSpinner color="primary" />
                <span className="ms-3 text-muted">Buscando…</span>
              </div>
            )}

            {!loadingBusqueda && !errorBusqueda && resultados.length > 0 && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="text-muted small mb-0">
                    Mostrando <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> de{' '}
                    <strong>{total}</strong> resultado(s) para <strong>"{lastQuery}"</strong>
                  </p>
                  {(tipoPersona || estadoDocumento || categoria) && (
                    <CButton size="sm" color="danger" variant="ghost"
                      onClick={() => { setTipoPersona(''); setEstadoDocumento(''); setCategoria('') }}>
                      <CIcon icon={cilFilterX} className="me-1" />Limpiar filtros
                    </CButton>
                  )}
                </div>

                <CTable hover responsive striped align="middle" className="mb-0 border module-table">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>CI / RIF</CTableHeaderCell>
                      <CTableHeaderCell>Razón Social</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Teléfono</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Documentos</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {resultados.map((persona, index) => (
                      <CTableRow key={persona.id_persona}>
                        <CTableDataCell className="row-number">
                          {(page - 1) * limit + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          <HighlightText text={persona.ci_rif} highlight={lastQuery} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <HighlightText text={persona.razon_social} highlight={lastQuery} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={persona.tipo_persona === 'natural' ? 'info' : 'warning'} className="status-badge">
                            {persona.tipo_persona === 'natural' ? 'Natural' : 'Jurídica'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{persona.telefono || <span className="text-muted">—</span>}</CTableDataCell>
                        <CTableDataCell>{persona.email || <span className="text-muted">—</span>}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex flex-wrap gap-1 align-items-center">
                            {Array.isArray(persona.documentos) && persona.documentos.length > 0 ? (
                              persona.documentos.map((doc, idx) => {
                                let badgeColor = 'secondary'
                                let badgeText = doc

                                if (doc === 'Solicitud') badgeColor = 'primary'
                                else if (doc === 'Licencia') badgeColor = 'success'
                                else if (doc === 'Participación') badgeColor = 'warning'
                                else if (doc === 'Autorización Especial') {
                                  badgeColor = 'info'
                                  badgeText = 'Autorización'
                                }

                                return (
                                  <CBadge key={idx} color={badgeColor} shape="rounded-pill" className="status-badge">
                                    {badgeText}
                                  </CBadge>
                                )
                              })
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CButton size="sm" color="primary" className="px-3"
                            onClick={() => handleVerPersona(persona.id_persona)}>
                            Ver
                            <CIcon icon={cilArrowRight} className="ms-1" size="sm" />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {renderPagination()}
              </>
            )}
          </CCardBody>
        </CCard>
      )}
    </CContainer>
  )
}

export default BuscadorView
