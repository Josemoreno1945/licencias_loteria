import axiosInstance from '../../../api/axiosInstance'

export const login = async (credentials) => {
  const { data } = await axiosInstance.post('/auth/login', credentials)
  return data
}

export const register = async (userData) => {
  const { data } = await axiosInstance.post('/auth/register', userData)
  return data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
