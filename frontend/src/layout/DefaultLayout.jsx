import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import '../styles/layout.css'

/**
 * DefaultLayout — Hub principal del panel de administración.
 *
 * Layout con flexbox: sidebar + contenido en fila.
 * El sidebar NO está en position:fixed, empuja el contenido lateralmente.
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │  AppHeader (sticky, cubre todo el ancho)         │
 *   ├──────────────┬───────────────────────────────────┤
 *   │  AppSidebar  │   <Outlet />                      │
 *   │  (flex item) │   (contenido de cada ruta)        │
 *   └──────────────┴───────────────────────────────────┘
 */
const DefaultLayout = () => {
  const [sidebarShow, setSidebarShow] = useState(true)

  return (
    <div className="admin-layout">

      {/* ── HEADER sticky arriba de todo ── */}
      <AppHeader
        sidebarShow={sidebarShow}
        setSidebarShow={setSidebarShow}
      />

      {/* ── FILA: sidebar + contenido ── */}
      <div className="admin-body">

        {/* Sidebar colapsable */}
        <AppSidebar
          sidebarShow={sidebarShow}
          setSidebarShow={setSidebarShow}
        />

        {/* Área central — vacía, lista para el contenido */}
        <main className="admin-main">
          {/*
            ╔══════════════════════════════════════════════╗
            ║  ÁREA CENTRAL — RESERVADA PARA VISTAS HIJAS  ║
            ║  El buscador y contenido van aquí después.   ║
            ╚══════════════════════════════════════════════╝
          */}
          <div className="admin-content">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}

export default DefaultLayout
