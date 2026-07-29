import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CContainer,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CBadge,
  CAvatar,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import {
  cilMenu,
  cilArrowCircleLeft,
  cilArrowCircleRight,
  cilUser,
  cilSettings,
  cilBell,
  cilLockLocked,
  cilAccountLogout,
  cilEnvelopeOpen,
} from '@coreui/icons'
import { useAuth } from '../modules/auth/store/AuthContext'
import '../styles/layout.css'

/**
 * Header principal del panel de administración.
 *
 * Contiene:
 *  - Toggler de sidebar (izquierda)
 *  - Brand / título del sistema (centro-izquierda)
 *  - Menú hamburguesa con dropdown de opciones (derecha)
 */
const AppHeader = ({ sidebarShow, setSidebarShow }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Iniciales del usuario para el avatar
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase() || 'US'
  }

  const initials = getInitials(user?.nombre_usuario || user?.nombre || '')

  return (
    <CHeader position="sticky" className="app-header p-0 border-bottom">
      <CContainer fluid className="px-4">
        {/* ── IZQUIERDA: Toggler + Brand ─────────── */}
        <button
          className="custom-sidebar-toggler ps-1 ms-2"
          onClick={() => setSidebarShow(!sidebarShow)}
          aria-label="Toggle sidebar"
        >
          <CIcon icon={sidebarShow ? cilArrowCircleLeft : cilArrowCircleRight} size="lg" />
        </button>

        <div className="header-brand ms-3 d-none d-md-flex align-items-center gap-2">
          {/* Se removió el texto y badge por requerimiento del cliente */}
        </div>

        {/* ── ESPACIO CENTRAL ────────────────────── */}
        <div className="flex-grow-1" />

        {/* ── DERECHA: Notificaciones + Hamburger ─ */}
        <CHeaderNav className="align-items-center gap-2">

          {/* Notificaciones */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle
              className="header-icon-btn position-relative"
              caret={false}
              aria-label="Notificaciones"
            >
              <CIcon icon={cilBell} size="lg" />
              <CBadge
                color="danger"
                className="position-absolute top-0 start-100 translate-middle badge-dot"
              />
            </CDropdownToggle>
            <CDropdownMenu className="dropdown-menu-end dropdown-menu-notifications">
              <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
                Notificaciones
              </CDropdownHeader>
              <CDropdownItem href="#">
                <CIcon icon={cilEnvelopeOpen} className="me-2 text-success" />
                Sin nuevas notificaciones
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          {/* ── Menú Hamburguesa de usuario ──────── */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle
              className="header-hamburger-btn d-flex align-items-center gap-2 py-1 px-2"
              caret={false}
              aria-label="Menú de usuario"
            >
              {/* Avatar con iniciales */}
              <div className="header-avatar">
                {initials}
              </div>
              <div className="header-user-info d-none d-md-flex flex-column">
                <span className="header-username fw-semibold">
                  {user?.nombre_usuario || user?.nombre || 'Usuario'}
                </span>
                <span className="header-role text-muted">
                  {user?.rol === 'admin' ? 'Administrador' : 'Empleado'}
                </span>
              </div>
              {/* Ícono hamburguesa */}
              <CIcon icon={cilMenu} size="lg" className="header-hamburger-icon ms-1" />
            </CDropdownToggle>

            <CDropdownMenu className="dropdown-menu-end dropdown-user-menu pt-0" style={{ minWidth: '220px' }}>
              <CDropdownHeader className="bg-body-secondary fw-semibold py-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="header-avatar header-avatar--sm">
                    {initials}
                  </div>
                  <div>
                    <div className="fw-semibold lh-1">
                      {user?.nombre_usuario || 'Usuario'}
                    </div>
                    <small className="text-muted">
                      {user?.rol === 'admin' ? 'Administrador' : 'Empleado'}
                    </small>
                  </div>
                </div>
              </CDropdownHeader>

              <CDropdownItem href="/perfil" className="dropdown-item-icon">
                <CIcon icon={cilUser} className="me-2" />
                Mi Perfil
              </CDropdownItem>

              <CDropdownItem href="/configuracion" className="dropdown-item-icon">
                <CIcon icon={cilSettings} className="me-2" />
                Configuración
              </CDropdownItem>

              <CDropdownItem href="/seguridad" className="dropdown-item-icon">
                <CIcon icon={cilLockLocked} className="me-2" />
                Seguridad
              </CDropdownItem>

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
