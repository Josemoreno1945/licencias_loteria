import { createContext, useContext, useState, useCallback } from 'react'
import { login as loginService, logout as logoutService, register as registerService } from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    try {
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  })

  const login = useCallback(async (credentials) => {
    const data = await loginService(credentials)
    localStorage.setItem('token', data.token)
    // El backend devuelve { token, usuario: {...} } — no "user"
    const user = data.usuario ?? data.user
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const data = await registerService(userData)
    return data
  }, [])

  const logout = useCallback(() => {
    logoutService()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user && !!localStorage.getItem('token') }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
