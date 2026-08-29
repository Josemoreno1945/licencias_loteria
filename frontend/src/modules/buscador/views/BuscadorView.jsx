import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import { cilSearch, cilUser, cilFilterX } from '@coreui/icons'

import { buscarPersonasPorCiRif, getDetallePersona } from '../services/buscador.service'
import BuscadorDetalleModal from '../components/BuscadorDetalleModal'
import PersonaDetalleModal from '../../personas/components/PersonaDetalleModal'
import LicenciaDetalleModal from '../../licencias/components/LicenciaDetalleModal'
import SolicitudDetalleModal from '../../solicitudes/components/SolicitudDetalleModal'
import useDebounce from '../../../hooks/useDebounce'
import { getCachedSearch, setCachedSearch } from '../../../utils/searchCache'

const normalizeCiRif = (val) => {
  if (!val) return ""
  const str = String(val)
  return str.trim().toUpperCase().replace(/\s+/g, "")
}

const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text || typeof text !== 'string') return text
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  const lowerHighlight = highlight.toLowerCase()
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerHighlight ? (
          <mark key={i} style={{ backgroundColor: '#fff3cd', padding: '0 2px', borderRadius: '2px' }}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  )
}

const BuscadorView = () => {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [loadingBusqueda, setLoadingBusqueda] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState(null)
  const [buscado, setBuscado] = useState(false)

  // Paginacion
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filtros avanzados
  const [tipoPersona, setTipoPersona] = useState('')
  const [estadoDocumento, setEstadoDocumento] = useState('')
  const [categoria, setCategoria] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Estado del modal de detalle
  const [modalVisible, setModalVisible] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState(null)

  // Estados para los modales anidados
  const [personaModalId, setPersonaModalId] = useState(null)
  const [licenciaModalId, setLicenciaModalId] = useState(null)
  const [solicitudModalId, setSolicitudModalId] = useState(null)

  const abortControllerRef = useRef(null)
  const debouncedQuery = useDebounce(query, 400)
  const debouncedNormalized = normalizeCiRif(debouncedQuery)
  const manualSearchRef = useRef(false)

  const ejecutarBusqueda = useCallback(async (searchTerm, filters = {}, pageNum = 1) => {
    if (!searchTerm || searchTerm.trim() === "") return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const cacheKey = `${searchTerm}-${filters.tipoPersona || ''}-${filters.estadoDocumento || ''}-${filters.categoria || ''}-${pageNum}`

    const cached = getCachedSearch(cacheKey)
    if (cached) {
      setResultados(cached.rows)
      setTotal(cached.total)
      setTotalPages(cached.totalPages)
      setPage(pageNum)
      setBuscado(true)
      setLoadingBusqueda(false)
      return
    }

    setLoadingBusqueda(true)
    setErrorBusqueda(null)

    try {
      const params = {
        ci_rif: searchTerm,
        page: pageNum,
        limit: 10,
        ...filters,
      }

      const resultado = await buscarPersonasPorCiRif(params)

      if (!controller.signal.aborted) {
        setResultados(resultado.rows || [])
        setTotal(resultado.total || 0)
        setTotalPages(resultado.totalPages || 0)
        setPage(pageNum)
        setBuscado(true)

        setCachedSearch(cacheKey, {
          rows: resultado.rows || [],
          total: resultado.total || 0,
          totalPages: resultado.totalPages || 0,
        })
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setErrorBusqueda(
          err.response?.data?.error || err.message || 'Error al realizar la búsqueda. Intente de nuevo.'
        )
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingBusqueda(false)
      }
    }
  }, [])

  useEffect(() => {
    if (manualSearchRef.current) {
      manualSearchRef.current = false
      return
    }
    if (debouncedNormalized && debouncedNormalized.length >= 1) {
      const filters = {}
      if (tipoPersona) filters.tipo_persona = tipoPersona
      if (estadoDocumento) filters.estado_documento = estadoDocumento
      if (categoria) filters.categoria = categoria

      ejecutarBusqueda(debouncedNormalized, filters, 1)
    }
  }, [debouncedNormalized, tipoPersona, estadoDocumento, categoria, ejecutarBusqueda])

  const handleSubmitBusqueda = (e) => {
    e.preventDefault()
    const normalized = normalizeCiRif(query)
    if (!normalized) return
    manualSearchRef.current = true
    setQuery(normalized)
    const filters = {}
    if (tipoPersona) filters.tipo_persona = tipoPersona
    if (estadoDocumento) filters.estado_documento = estadoDocumento
    if (categoria) filters.categoria = categoria
    ejecutarBusqueda(normalized, filters, 1)
  }

  const handlePageChange = (newPage) => {
    const filters = {}
    if (tipoPersona) filters.tipo_persona = tipoPersona
    if (estadoDocumento) filters.estado_documento = estadoDocumento
    if (categoria) filters.categoria = categoria
    ejecutarBusqueda(debouncedNormalized, filters, newPage)
  }

  const handleLimpiar = () => {
    setQuery('')
    setResultados([])
    setBuscado(false)
    setErrorBusqueda(null)
    setPage(1)
    setTotal(0)
    setTotalPages(0)
    setTipoPersona('')
    setEstadoDocumento('')
    setCategoria('')
    setShowFilters(false)
  }

  const handleRetry = () => {
    const normalized = normalizeCiRif(query)
    if (!normalized) return
    const filters = {}
    if (tipoPersona) filters.tipo_persona = tipoPersona
    if (estadoDocumento) filters.estado_documento = estadoDocumento
    if (categoria) filters.categoria = categoria
    ejecutarBusqueda(normalized, filters, page)
  }

  const handleVerDetalle = async (id_persona) => {
    setModalVisible(true)
    setDetalle(null)
    setErrorDetalle(null)
    setLoadingDetalle(true)

    try {
      const data = await getDetallePersona(id_persona)
      setDetalle(data)
    } catch (err) {
      setErrorDetalle(
        err.response?.data?.error || 'No se pudo cargar el detalle de la persona.'
      )
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleCerrarModal = () => {
    setModalVisible(false)
    setDetalle(null)
    setErrorDetalle(null)
    setPersonaModalId(null)
    setLicenciaModalId(null)
    setSolicitudModalId(null)
  }

  const hasSubModalOpen = !!(personaModalId || licenciaModalId || solicitudModalId)

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          disabled={page === 1 || loadingBusqueda}
          onClick={() => handlePageChange(page - 1)}
        >
          Anterior
        </CButton>

        {startPage > 1 && (
          <>
            <CButton size="sm" color="secondary" variant="outline" disabled={loadingBusqueda} onClick={() => handlePageChange(1)}>1</CButton>
            {startPage > 2 && <span className="text-muted">...</span>}
          </>
        )}

        {pages.map((p) => (
          <CButton
            key={p}
            size="sm"
            color={p === page ? 'primary' : 'secondary'}
            variant={p === page ? 'solid' : 'outline'}
            disabled={loadingBusqueda}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </CButton>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-muted">...</span>}
            <CButton size="sm" color="secondary" variant="outline" disabled={loadingBusqueda} onClick={() => handlePageChange(totalPages)}>{totalPages}</CButton>
          </>
        )}

        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          disabled={page === totalPages || loadingBusqueda}
          onClick={() => handlePageChange(page + 1)}
        >
          Siguiente
        </CButton>
      </div>
    )
  }

  const highlightQuery = showFilters ? debouncedNormalized || normalizeCiRif(query) : normalizeCiRif(query)

  return (
    <CContainer fluid>
      <BuscadorDetalleModal
        visible={modalVisible && !hasSubModalOpen}
        onClose={handleCerrarModal}
        detalle={detalle}
        loading={loadingDetalle}
        error={errorDetalle}
        onOpenPersona={(id) => setPersonaModalId(id)}
        onOpenLicencia={(id) => setLicenciaModalId(id)}
        onOpenSolicitud={(id) => setSolicitudModalId(id)}
      />

      <PersonaDetalleModal idPersona={personaModalId} onClose={() => setPersonaModalId(null)} />
      <LicenciaDetalleModal idLicencia={licenciaModalId} onClose={() => setLicenciaModalId(null)} />
      <SolicitudDetalleModal idSolicitud={solicitudModalId} onClose={() => setSolicitudModalId(null)} />

      {/* ── ESTADO INICIAL (Estilo Google) ── */}
      {!buscado && !loadingBusqueda && !errorBusqueda && (
        <div
          className="d-flex flex-column justify-content-center align-items-center w-100"
          style={{ minHeight: '70vh' }}
        >
          <div className="text-center mb-4">
            <CIcon icon={cilSearch} size="3xl" className="text-primary mb-3" style={{ width: '64px', height: '64px' }} />
            <h1 className="text-primary fw-bold mb-2">Buscador Maestro</h1>
            <p className="text-muted fs-5">
              Ingrese la cédula o RIF para consultar toda la información.
            </p>
          </div>

          <form onSubmit={handleSubmitBusqueda} className="w-100 px-3" style={{ maxWidth: '650px' }}>
            <CInputGroup size="lg" className="shadow-sm">
              <CInputGroupText className="bg-white border-end-0">
                <CIcon icon={cilUser} className="text-primary" />
              </CInputGroupText>
              <CFormInput
                className="border-start-0 border-end-0 shadow-none"
                id="buscador-ci-rif-main"
                type="text"
                placeholder="Ej: V-12345678"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{ fontSize: '1.1rem' }}
              />
              <CButton
                type="submit"
                color="primary"
                disabled={!query.trim()}
                className="px-4 fw-semibold"
              >
                Buscar
              </CButton>
            </CInputGroup>
          </form>
        </div>
      )}

      {/* ── ESTADO CON RESULTADOS / CARGANDO ── */}
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
                  <CInputGroupText className="bg-white">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    id="buscador-ci-rif-header"
                    type="text"
                    placeholder="Ej: V-12345678"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <CButton
                    type="submit"
                    color="primary"
                    disabled={loadingBusqueda || !query.trim()}
                  >
                    {loadingBusqueda ? (
                      <CSpinner size="sm" className="me-2" />
                    ) : (
                      <CIcon icon={cilSearch} className="me-2" />
                    )}
                    Buscar
                  </CButton>
                  <CButton
                    type="button"
                    color="secondary"
                    variant="outline"
                    onClick={handleLimpiar}
                  >
                    Limpiar
                  </CButton>
                </CInputGroup>
              </form>
            </div>
          </CCardHeader>

          <CCardBody>
            {/* Filtros avanzados */}
            <div className="mb-3">
              <CButton
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="mb-2"
              >
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros avanzados'}
              </CButton>

              {showFilters && (
                <CCard className="border">
                  <CCardBody className="py-3">
                    <CRow className="g-3">
                      <CCol md={4}>
                        <CFormLabel>Tipo de Persona</CFormLabel>
                        <CFormSelect
                          value={tipoPersona}
                          onChange={(e) => setTipoPersona(e.target.value)}
                        >
                          <option value="">Todos</option>
                          <option value="natural">Natural</option>
                          <option value="juridica">Jurídica</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Estado de Documento</CFormLabel>
                        <CFormSelect
                          value={estadoDocumento}
                          onChange={(e) => setEstadoDocumento(e.target.value)}
                        >
                          <option value="">Todos</option>
                          <option value="vigente">Vigente</option>
                          <option value="vencido">Vencido</option>
                          <option value="suspendido">Suspendido</option>
                          <option value="anulado">Anulado</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Categoría de Licencia</CFormLabel>
                        <CFormSelect
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                        >
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

            {/* Error de búsqueda */}
            {errorBusqueda && !loadingBusqueda && (
              <CAlert color="danger" className="d-flex justify-content-between align-items-center">
                <span>{errorBusqueda}</span>
                <CButton size="sm" color="light" onClick={handleRetry}>
                  Reintentar
                </CButton>
              </CAlert>
            )}

            {/* Sin resultados */}
            {buscado && !loadingBusqueda && !errorBusqueda && resultados.length === 0 && (
              <CAlert color="info">
                No se encontraron personas con la cédula o RIF <strong>"{query}"</strong>.
              </CAlert>
            )}

            {/* Tabla de resultados */}
            {!loadingBusqueda && !errorBusqueda && resultados.length > 0 && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="text-muted small mb-0">
                    Mostrando <strong>{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</strong> de{' '}
                    <strong>{total}</strong> resultado(s) para{' '}
                    <strong>"{query}"</strong>
                  </p>
                  {(tipoPersona || estadoDocumento || categoria) && (
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      onClick={() => {
                        setTipoPersona('')
                        setEstadoDocumento('')
                        setCategoria('')
                      }}
                    >
                      <CIcon icon={cilFilterX} className="me-1" />
                      Limpiar filtros
                    </CButton>
                  )}
                </div>

                <CTable hover responsive striped align="middle" className="mb-0 border">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>CI / RIF</CTableHeaderCell>
                      <CTableHeaderCell>Nombre / Razón Social</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Teléfono</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Documentos Asignados</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {resultados.map((persona, index) => (
                      <CTableRow key={persona.id_persona}>
                        <CTableDataCell className="text-muted small">
                          {(page - 1) * limit + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          <HighlightText text={persona.ci_rif} highlight={highlightQuery} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <HighlightText text={persona.razon_social} highlight={highlightQuery} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={persona.tipo_persona === 'natural' ? 'info' : 'warning'}>
                            {persona.tipo_persona === 'natural' ? 'Natural' : 'Jurídica'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {persona.telefono || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {persona.email || <span className="text-muted">—</span>}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex flex-column gap-1 align-items-start">
                            {persona.nro_licencia && (
                              <CBadge color="success" shape="rounded-pill">Licencia: {persona.nro_licencia}</CBadge>
                            )}
                            {persona.nro_autorizacion && (
                              <CBadge color="info" shape="rounded-pill">Aut. Esp: {persona.nro_autorizacion}</CBadge>
                            )}
                            {persona.nro_participacion && (
                              <CBadge color="warning" shape="rounded-pill">Part: {persona.nro_participacion}</CBadge>
                            )}
                            {!persona.nro_licencia && !persona.nro_autorizacion && !persona.nro_participacion && (
                              <span className="text-muted small">—</span>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="primary"
                            onClick={() => handleVerDetalle(persona.id_persona)}
                          >
                            Ver
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
