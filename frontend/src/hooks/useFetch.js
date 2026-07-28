import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance'

/**
 * Hook genérico para llamadas a la API.
 * @param {string} endpoint - URL relativa al baseURL (ej: '/licencias')
 * @param {object} options - { immediate: bool }
 */
const useFetch = (endpoint, { immediate = true } = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: result } = await axiosInstance.get(endpoint)
      setData(result)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (immediate) fetchData()
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

export default useFetch
