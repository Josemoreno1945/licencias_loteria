import React from 'react'
import { CInputGroup, CInputGroupText, CFormInput, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilX } from '@coreui/icons'
import '../scss/buscador.scss'

const Buscador = ({ value, onChange, onClear, placeholder = 'Buscar...' }) => {
  return (
    <CInputGroup>
      <CInputGroupText className="bg-white border-end-0">
        <CIcon icon={cilSearch} className="text-primary" />
      </CInputGroupText>
      <CFormInput
        className="border-start-0 border-end-0 shadow-none"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <CButton
          type="button"
          color="secondary"
          variant="outline"
          className="border-start-0 border-end-0"
          onClick={onClear}
          title="Limpiar búsqueda"
        >
          <CIcon icon={cilX} />
        </CButton>
      )}
    </CInputGroup>
  )
}

export default Buscador
