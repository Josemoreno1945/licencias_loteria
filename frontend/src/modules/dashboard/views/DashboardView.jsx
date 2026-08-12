import React, { useMemo } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CProgress,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilUser,
  cilTask,
  cilPaperclip,
  cilBank,
  cilFactory,
  cilClock,
  cilGraph,
  cilMoney,
  cilLayers,
  cilCheckCircle,
  cilXCircle,
  cilWarning,
  cilBell,
} from '@coreui/icons'
import useFetch from '../../../hooks/useFetch'
import './DashboardView.css'

const StatCard = ({ title, value, icon, colorClass, borderColor, subtitle, trend }) => (
  <CCard className={`h-100 shadow-sm border-start border-4 ${borderColor} stat-card`}>
    <CCardBody className="d-flex align-items-center gap-3 py-3">
      <div
        className={`d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 ${colorClass}`}
        style={{ width: 48, height: 48 }}
      >
        <CIcon icon={icon} style={{ width: 22, height: 22, color: '#fff' }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="text-body-secondary small mb-1 text-truncate">{title}</div>
        <div className="fs-3 fw-bold lh-1 text-dark">
          {value === null || value === undefined ? (
            <CSpinner size="sm" />
          ) : (
            value
          )}
        </div>
        {subtitle && <div className="small text-body-secondary mt-1">{subtitle}</div>}
        {trend && (
          <div className={`small fw-semibold mt-1 ${trend > 0 ? 'text-success' : 'text-body-secondary'}`}>
            {trend > 0 ? '+' : ''}{trend}% vs mes anterior
          </div>
        )}
      </div>
    </CCardBody>
  </CCard>
)

const AlertItem = ({ item }) => {
  const diasRestantes = Math.ceil(
    (new Date(item.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)
  )
  const urgencyColor = diasRestantes <= 7 ? 'danger' : diasRestantes <= 14 ? 'warning' : 'info'
  const urgencyIcon = diasRestantes <= 7 ? cilXCircle : diasRestantes <= 14 ? cilWarning : cilBell

  return (
    <div className="d-flex align-items-start gap-3 py-2 border-bottom border-light-subtle">
      <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-${urgencyColor}-subtle text-${urgencyColor}`} style={{ width: 32, height: 32 }}>
        <CIcon icon={urgencyIcon} style={{ width: 16, height: 16 }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="small fw-semibold text-dark text-truncate">
          {item.tipo === 'licencia' ? 'Licencia' : item.tipo === 'autorizacion' ? 'Autorización' : 'Participación'} — {item.numero_documento}
        </div>
        <div className="small text-body-secondary text-truncate">{item.persona}</div>
        <div className="small text-body-secondary">
          Vence: {new Date(item.fecha_vencimiento).toLocaleDateString('es-VE')} <span className={`fw-semibold text-${urgencyColor}`}>({diasRestantes} días)</span>
        </div>
      </div>
    </div>
  )
}

const ProgressBar = ({ categories }) => {
  const total = categories.reduce((sum, cat) => sum + cat.cantidad, 0)
  const colors = ['primary', 'success', 'info', 'warning', 'danger']

  return (
    <div className="mt-3">
      {categories.map((cat, idx) => (
        <div key={cat.categoria} className="mb-2">
          <div className="d-flex justify-content-between small mb-1">
            <span className="text-body fw-medium text-truncate" style={{ maxWidth: '60%' }}>{cat.categoria}</span>
            <span className="text-body-secondary fw-semibold">{cat.cantidad}</span>
          </div>
          <CProgress
            value={total ? (cat.cantidad / total) * 100 : 0}
            color={colors[idx % colors.length]}
            className="progress-sm"
            style={{ height: 6 }}
          />
        </div>
      ))}
    </div>
  )
}

const DashboardView = () => {
  const { data: resumen, loading: loadingResumen } = useFetch('/dashboard/resumen')
  const { data: proximos, loading: loadingProximos } = useFetch('/dashboard/proximos-vencer')
  const { data: licenciasCat, loading: loadingLicCat } = useFetch('/dashboard/licencias-por-categoria')

  const personas = useMemo(() => resumen || {}, [resumen])

  return (
    <CContainer fluid className="px-3 px-md-4">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h4 className="mb-1 fw-bold text-dark">Panel de Control</h4>
          <p className="text-body-secondary mb-0 small">
            Resumen general del sistema — Lotería del Táchira
          </p>
        </div>
        <div className="text-body-secondary small d-flex align-items-center gap-2">
          <CIcon icon={cilClock} style={{ width: 14, height: 14 }} />
          {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Fila 1: KPIs Operativos Prioritarios */}
      <div className="mb-2">
        <p className="text-uppercase fw-semibold text-body-secondary small mb-3" style={{ letterSpacing: '0.08em' }}>
          Indicadores Clave
        </p>
      </div>
      <CRow className="g-3 mb-4">
        <CCol sm={6} xl={3}>
          <StatCard
            title="Solicitudes Pendientes"
            value={loadingResumen ? null : personas.solicitudes_pendientes}
            icon={cilTask}
            colorClass="bg-warning"
            borderColor="border-start-warning"
            subtitle="Requieren atención"
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Licencias Vigentes"
            value={loadingResumen ? null : personas.licencias_vigentes}
            icon={cilCheckCircle}
            colorClass="bg-success"
            borderColor="border-start-success"
            subtitle={`de ${personas.total_licencias ?? 0} totales`}
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Total Personas"
            value={loadingResumen ? null : personas.total_personas}
            icon={cilPeople}
            colorClass="bg-primary"
            borderColor="border-start-primary"
            subtitle={`${personas.personas_naturales ?? 0} natural · ${personas.personas_juridicas ?? 0} jurídica`}
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Total Recaudado"
            value={loadingResumen ? null : `$${Number(personas.total_recaudado ?? 0).toLocaleString('es-VE')}`}
            icon={cilMoney}
            colorClass="bg-info"
            borderColor="border-start-info"
          />
        </CCol>
      </CRow>

      {/* Fila 2: Métricas Secundarias */}
      <div className="mb-2">
        <p className="text-uppercase fw-semibold text-body-secondary small mb-3" style={{ letterSpacing: '0.08em' }}>
          Entidades del Sistema
        </p>
      </div>
      <CRow className="g-3 mb-4">
        <CCol sm={6} xl={3}>
          <StatCard
            title="Operadoras"
            value={loadingResumen ? null : personas.total_operadoras}
            icon={cilFactory}
            colorClass="bg-dark"
            borderColor="border-start-dark"
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Bancos Registrados"
            value={loadingResumen ? null : personas.total_bancos}
            icon={cilBank}
            colorClass="bg-secondary"
            borderColor="border-start-secondary"
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Centros de Apuesta"
            value={loadingResumen ? null : personas.centros_activos}
            icon={cilLayers}
            colorClass="bg-primary"
            borderColor="border-start-primary"
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard
            title="Usuarios del Sistema"
            value={loadingResumen ? null : personas.total_usuarios}
            icon={cilUser}
            colorClass="bg-info"
            borderColor="border-start-info"
          />
        </CCol>
      </CRow>

      {/* Fila 3: Documentos + Distribución */}
      <CRow className="g-3 mb-4">
        {/* Documentos Emitidos */}
        <CCol lg={5}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-0 py-3">
              <h6 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                <CIcon icon={cilPaperclip} style={{ width: 18, height: 18, color: '#6384ff' }} />
                Documentos Emitidos
              </h6>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol sm={4}>
                  <div className="text-center p-3 rounded-3 bg-primary-subtle">
                    <div className="fs-4 fw-bold text-primary">{loadingResumen ? <CSpinner size="sm" /> : personas.total_licencias ?? 0}</div>
                    <div className="small text-body-secondary mt-1">Licencias</div>
                  </div>
                </CCol>
                <CCol sm={4}>
                  <div className="text-center p-3 rounded-3 bg-success-subtle">
                    <div className="fs-4 fw-bold text-success">{loadingResumen ? <CSpinner size="sm" /> : personas.total_participaciones ?? 0}</div>
                    <div className="small text-body-secondary mt-1">Participaciones</div>
                  </div>
                </CCol>
                <CCol sm={4}>
                  <div className="text-center p-3 rounded-3 bg-danger-subtle">
                    <div className="fs-4 fw-bold text-danger">{loadingResumen ? <CSpinner size="sm" /> : personas.total_autorizaciones ?? 0}</div>
                    <div className="small text-body-secondary mt-1">Autorizaciones</div>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Distribución por Categoría */}
        <CCol lg={7}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-0 py-3">
              <h6 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                <CIcon icon={cilGraph} style={{ width: 18, height: 18, color: '#6384ff' }} />
                Licencias por Categoría
              </h6>
            </CCardHeader>
            <CCardBody>
              {loadingLicCat ? (
                <div className="text-center py-4"><CSpinner /></div>
              ) : (
                <ProgressBar categories={licenciasCat || []} />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Fila 4: Próximos a Vencer */}
      <CRow className="g-3">
        <CCol lg={12}>
          <CCard className="shadow-sm border-0 h-100">
            <CCardHeader className="bg-white border-0 py-3">
              <h6 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                <CIcon icon={cilWarning} style={{ width: 18, height: 18, color: '#f59f00' }} />
                Próximos a Vencer (30 días)
                {proximos && proximos.length > 0 && (
                  <CBadge color="warning" className="ms-auto">{proximos.length}</CBadge>
                )}
              </h6>
            </CCardHeader>
            <CCardBody className="p-0">
              {loadingProximos ? (
                <div className="text-center py-4"><CSpinner /></div>
              ) : proximos && proximos.length > 0 ? (
                <div className="px-4">
                  {proximos.slice(0, 6).map((item, idx) => (
                    <AlertItem key={`${item.tipo}-${item.id}-${idx}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-body-secondary small">
                  No hay documentos próximos a vencer
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default DashboardView
