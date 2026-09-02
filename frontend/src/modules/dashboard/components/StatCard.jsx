import { CCard, CCardBody, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'

const COLOR_MAP = {
  primary:   { bg: 'bg-primary',   border: 'border-start-primary' },
  success:   { bg: 'bg-success',   border: 'border-start-success' },
  danger:    { bg: 'bg-danger',    border: 'border-start-danger' },
  warning:   { bg: 'bg-warning',   border: 'border-start-warning' },
  info:      { bg: 'bg-info',      border: 'border-start-info' },
  secondary: { bg: 'bg-secondary', border: 'border-start-secondary' },
}

const StatCard = ({ title, value, icon, color = 'primary', isMoney = false, subtitle, trend }) => {
  const palette = COLOR_MAP[color] ?? COLOR_MAP.primary
  const valueClass = isMoney ? 'stat-card__value stat-card__value--money' : 'stat-card__value'

  return (
    <CCard className={`h-100 shadow-sm border-start border-4 ${palette.border} stat-card`}>
      <CCardBody className="d-flex align-items-center gap-3 py-3">
        <div
          className={`d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 ${palette.bg}`}
          style={{ width: 48, height: 48 }}
        >
          {icon && <CIcon icon={icon} style={{ width: 22, height: 22, color: '#fff' }} />}
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="text-body-secondary small mb-1 text-truncate" title={title}>
            {title}
          </div>
          <div className={`fw-bold lh-1 text-dark ${valueClass}`}>
            {value === null || value === undefined ? (
              <CSpinner size="sm" />
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <div className="small text-body-secondary mt-1 text-truncate" title={subtitle}>
              {subtitle}
            </div>
          )}
          {typeof trend === 'number' && (
            <div className={`small fw-semibold mt-1 ${trend > 0 ? 'text-success' : 'text-body-secondary'}`}>
              {trend > 0 ? '+' : ''}
              {trend}% vs mes anterior
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default StatCard
