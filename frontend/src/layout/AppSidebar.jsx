import { NavLink } from 'react-router-dom'
import { CIcon } from '@coreui/icons-react'
import { cilDiamond, cilChevronLeft } from '@coreui/icons'
import AppSidebarNav from './AppSidebarNav'
import _nav from './_nav'
import '../styles/layout.css'

/**
 * Sidebar colapsable — NO usa position:fixed de CoreUI.
 * Se maneja como un flex item que empuja el contenido principal.
 */
const AppSidebar = ({ sidebarShow, setSidebarShow }) => {
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
          <AppSidebarNav items={_nav} />
        </nav>

      </aside>

      {/* (Botón flotante removido a petición del usuario) */}
    </>
  )
}

export default AppSidebar
