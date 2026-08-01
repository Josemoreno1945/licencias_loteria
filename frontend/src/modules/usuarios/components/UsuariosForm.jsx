import React from 'react'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormLabel,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilEnvelopeClosed,
  cilLockLocked,
} from '@coreui/icons'

const UsuariosForm = ({ formData, handleInputChange, onSubmit }) => {
  return (
    <CForm onSubmit={onSubmit}>
      <CRow className="mb-4">
        {/* Nombre de Usuario */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Nombre de Usuario</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormInput
              type="text"
              name="nombre_usuario"
              placeholder="Ej: jperez"
              value={formData.nombre_usuario}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        {/* Email */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Correo Electronico</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilEnvelopeClosed} />
            </CInputGroupText>
            <CFormInput
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        {/* Password */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Contrasena</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilLockLocked} />
            </CInputGroupText>
            <CFormInput
              type="password"
              name="password"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </CInputGroup>
        </CCol>

        {/* Rol */}
        <CCol md={6} className="mb-3">
          <CFormLabel>Rol</CFormLabel>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormSelect
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione...</option>
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </CFormSelect>
          </CInputGroup>
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end mt-3">
        <CButton type="submit" color="primary" size="lg">
          Registrar Usuario
        </CButton>
      </div>
    </CForm>
  )
}

export default UsuariosForm
