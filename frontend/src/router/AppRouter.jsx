import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import DefaultLayout from '../layout/DefaultLayout'

// Auth
import LoginView from '../modules/auth/views/LoginView'

// Dashboard
import DashboardView from '../modules/dashboard/views/DashboardView'

// Licencias
import LicenciasView from '../modules/licencias/views/LicenciasView'

// Operadoras
import OperadorasView from '../modules/operadoras/views/OperadorasView'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginView />} />

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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
