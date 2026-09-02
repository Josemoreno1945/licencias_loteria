import CIcon from '@coreui/icons-react'
import { cilBell, cilWarning, cilXCircle } from '@coreui/icons'

const TIPO_LABELS = {
  licencia:      'Licencia',
  autorizacion:  'Autorización',
  participacion: 'Participación',
}

const AlertItem = ({ item }) => {
  const diasRestantes = Math.ceil(
    (new Date(item.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24),
  )
  const urgencyColor = diasRestantes <= 7 ? 'danger' : diasRestantes <= 14 ? 'warning' : 'info'
  const urgencyIcon  = diasRestantes <= 7 ? cilXCircle : diasRestantes <= 14 ? cilWarning : cilBell

  return (
    <div className="d-flex align-items-start gap-3 py-2 border-bottom border-light-subtle">
      <div
        className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-${urgencyColor}-subtle text-${urgencyColor}`}
        style={{ width: 32, height: 32 }}
      >
        <CIcon icon={urgencyIcon} style={{ width: 16, height: 16 }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="small fw-semibold text-dark text-truncate" title={`${TIPO_LABELS[item.tipo]} — ${item.numero_documento}`}>
          {TIPO_LABELS[item.tipo] ?? item.tipo} — {item.numero_documento}
        </div>
        <div className="small text-body-secondary text-truncate" title={item.persona}>
          {item.persona}
        </div>
        <div className="small text-body-secondary">
          Vence: {new Date(item.fecha_vencimiento).toLocaleDateString('es-VE')}{' '}
          <span className={`fw-semibold text-${urgencyColor}`}>({diasRestantes} días)</span>
        </div>
      </div>
    </div>
  )
}

export default AlertItem
