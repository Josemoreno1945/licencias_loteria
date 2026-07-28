import { Outlet } from 'react-router-dom'
import {
  CContainer,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavTitle,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/store/AuthContext'

const DefaultLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="wrapper d-flex flex-column min-vh-100">
      <CHeader position="sticky" className="mb-4">
        <CHeaderToggler onClick={() => setSidebarVisible(!sidebarVisible)} />
        <CHeaderBrand>Proyecto Licencias</CHeaderBrand>
        <CHeaderNav className="ms-auto">
          <span className="me-3">Hola, {user?.nombre || 'Usuario'}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </CHeaderNav>
      </CHeader>

      <div className="body flex-grow-1 px-3">
        <CSidebar visible={sidebarVisible}>
          <CSidebarBrand>Licencias</CSidebarBrand>
          <CSidebarNav>
            <CNavTitle>Menú</CNavTitle>
            <CNavItem href="/dashboard">Dashboard</CNavItem>
            <CNavItem href="/licencias">Licencias</CNavItem>
            <CNavItem href="/operadoras">Operadoras</CNavItem>
          </CSidebarNav>
        </CSidebar>

        <CContainer fluid>
          <Outlet />
        </CContainer>
      </div>
    </div>
  )
}

export default DefaultLayout
