import React, { useState } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilUser } from '@coreui/icons'

import { buscarPersonasPorCiRif, getDetallePersona } from '../services/buscador.service'
import BuscadorDetalleModal from '../components/BuscadorDetalleModal'
import PersonaDetalleModal from '../../personas/components/PersonaDetalleModal'
import LicenciaDetalleModal from '../../licencias/components/LicenciaDetalleModal'
import SolicitudDetalleModal from '../../solicitudes/components/SolicitudDetalleModal'

const BuscadorView = () => {
  const [query, setQuery]         = useState('')
  const [resultados, setResultados] = useState([])
  const [loadingBusqueda, setLoadingBusqueda] = useState(false)
  const [errorBusqueda, setErrorBusqueda]     = useState(null)
  const [buscado, setBuscado]     = useState(false)

  // Estado del modal de detalle
  const [modalVisible, setModalVisible] = useState(false)
  const [detalle, setDetalle]     = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle]     = useState(null)

  // Estados para los modales anidados
  const [personaModalId, setPersonaModalId]     = useState(null)
  const [licenciaModalId, setLicenciaModalId]   = useState(null)
  const [solicitudModalId, setSolicitudModalId] = useState(null)

  const handleBuscar = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoadingBusqueda(true)
    setErrorBusqueda(null)
    setResultados([])
    setBuscado(false)

    try {
      const rows = await buscarPersonasPorCiRif(query.trim())
      setResultados(rows)
      setBuscado(true)
    } catch (err) {
      setErrorBusqueda(
        err.response?.data?.error || 'Error al realizar la búsqueda. Intente de nuevo.'
      )
    } finally {
      setLoadingBusqueda(false)
    }
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

  // Determinar si hay un sub-modal abierto
  const hasSubModalOpen = !!(personaModalId || licenciaModalId || solicitudModalId)

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

      {/* Modales Anidados */}
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

          <form onSubmit={handleBuscar} className="w-100 px-3" style={{ maxWidth: '650px' }}>
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

            <form onSubmit={handleBuscar} className="flex-grow-1" style={{ maxWidth: '520px' }}>
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
                  onClick={() => {
                    setQuery('')
                    setResultados([])
                    setBuscado(false)
                    setErrorBusqueda(null)
                  }}
                >
                  Limpiar
                </CButton>
              </CInputGroup>
            </form>
          </CCardHeader>

          <CCardBody>
            {/* Error de búsqueda */}
            {errorBusqueda && !loadingBusqueda && (
              <CAlert color="danger">{errorBusqueda}</CAlert>
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
                <p className="text-muted small mb-3">
                  Se encontraron <strong>{resultados.length}</strong> resultado(s) para{' '}
                  <strong>"{query}"</strong>.
                </p>
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
                          {index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold">
                          {persona.ci_rif}
                        </CTableDataCell>
                        <CTableDataCell>{persona.razon_social}</CTableDataCell>
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
              </>
            )}
          </CCardBody>
        </CCard>
      )}
    </CContainer>
  )
}

export default BuscadorView
