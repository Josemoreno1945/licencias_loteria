import AppSidebarNav from './AppSidebarNav'
import { getNavItems } from './_nav'
import { useAuth } from '../modules/auth/store/AuthContext'
import loteriaLogo from '../assets/images/loteria-del-tachira-logo-png_seeklogo-535936.png'
import '../styles/layout.css'

/**
 * Sidebar institucional — fondo azul profundo con logo oficial.
 * Ocupa el alto completo de la pantalla (100vh).
 *
 * El ancho/colapso se controla desde DefaultLayout via `sidebarShow`.
 * Los ítems del menú se filtran por rol desde getNavItems().
 */
const AppSidebar = ({ sidebarShow }) => {
  const { user } = useAuth()
  const navItems = getNavItems(user?.rol)

  return (
    <aside
      className={`app-sidebar ${sidebarShow ? 'app-sidebar--open' : 'app-sidebar--closed'}`}
      aria-label="Navegación principal"
    >
      {/* Cabecera con logo oficial */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrap">
            <img src={loteriaLogo} alt="Lotería del Táchira" className="sidebar-logo" />
          </div>
          <div className="sidebar-brand-text d-flex flex-column lh-1">
            <span className="sidebar-brand-title">Lotería del Táchira</span>
            <span className="sidebar-brand-sub">Gerencia de Productos</span>
          </div>
        </div>
      </div>

      <div className="sidebar-accent" aria-hidden="true" />

      <nav className="sidebar-nav-area">
        <AppSidebarNav items={navItems} />
      </nav>

      <div className="sidebar-footer">
        <small>v1.0 · Sistema de Licencias</small>
      </div>
    </aside>
  )
}

export default AppSidebar
