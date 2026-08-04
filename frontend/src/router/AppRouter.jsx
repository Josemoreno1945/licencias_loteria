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
import OperadorasListaView from '../modules/operadoras/views/OperadorasListaView'
import OperadorasRegistroView from '../modules/operadoras/views/OperadorasRegistroView'

// Comercializadores
import ComercializadoresListaView from '../modules/comercializadores/views/ComercializadoresListaView'
import ComercializadoresRegistroView from '../modules/comercializadores/views/ComercializadoresRegistroView'

// Centros de Apuesta
import CentrosApuestaListaView from '../modules/centros_apuesta/views/CentrosApuestaListaView'
import CentrosApuestaRegistroView from '../modules/centros_apuesta/views/CentrosApuestaRegistroView'

// Usuarios
import UsuariosListaView from '../modules/usuarios/views/UsuariosListaView'
import UsuariosRegistroView from '../modules/usuarios/views/UsuariosRegistroView'

// Bancos
import BancosListaView from '../modules/bancos/views/BancosListaView'
import BancosRegistroView from '../modules/bancos/views/BancosRegistroView'

// Licencias (placeholder)
import LicenciasView from '../modules/licencias/views/LicenciasView'

import RoleRoute from './RoleRoute'

const ADMINS = ['superAdmin', 'gerente']
const GESTORES = ['superAdmin', 'gerente', 'gestor_de_tramites']
const TODOS = ['superAdmin', 'gerente', 'gestor_de_tramites', 'supervisor']

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
          <Route path="personas/lista" element={<RoleRoute allowedRoles={TODOS}><PersonasListaView /></RoleRoute>} />
          <Route path="personas/registro" element={<RoleRoute allowedRoles={GESTORES}><PersonasRegistroView /></RoleRoute>} />

          {/* Operadoras */}
          <Route path="operadoras" element={<OperadorasView />} />
          <Route path="operadoras/lista" element={<RoleRoute allowedRoles={TODOS}><OperadorasListaView /></RoleRoute>} />
          <Route path="operadoras/registro" element={<RoleRoute allowedRoles={GESTORES}><OperadorasRegistroView /></RoleRoute>} />

          {/* Usuarios */}
          <Route path="usuarios" element={<Navigate to="/usuarios/lista" replace />} />
          <Route path="usuarios/lista" element={<RoleRoute allowedRoles={ADMINS}><UsuariosListaView /></RoleRoute>} />
          <Route path="usuarios/registro" element={<RoleRoute allowedRoles={ADMINS}><UsuariosRegistroView /></RoleRoute>} />

          {/* Bancos */}
          <Route path="bancos" element={<Navigate to="/bancos/lista" replace />} />
          <Route path="bancos/lista" element={<RoleRoute allowedRoles={TODOS}><BancosListaView /></RoleRoute>} />
          <Route path="bancos/registro" element={<RoleRoute allowedRoles={GESTORES}><BancosRegistroView /></RoleRoute>} />

          {/* Licencias (placeholder — pendiente de implementar) */}
          <Route path="licencias" element={<Navigate to="/licencias/lista" replace />} />
          <Route path="licencias/lista" element={<RoleRoute allowedRoles={TODOS}><LicenciasView /></RoleRoute>} />
          <Route path="licencias/registro" element={<RoleRoute allowedRoles={GESTORES}><LicenciasView /></RoleRoute>} />

          {/* Comercializadores */}
          <Route path="comercializadores" element={<Navigate to="/comercializadores/lista" replace />} />
          <Route path="comercializadores/lista" element={<RoleRoute allowedRoles={TODOS}><ComercializadoresListaView /></RoleRoute>} />
          <Route path="comercializadores/registro" element={<RoleRoute allowedRoles={GESTORES}><ComercializadoresRegistroView /></RoleRoute>} />

          {/* Centros de Apuesta */}
          <Route path="centros-apuesta" element={<Navigate to="/centros-apuesta/lista" replace />} />
          <Route path="centros-apuesta/lista" element={<RoleRoute allowedRoles={TODOS}><CentrosApuestaListaView /></RoleRoute>} />
          <Route path="centros-apuesta/registro" element={<RoleRoute allowedRoles={GESTORES}><CentrosApuestaRegistroView /></RoleRoute>} />

          {/* Modulos pendientes — redirigen a dashboard hasta que se implementen */}
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
