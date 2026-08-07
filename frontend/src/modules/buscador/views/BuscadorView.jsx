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

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0">
          <div className="d-flex align-items-center gap-2 mb-1">
            <CIcon icon={cilSearch} className="text-primary" />
            <h4 className="mb-0 text-primary">Buscador / Consultor</h4>
          </div>
          <p className="text-muted small mb-3">
            Ingrese la cédula o RIF de la persona para consultar toda la información asociada.
          </p>

          {/* ── Barra de búsqueda ── */}
          <form onSubmit={handleBuscar} className="mb-3">
            <div className="d-flex gap-2" style={{ maxWidth: '520px' }}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  id="buscador-ci-rif"
                  type="text"
                  placeholder="Ej: V-12345678"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </CInputGroup>
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
              {buscado && (
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
              )}
            </div>
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
              <p className="text-muted small mb-2">
                Se encontraron <strong>{resultados.length}</strong> resultado(s) para{' '}
                <strong>"{query}"</strong>.
              </p>
              <CTable hover responsive striped align="middle" className="mb-0">
                <CTableHead>
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

          {/* Estado inicial — antes de buscar */}
          {!buscado && !loadingBusqueda && !errorBusqueda && (
            <div className="text-center text-muted py-5">
              <CIcon icon={cilSearch} size="xl" className="mb-3 opacity-50" />
              <p className="mb-0">Ingrese una cédula o RIF y presione <strong>Buscar</strong> para consultar.</p>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default BuscadorView
