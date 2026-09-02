import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { login as loginService, logout as logoutService } from '../services/auth.service'
import { setUnauthorizedHandler } from '../../../api/axiosInstance'

const STORAGE_PREFIX = 'auth'

/**
 * Persistencia dual:
 *  - recordarme=true  → localStorage  (cierre de pestaña NO cierra sesión)
 *  - recordarme=false → sessionStorage (cierre de pestaña SÍ cierra sesión)
 */
const storage = (remember) => (remember ? localStorage : sessionStorage)

const getStored = (remember) => {
  try {
    const store = storage(remember)
    const token = store.getItem(`${STORAGE_PREFIX}_token`)
    const userRaw = store.getItem(`${STORAGE_PREFIX}_user`)
    if (!token || !userRaw || userRaw === 'undefined') return null
    return { token, user: JSON.parse(userRaw), remember }
  } catch {
    return null
  }
}

const setStored = (token, user, remember) => {
  const store = storage(remember)
  store.setItem(`${STORAGE_PREFIX}_token`, token)
  store.setItem(`${STORAGE_PREFIX}_user`, JSON.stringify(user))
}

const clearStored = () => {
  localStorage.removeItem(`${STORAGE_PREFIX}_token`)
  localStorage.removeItem(`${STORAGE_PREFIX}_user`)
  sessionStorage.removeItem(`${STORAGE_PREFIX}_token`)
  sessionStorage.removeItem(`${STORAGE_PREFIX}_user`)
}

const AuthContext = createContext(null)

/**
 * Decodifica un JWT (sin verificar firma) y devuelve su payload o null.
 * Se usa sólo para chequear la fecha de expiración antes de confiar
 * en el token persistido. La verificación criptográfica la hace
 * el backend en cada request.
 */
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

const isTokenExpired = (token) => {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Prioridad: localStorage (sesión persistente) > sessionStorage (sesión de pestaña).
    // Si ambos tienen tokens distintos, gana localStorage — comportamiento intencional
    // para que "Recordarme" siempre prevalezca sobre sesiones de pestaña obsoletas.
    const stored = getStored(true) || getStored(false)
    try {
      if (stored) {
        if (isTokenExpired(stored.token)) {
          clearStored()
        } else {
          setUser(stored.user)
        }
      }
    } catch {
      clearStored()
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials, remember = false) => {
    const data = await loginService(credentials)
    const userData = data.usuario ?? data.user
    setStored(data.token, userData, remember)
    setUser(userData)
    return data
  }, [])

  const logout = useCallback(() => {
    logoutService()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStored()
      setUser(null)
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    })
  }, [])

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: !!user, loading }),
    [user, login, logout, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
