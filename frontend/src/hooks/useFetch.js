import { useState, useEffect, useCallback, useRef } from 'react'
import axiosInstance from '../api/axiosInstance'

const useFetch = (endpoint, { immediate = true, params = null } = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const paramsRef = useRef(params)
  paramsRef.current = params

  const fetchData = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result } = await axiosInstance.get(endpoint, { signal, params: paramsRef.current })
      setData(result)
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.error || 'Error al cargar datos')
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (!immediate) return
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

export default useFetch
