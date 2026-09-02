export const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const filterBySearch = (items, searchTerm, fields) => {
  if (!items || !Array.isArray(items)) return []
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') return items
  const term = searchTerm.toLowerCase().trim()
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(term)
    })
  )
}
