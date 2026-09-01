import React from 'react'
import Select from 'react-select'

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Filtra opciones por coincidencia parcial, insensible a mayúsculas y acentos.
// Permite, por ejemplo, escribir 'j' y ver todas las opciones que la contienen.
const filtrarOpciones = (inputValue, options) => {
  if (!inputValue || inputValue.trim() === '') return options
  const term = normalize(inputValue)
  return options.filter((opt) => normalize(opt.label).includes(term))
}

// El control de react-select pasa (provided, state) donde:
// state.isFocused / state.isDisabled / state.hasValue vienen de forma plana.
// width: '100%' evita que el campo se encoja al ancho del texto escrito.
const baseControl = (provided, state) => ({
  ...provided,
  minHeight: '38px',
  width: '100%',
  borderColor: state.isFocused ? '#0d6efd' : '#ced4da',
  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.25)' : 'none',
  '&:hover': {
    borderColor: '#0d6efd',
  },
})

const selectStyles = {
  // Dentro de un .input-group (flex) la raíz debe crecer como .form-control
  // (flex: 1 1 0%) para ocupar todo el ancho disponible y no encogerse.
  container: (base) => ({ ...base, flex: '1 1 0%' }),
  control: baseControl,
  singleValue: (base) => ({
    ...base,
    color: '#000',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  input: (base) => ({ ...base, color: '#000', width: '100%' }),
  menu: (base) => ({
    ...base,
    zIndex: 1060,
    borderColor: '#ced4ca',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 220,
    '::-webkit-scrollbar': { width: '6px' },
    '::-webkit-scrollbar-track': { background: '#f1f1f1' },
    '::-webkit-scrollbar-thumb': { background: '#c5c5c5', borderRadius: '3px' },
    '::-webkit-scrollbar-thumb:hover': { background: '#a8a8a8' },
  }),
  option: (base, { isSelected, isFocused }) => ({
    ...base,
    backgroundColor: isSelected
      ? 'rgba(13, 110, 253, 0.15)'
      : isFocused
        ? 'rgba(13, 110, 253, 0.08)'
        : undefined,
    color: '#000',
    cursor: 'pointer',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#6c757d',
    'svg path': { fill: '#6c757d' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#6c757d',
    'svg path': { fill: '#6c757d' },
  }),
  loadingIndicator: (base) => ({ ...base, color: '#6c757d' }),
  indicatorSeparator: () => ({ display: 'none' }),
  menuPortal: (base) => ({ ...base, zIndex: 1070 }),
}

const SelectConBusqueda = React.forwardRef((props, ref) => {
  const {
    options = [],
    value,
    onChange,
    isClearable = true,
    isDisabled = false,
    isSearchable = true,
    placeholder = 'Seleccionar...',
    className = '',
    isMulti = false,
    noOptionsMessage = 'Sin opciones',
    loading = false,
    menuPortalTarget = undefined,
    ...rest
  } = props

  const selectedValue = React.useMemo(() => {
    if (isMulti) {
      if (!value) return []
      return value
        .map((v) => options.find((o) => String(o.value) === String(v)))
        .filter(Boolean)
    }
    if (value === null || value === undefined || value === '') {
      return null
    }
    return options.find((o) => String(o.value) === String(value)) || null
  }, [value, options, isMulti])

  return (
    <Select
      ref={ref}
      options={options}
      value={selectedValue}
      onChange={onChange}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      isMulti={isMulti}
      placeholder={placeholder}
      noOptionsMessage={() => noOptionsMessage}
      isLoading={loading}
      filter={filtrarOpciones}
      styles={selectStyles}
      menuPortalTarget={menuPortalTarget}
      className={className}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: 'rgba(13, 110, 253, 0.10)',
          primary: '#0d6efd',
        },
        borderRadius: '0.375rem',
      })}
      {...rest}
    />
  )
})

SelectConBusqueda.displayName = 'SelectConBusqueda'

export default SelectConBusqueda
