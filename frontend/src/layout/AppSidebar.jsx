import { NavLink } from 'react-router-dom'
import { CIcon } from '@coreui/icons-react'
import { cilDiamond } from '@coreui/icons'
import AppSidebarNav from './AppSidebarNav'
import { getNavItems } from './_nav'
import { useAuth } from '../modules/auth/store/AuthContext'
import '../styles/layout.css'

/**
 * Sidebar colapsable — NO usa position:fixed de CoreUI.
 * Se maneja como un flex item que empuja el contenido principal.
 *
 * Los ítems del nav se filtran según el rol del usuario autenticado.
 * Roles (bdd.sql): superAdmin | gerente | gestor_de_tramites | supervisor
 */
const AppSidebar = ({ sidebarShow, setSidebarShow }) => {
  const { user } = useAuth()

  // Genera los ítems de navegación filtrados por rol
  const navItems = getNavItems(user?.rol)

  return (
    <>
      {/* ── SIDEBAR PANEL ─────────────────────────── */}
      <aside className={`app-sidebar ${sidebarShow ? 'app-sidebar--open' : 'app-sidebar--closed'}`}>

        {/* Brand / Logo */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <CIcon icon={cilDiamond} className="sidebar-brand-icon" height={26} />
            <span className="sidebar-brand-text">Lotería&nbsp;Admin</span>
          </div>
        </div>

        {/* Navegación — scroll suave sin scrollbar visible */}
        <nav className="sidebar-nav-area">
          <AppSidebarNav items={navItems} />
        </nav>

      </aside>
    </>
  )
}

export default AppSidebar
