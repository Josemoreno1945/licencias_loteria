import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import DefaultLayout from '../layout/DefaultLayout'

// Auth
import LoginView from '../modules/auth/views/LoginView'
import RegisterView from '../modules/auth/views/RegisterView'

// Dashboard
import DashboardView from '../modules/dashboard/views/DashboardView'

// Licencias
import LicenciasView from '../modules/licencias/views/LicenciasView'

// Operadoras
import OperadorasView from '../modules/operadoras/views/OperadorasView'

// Personas
import PersonasView from '../modules/personas/views/personasView'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
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
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="licencias" element={<LicenciasView />} />
          <Route path="operadoras" element={<OperadorasView />} />
          <Route path="personas" element={<PersonasView />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
