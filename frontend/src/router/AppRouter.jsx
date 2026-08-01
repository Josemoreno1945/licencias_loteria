import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import DefaultLayout from '../layout/DefaultLayout'

// Auth
import LoginView from '../modules/auth/views/LoginView'
import RegisterView from '../modules/auth/views/RegisterView'

// Dashboard
import DashboardView from '../modules/dashboard/views/DashboardView'

// Personas
import PersonasListaView from '../modules/personas/views/PersonasListaView'
import PersonasRegistroView from '../modules/personas/views/personasView'

// Operadoras
import OperadorasView from '../modules/operadoras/views/OperadorasView'

// Usuarios
import UsuariosListaView from '../modules/usuarios/views/UsuariosListaView'
import UsuariosRegistroView from '../modules/usuarios/views/UsuariosRegistroView'

// Bancos
import BancosListaView from '../modules/bancos/views/BancosListaView'
import BancosRegistroView from '../modules/bancos/views/BancosRegistroView'

// Licencias (placeholder)
import LicenciasView from '../modules/licencias/views/LicenciasView'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas publicas */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* Rutas protegidas bajo layout principal */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DefaultLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardView />} />

          {/* Personas */}
          <Route path="personas" element={<Navigate to="/personas/lista" replace />} />
          <Route path="personas/lista" element={<PersonasListaView />} />
          <Route path="personas/registro" element={<PersonasRegistroView />} />

          {/* Operadoras */}
          <Route path="operadoras" element={<OperadorasView />} />

          {/* Usuarios */}
          <Route path="usuarios" element={<Navigate to="/usuarios/lista" replace />} />
          <Route path="usuarios/lista" element={<UsuariosListaView />} />
          <Route path="usuarios/registro" element={<UsuariosRegistroView />} />

          {/* Bancos */}
          <Route path="bancos" element={<Navigate to="/bancos/lista" replace />} />
          <Route path="bancos/lista" element={<BancosListaView />} />
          <Route path="bancos/registro" element={<BancosRegistroView />} />

          {/* Licencias (placeholder — pendiente de implementar) */}
          <Route path="licencias" element={<Navigate to="/licencias/lista" replace />} />
          <Route path="licencias/lista" element={<LicenciasView />} />
          <Route path="licencias/registro" element={<LicenciasView />} />

          {/* Modulos pendientes — redirigen a dashboard hasta que se implementen */}
          <Route path="comercializadores/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="centros-apuesta/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="solicitudes/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="participaciones/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="autorizaciones/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="juegos/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="pagos/*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
