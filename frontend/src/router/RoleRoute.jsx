import { Navigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/store/AuthContext'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    // Redirigir al dashboard si no tiene el rol adecuado
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleRoute
