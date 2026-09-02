import { useNavigate } from 'react-router-dom'
import {
  CHeader,
  CHeaderNav,
  CContainer,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CBadge,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import {
  cilMenu,
  cilArrowCircleLeft,
  cilArrowCircleRight,
  cilEnvelopeOpen,
  cilAccountLogout,
} from '@coreui/icons'
import { useAuth } from '../modules/auth/store/AuthContext'
import '../styles/layout.css'

const ROLE_LABELS = {
  superAdmin:         'Super Administrador',
  gerente:            'Gerente',
  gestor_de_tramites: 'Gestor de Trámites',
  supervisor:         'Supervisor',
}

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'US'
}

const AppHeader = ({ sidebarShow, setSidebarShow }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = getInitials(user?.nombre_usuario || user?.nombre || '')
  const displayName = user?.nombre_usuario || user?.nombre || 'Usuario'
  const displayRole = ROLE_LABELS[user?.rol] ?? user?.rol ?? 'Usuario'

  return (
    <CHeader position="sticky" className="app-header p-0">
      <CContainer fluid className="px-3 px-md-4">
        {/* ── IZQUIERDA: Toggler ─────────── */}
        <button
          type="button"
          className="custom-sidebar-toggler ms-n1"
          onClick={() => setSidebarShow(!sidebarShow)}
          aria-label={sidebarShow ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
        >
          <CIcon icon={sidebarShow ? cilArrowCircleLeft : cilArrowCircleRight} size="lg" />
        </button>

        <div className="flex-grow-1" />

        {/* ── DERECHA: Notificaciones + Usuario ─ */}
        <CHeaderNav className="align-items-center gap-1">

          {/* Notificaciones */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle
              className="header-icon-btn position-relative"
              caret={false}
              aria-label="Notificaciones"
            >
              <CIcon icon={cilEnvelopeOpen} size="lg" />
              <CBadge color="danger" className="badge-dot" />
            </CDropdownToggle>
            <CDropdownMenu className="dropdown-menu-end dropdown-menu-notifications">
              <CDropdownHeader className="bg-body-secondary fw-semibold">
                Notificaciones
              </CDropdownHeader>
              <CDropdownItem>
                <span className="text-body-secondary small">
                  Sin nuevas notificaciones
                </span>
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          {/* Usuario */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle
              className="header-hamburger-btn d-flex align-items-center gap-2 py-1 px-2"
              caret={false}
              aria-label="Menú de usuario"
            >
              <div className="header-avatar">{initials}</div>
              <div className="header-user-info d-none d-md-flex flex-column text-start">
                <span className="header-username">{displayName}</span>
                <span className="header-role">{displayRole}</span>
              </div>
              <CIcon icon={cilMenu} size="lg" className="header-hamburger-icon ms-1" />
            </CDropdownToggle>

            <CDropdownMenu
              className="dropdown-menu-end dropdown-user-menu pt-0"
              style={{ minWidth: '240px' }}
            >
              <CDropdownHeader className="bg-body-secondary fw-semibold py-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="header-avatar header-avatar--sm">{initials}</div>
                  <div className="min-w-0">
                    <div className="fw-semibold lh-1 text-truncate">{displayName}</div>
                    <small className="text-muted">{displayRole}</small>
                  </div>
                </div>
              </CDropdownHeader>

              <CDropdownDivider />

              <CDropdownItem
                onClick={handleLogout}
                className="dropdown-item-icon text-danger"
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={cilAccountLogout} className="me-2" />
                Cerrar Sesión
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
