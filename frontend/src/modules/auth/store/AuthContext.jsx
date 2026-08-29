import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { login as loginService, logout as logoutService, register as registerService } from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    try {
      if (storedToken && storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const data = await loginService(credentials)
      localStorage.setItem('token', data.token)
      const user = data.usuario ?? data.user
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    const data = await registerService(userData)
    return data
  }, [])

  const logout = useCallback(() => {
    logoutService()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
