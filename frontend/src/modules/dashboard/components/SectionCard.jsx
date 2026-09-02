import { CCard, CCardBody, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'

/**
 * Fila simple: etiqueta a la izquierda, valor numérico a la derecha.
 * Sin barras de progreso, sin porcentajes.
 */
const ItemListRow = ({ label, value, isLast }) => (
  <div
    className={`d-flex justify-content-between align-items-center py-2 ${
      isLast ? '' : 'border-bottom border-light-subtle'
    }`}
  >
    <span className="text-body small text-truncate me-2" title={label} style={{ maxWidth: '70%' }}>
      {label}
    </span>
    <span className="fw-semibold text-dark flex-shrink-0">{value}</span>
  </div>
)

/**
 * Card genérica para distribuciones/agrupaciones de métricas.
 * Renderiza una lista limpia de filas, sin barras de progreso.
 */
const SectionCard = ({
  title,
  icon,
  iconColor = '#6384ff',
  items,
  loading,
  labelKey = 'categoria',
  valueKey = 'cantidad',
  emptyMessage = 'Sin datos registrados',
}) => {
  const hasData = Array.isArray(items) && items.length > 0

  return (
    <CCard className="shadow-sm border-0 h-100 section-card">
      <CCardBody className="p-3 p-md-4 d-flex flex-column">
        <h6 className="mb-3 fw-semibold text-dark d-flex align-items-center gap-2">
          {icon && <CIcon icon={icon} style={{ width: 18, height: 18, color: iconColor }} />}
          <span className="text-truncate" title={title}>{title}</span>
        </h6>

        <div className="flex-grow-1">
          {loading ? (
            <div className="text-center py-4">
              <CSpinner size="sm" />
            </div>
          ) : !hasData ? (
            <div className="section-card__empty d-flex align-items-center justify-content-center text-center text-body-secondary small">
              {emptyMessage}
            </div>
          ) : (
            <div>
              {items.map((it, idx) => (
                <ItemListRow
                  key={`${it[labelKey]}-${idx}`}
                  label={it[labelKey] ?? '—'}
                  value={Number(it[valueKey] ?? 0).toLocaleString('es-VE')}
                  isLast={idx === items.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default SectionCard
