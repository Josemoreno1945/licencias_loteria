const searchCache = new Map()

const TTL = 60 * 1000 // 1 minuto

export const getCachedSearch = (key) => {
  const entry = searchCache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > TTL) {
    searchCache.delete(key)
    return null
  }

  return entry.data
}

export const setCachedSearch = (key, data) => {
  searchCache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export const clearSearchCache = () => {
  searchCache.clear()
}

export default searchCache
