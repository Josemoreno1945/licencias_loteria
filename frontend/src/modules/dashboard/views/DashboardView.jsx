import React from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilUser,
  cilBuilding,
  cilTask,
  cilPaperclip,
  cilShieldAlt,
  cilBank,
  cilFactory,
} from '@coreui/icons'
import useFetch from '../../../hooks/useFetch'

// Tarjeta de estadistica individual
const StatCard = ({ title, value, icon, colorClass, borderColor }) => (
  <CCard className={`h-100 shadow-sm border-top-3 ${borderColor}`}>
    <CCardBody className="d-flex align-items-center gap-3">
      <div
        className={`d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 ${colorClass}`}
        style={{ width: 52, height: 52 }}
      >
        <CIcon icon={icon} style={{ width: 24, height: 24, color: '#fff' }} />
      </div>
      <div>
        <div className="text-body-secondary small mb-1">{title}</div>
        <div className="fs-3 fw-bold lh-1">
          {value === null || value === undefined ? (
            <CSpinner size="sm" />
          ) : (
            value
          )}
        </div>
      </div>
    </CCardBody>
  </CCard>
)

const DashboardView = () => {
  const { data: personas, loading: loadingPersonas }     = useFetch('/personas')
  const { data: usuarios, loading: loadingUsuarios }     = useFetch('/usuarios')
  const { data: operadoras, loading: loadingOperadoras } = useFetch('/operadoras')
  const { data: bancos, loading: loadingBancos }         = useFetch('/bancos')
  const { data: licencias, loading: loadingLicencias }   = useFetch('/licencias')
  const { data: participaciones, loading: loadingPar }   = useFetch('/participaciones')
  const { data: autorizaciones, loading: loadingAut }    = useFetch('/autorizaciones-especiales')

  // Derivados de personas
  const totalPersonas   = personas?.length ?? null
  const personasNat     = personas?.filter(p => p.tipo_persona === 'natural').length ?? null
  const personasJur     = personas?.filter(p => p.tipo_persona === 'juridica').length ?? null

  const totalUsuarios   = loadingUsuarios   ? null : (usuarios?.length ?? 0)
  const totalOperadoras = loadingOperadoras ? null : (operadoras?.length ?? 0)
  const totalBancos     = loadingBancos     ? null : (bancos?.length ?? 0)
  const totalLicencias  = loadingLicencias  ? null : (licencias?.length ?? 0)
  const totalPar        = loadingPar        ? null : (participaciones?.length ?? 0)
  const totalAut        = loadingAut        ? null : (autorizaciones?.length ?? 0)

  return (
    <CContainer fluid>
      {/* Encabezado */}
      <div className="mb-4">
        <h4 className="mb-1 fw-bold text-dark">Panel de Control</h4>
        <p className="text-body-secondary mb-0 small">
          Resumen general del sistema — Loteria del Tachira
        </p>
      </div>

      {/* Fila 1: Personas */}
      <div className="mb-2">
        <p className="text-uppercase fw-semibold text-body-secondary small mb-3" style={{ letterSpacing: '0.08em' }}>
          Personas
        </p>
      </div>
      <CRow className="g-3 mb-4">
        <CCol sm={6} xl={4}>
          <StatCard
            title="Total Personas Registradas"
            value={loadingPersonas ? null : totalPersonas}
            icon={cilPeople}
            colorClass="bg-primary"
            borderColor="border-top-primary"
          />
        </CCol>
        <CCol sm={6} xl={4}>
          <StatCard
            title="Personas Naturales"
            value={loadingPersonas ? null : personasNat}
            icon={cilUser}
            colorClass="bg-info"
            borderColor="border-top-info"
          />
        </CCol>
        <CCol sm={6} xl={4}>
          <StatCard
            title="Personas Juridicas"
            value={loadingPersonas ? null : personasJur}
            icon={cilBuilding}
            colorClass="bg-warning"
            borderColor="border-top-warning"
          />
        </CCol>
      </CRow>

      {/* Fila 2: Entidades del sistema */}
      <div className="mb-2">
        <p className="text-uppercase fw-semibold text-body-secondary small mb-3" style={{ letterSpacing: '0.08em' }}>
          Entidades
        </p>
      </div>
      <CRow className="g-3 mb-4">
        <CCol sm={6} xl={3}>
          <StatCard
            title="Operadoras"
            value={totalOperadoras}
            icon={cilFactory}
            colorClass="bg-success"
            borderColor="border-top-success"
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Usuarios del Sistema"
            value={totalUsuarios}
            icon={cilUser}
            colorClass="bg-secondary"
            borderColor="border-top-secondary"
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Bancos Registrados"
            value={totalBancos}
            icon={cilBank}
            colorClass="bg-dark"
            borderColor="border-top-dark"
          />
        </CCol>
      </CRow>

      {/* Fila 3: Documentos */}
      <div className="mb-2">
        <p className="text-uppercase fw-semibold text-body-secondary small mb-3" style={{ letterSpacing: '0.08em' }}>
          Documentos Emitidos
        </p>
      </div>
      <CRow className="g-3">
        <CCol sm={6} xl={4}>
          <StatCard
            title="Licencias"
            value={totalLicencias}
            icon={cilTask}
            colorClass="bg-primary"
            borderColor="border-top-primary"
          />
        </CCol>
        <CCol sm={6} xl={4}>
          <StatCard
            title="Participaciones"
            value={totalPar}
            icon={cilPaperclip}
            colorClass="bg-success"
            borderColor="border-top-success"
          />
        </CCol>
        <CCol sm={6} xl={4}>
          <StatCard
            title="Autorizaciones Especiales"
            value={totalAut}
            icon={cilShieldAlt}
            colorClass="bg-danger"
            borderColor="border-top-danger"
          />
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default DashboardView
