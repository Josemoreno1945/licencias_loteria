import { Navigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/store/AuthContext'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleRoute
