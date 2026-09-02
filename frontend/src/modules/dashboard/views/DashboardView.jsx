import { CContainer, CRow, CCol, CCard, CCardBody, CCardHeader, CSpinner, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTask,
  cilCheckCircle,
  cilMoney,
  cilWarning,
  cilPaperclip,
  cilGraph,
  cilDescription,
  cilBriefcase,
  cilClipboard,
} from '@coreui/icons'

import useFetch from '../../../hooks/useFetch'
import StatCard from '../components/StatCard'
import AlertItem from '../components/AlertItem'
import SectionCard from '../components/SectionCard'

import './DashboardView.css'

/* ============================================================
   Helpers de formato
   ============================================================ */
const fmtBs = (value) =>
  `Bs. ${Number(value ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtInt = (value) => Number(value ?? 0).toLocaleString('es-VE')

/* ============================================================
   Componentes internos ultra-minimalistas
   ============================================================ */

/**
 * ProductSummary: tarjeta de "Totales por Producto".
 * SOLO icono + nombre + cifra total grande. Sin badges ni subtítulos.
 */
const ProductSummary = ({ icon, iconColor, name, value, loading }) => (
  <CCard className="shadow-sm border-0 h-100 product-summary">
    <CCardBody className="p-3 d-flex align-items-center gap-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        style={{ width: 44, height: 44, backgroundColor: iconColor + '1A' }}
      >
        <CIcon icon={icon} style={{ width: 22, height: 22, color: iconColor }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="text-body-secondary small mb-1 text-truncate" title={name}>
          {name}
        </div>
        <div className="fs-2 fw-bold text-dark lh-1 product-summary__value">
          {loading ? <CSpinner size="sm" /> : fmtInt(value)}
        </div>
      </div>
    </CCardBody>
  </CCard>
)

/* ============================================================
   Vista principal
   ============================================================ */
const DashboardView = () => {
  const { data: resumen,     loading: loadingResumen }       = useFetch('/dashboard/resumen')
  const { data: proximos,    loading: loadingProximos }      = useFetch('/dashboard/proximos-vencer')

  const { data: licCat,      loading: loadingLicCat }        = useFetch('/dashboard/licencias-por-categoria')
  const { data: licEstado,   loading: loadingLicEstado }     = useFetch('/dashboard/licencias-por-estado')
  const { data: licEmision,  loading: loadingLicEmision }    = useFetch('/dashboard/licencias-por-tipo-emision')

  const { data: solEstado,   loading: loadingSolEstado }     = useFetch('/dashboard/solicitudes-por-estado')
  const { data: solTipo,     loading: loadingSolTipo }       = useFetch('/dashboard/solicitudes-por-tipo-tramite')

  const { data: parTipo,     loading: loadingParTipo }       = useFetch('/dashboard/participaciones-por-tipo')
  const { data: parEstado,   loading: loadingParEstado }     = useFetch('/dashboard/participaciones-por-estado')

  const { data: autTipo,     loading: loadingAutTipo }       = useFetch('/dashboard/autorizaciones-por-tipo')
  const { data: autEstado,   loading: loadingAutEstado }     = useFetch('/dashboard/autorizaciones-por-estado')

  const r = resumen || {}

  const totalDocumentosVigentes =
    (r.licencias_vigentes ?? 0) +
    (r.participaciones_vigentes ?? 0) +
    (r.autorizaciones_vigentes ?? 0)

  return (
    <CContainer fluid className="px-3 px-md-4 pb-4">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div className="min-w-0">
          <h4 className="mb-1 fw-bold text-dark text-truncate">Panel de Control</h4>
          <p className="text-body-secondary mb-0 small text-truncate">
            Resumen de productos — Lotería del Táchira
          </p>
        </div>
        <div className="text-body-secondary small text-nowrap">
          {new Date().toLocaleDateString('es-VE', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
      </div>

      {/* ====== Indicadores Clave ====== */}
      <p className="section-label">Indicadores Clave</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Solicitudes Pendientes"
            value={loadingResumen ? null : fmtInt(r.solicitudes_pendientes)}
            icon={cilTask}
            color="warning"
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Licencias Vigentes"
            value={loadingResumen ? null : fmtInt(r.licencias_vigentes)}
            icon={cilCheckCircle}
            color="success"
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Documentos Vigentes"
            value={loadingResumen ? null : fmtInt(totalDocumentosVigentes)}
            icon={cilPaperclip}
            color="primary"
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <StatCard
            title="Total Recaudado"
            value={loadingResumen ? null : fmtBs(r.total_recaudado)}
            icon={cilMoney}
            color="info"
            isMoney
          />
        </CCol>
      </CRow>

      {/* ====== Totales por Producto (ultra minimalista) ====== */}
      <p className="section-label">Totales por Producto</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilDescription}
            iconColor="#f59f00"
            name="Solicitudes"
            value={r.solicitudes_total}
            loading={loadingResumen}
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilClipboard}
            iconColor="#6384ff"
            name="Licencias"
            value={r.licencias_total}
            loading={loadingResumen}
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilBriefcase}
            iconColor="#198754"
            name="Participaciones"
            value={r.participaciones_total}
            loading={loadingResumen}
          />
        </CCol>
        <CCol xs={12} sm={6} xl={3}>
          <ProductSummary
            icon={cilPaperclip}
            iconColor="#dc3545"
            name="Autorizaciones"
            value={r.autorizaciones_total}
            loading={loadingResumen}
          />
        </CCol>
      </CRow>

      {/* ====== Desglose: Solicitudes (2 columnas) ====== */}
      <p className="section-label">Solicitudes</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={6}>
          <SectionCard
            title="Por Estado"
            icon={cilTask}
            iconColor="#f59f00"
            items={solEstado}
            loading={loadingSolEstado}
            labelKey="estado"
          />
        </CCol>
        <CCol xs={12} lg={6}>
          <SectionCard
            title="Por Tipo de Trámite"
            icon={cilDescription}
            iconColor="#6384ff"
            items={solTipo}
            loading={loadingSolTipo}
            labelKey="tipo_tramite"
          />
        </CCol>
      </CRow>

      {/* ====== Desglose: Licencias (3 columnas) ====== */}
      <p className="section-label">Licencias</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Categoría"
            icon={cilGraph}
            iconColor="#6384ff"
            items={licCat}
            loading={loadingLicCat}
            labelKey="categoria"
          />
        </CCol>
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Estado del Documento"
            icon={cilCheckCircle}
            iconColor="#198754"
            items={licEstado}
            loading={loadingLicEstado}
            labelKey="estado"
          />
        </CCol>
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Tipo de Emisión"
            icon={cilClipboard}
            iconColor="#0dcaf0"
            items={licEmision}
            loading={loadingLicEmision}
            labelKey="tipo_emision"
          />
        </CCol>
      </CRow>

      {/* ====== Desglose: Participaciones (3 columnas) ====== */}
      <p className="section-label">Participaciones</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Tipo"
            icon={cilBriefcase}
            iconColor="#198754"
            items={parTipo}
            loading={loadingParTipo}
            labelKey="tipo_participacion"
          />
        </CCol>
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Estado del Documento"
            icon={cilCheckCircle}
            iconColor="#0dcaf0"
            items={parEstado}
            loading={loadingParEstado}
            labelKey="estado"
          />
        </CCol>
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Tipo de Emisión"
            icon={cilClipboard}
            iconColor="#9ca3af"
            items={[]}
            loading={false}
            labelKey="tipo_emision"
            emptyMessage="Sin emisiones registradas"
          />
        </CCol>
      </CRow>

      {/* ====== Desglose: Autorizaciones Especiales (3 columnas) ====== */}
      <p className="section-label">Autorizaciones Especiales</p>
      <CRow className="g-3 mb-4">
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Categoría"
            icon={cilGraph}
            iconColor="#dc3545"
            items={[]}
            loading={false}
            labelKey="categoria"
            emptyMessage="Sin categorías registradas"
          />
        </CCol>
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Estado del Documento"
            icon={cilCheckCircle}
            iconColor="#f59f00"
            items={autEstado}
            loading={loadingAutEstado}
            labelKey="estado"
          />
        </CCol>
        <CCol xs={12} lg={4}>
          <SectionCard
            title="Por Tipo / Emisión"
            icon={cilClipboard}
            iconColor="#dc3545"
            items={autTipo}
            loading={loadingAutTipo}
            labelKey="tipo"
          />
        </CCol>
      </CRow>

      {/* ====== Próximos a Vencer ====== */}
      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="shadow-sm border-0">
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
                <div className="px-3 px-md-4">
                  {proximos.slice(0, 6).map((item, idx) => (
                    <AlertItem
                      key={`${item.tipo}-${item.numero_documento}-${idx}`}
                      item={item}
                    />
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
