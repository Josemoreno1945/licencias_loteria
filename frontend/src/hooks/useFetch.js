import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance'

/**
 * Hook genérico para llamadas a la API.
 * @param {string} endpoint - URL relativa al baseURL (ej: '/licencias')
 * @param {object} options - { immediate: bool }
 */
const useFetch = (endpoint, { immediate = true, params = null } = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result } = await axiosInstance.get(endpoint, { signal, params })
      setData(result)
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.error || 'Error al cargar datos')
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, params])

  useEffect(() => {
    if (!immediate) return
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

export default useFetch
