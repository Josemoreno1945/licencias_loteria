import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'
import '../scss/paginacion.scss'

const Paginacion = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null

  const goTo = (p) => {
    if (!onPageChange) return
    if (p < 1 || p > totalPages) return
    onPageChange(p)
  }

  return (
    <CPagination align="center">
      <CPaginationItem disabled={currentPage <= 1} onClick={() => goTo(currentPage - 1)}>
        Anterior
      </CPaginationItem>

      {[...Array(totalPages)].map((_, i) => (
        <CPaginationItem
          key={i}
          active={i + 1 === currentPage}
          onClick={() => goTo(i + 1)}
        >
          {i + 1}
        </CPaginationItem>
      ))}

      <CPaginationItem disabled={currentPage >= totalPages} onClick={() => goTo(currentPage + 1)}>
        Siguiente
      </CPaginationItem>
    </CPagination>
  )
}

export default Paginacion
