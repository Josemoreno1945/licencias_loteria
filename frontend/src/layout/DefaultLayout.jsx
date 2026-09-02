import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import '../styles/layout.css'

/**
 * DefaultLayout — Panel de administración.
 *
 * Arquitectura clásica de admin (sidebar a pantalla completa):
 *
 *   ┌────────┬────────────────────────────────────────────┐
 *   │        │  AppHeader (sticky, blanco, shadow)        │
 *   │ Side-  ├────────────────────────────────────────────┤
 *   │  bar   │                                            │
 *   │ (full  │   <Outlet />                               │
 *   │  vh)   │   (contenido de la ruta activa)            │
 *   │        │                                            │
 *   └────────┴────────────────────────────────────────────┘
 */
const DefaultLayout = () => {
  const [sidebarShow, setSidebarShow] = useState(true)

  return (
    <div className="admin-layout">
      <AppSidebar sidebarShow={sidebarShow} />

      <div className="admin-shell">
        <AppHeader sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
        <main className="admin-main">
          <div className="admin-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DefaultLayout
