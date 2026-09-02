import axiosInstance from '../../../api/axiosInstance'

const clearAuth = () => {
  const keys = ['auth_token', 'auth_user', 'token', 'user']
  keys.forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

export const login = async (credentials) => {
  const { data } = await axiosInstance.post('/auth/login', credentials)
  return data
}

export const logout = () => {
  clearAuth()
}
