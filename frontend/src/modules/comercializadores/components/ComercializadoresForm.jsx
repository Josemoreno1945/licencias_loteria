import React, { useState } from 'react'
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
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilAddressBook,
  cilBuilding,
  cilPhone,
  cilEnvelopeClosed,
  cilHome,
  cilUser,
  cilPlus,
  cilTrash,
} from '@coreui/icons'

const ComercializadoresForm = ({ formData, handleInputChange, onSubmit, isEditMode, personas, loadingDeps }) => {
  const [representantes, setRepresentantes] = useState(
    formData.representantes?.length > 0
      ? formData.representantes
      : [{ id_persona: '', cargo: '' }]
  )

  const handleRepresentanteChange = (index, field, value) => {
    const nuevos = representantes.map((rep, i) =>
      i === index ? { ...rep, [field]: value } : rep
    )
    setRepresentantes(nuevos)
    const eventoSimulado = {
      target: { name: 'representantes', value: nuevos },
    }
    handleInputChange(eventoSimulado)
  }

  const agregarRepresentante = () => {
    const nuevos = [...representantes, { id_persona: '', cargo: '' }]
    setRepresentantes(nuevos)
    const eventoSimulado = {
      target: { name: 'representantes', value: nuevos },
    }
    handleInputChange(eventoSimulado)
  }

  const eliminarRepresentante = (index) => {
    if (representantes.length <= 1) return
    const nuevos = representantes.filter((_, i) => i !== index)
    setRepresentantes(nuevos)
    const eventoSimulado = {
      target: { name: 'representantes', value: nuevos },
    }
    handleInputChange(eventoSimulado)
  }

  return (
    <CForm onSubmit={onSubmit}>
      {loadingDeps ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <CSpinner color="primary" />
          <span className="ms-3 text-muted">Cargando datos del formulario...</span>
        </div>
      ) : (
        <>
          <CRow className="mb-4">
            <CCol md={6} className="mb-3">
              <CFormLabel>RIF</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilAddressBook} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="rif"
                  placeholder="Ej: J-12345678-9"
                  value={formData.rif}
                  onChange={handleInputChange}
                  required
                />
              </CInputGroup>
            </CCol>

            <CCol md={6} className="mb-3">
              <CFormLabel>Razón Social</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="razon_social"
                  placeholder="Nombre de la empresa comercializadora"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  required
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={12} className="mb-3">
              <CFormLabel>Dirección Fiscal (Opcional)</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilHome} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="direccion_fiscal"
                  placeholder="Dirección fiscal completa"
                  value={formData.direccion_fiscal}
                  onChange={handleInputChange}
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={6} className="mb-3">
              <CFormLabel>Teléfono (Opcional)</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilPhone} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="telefono"
                  placeholder="Ej: 0414-1234567"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </CInputGroup>
            </CCol>

            <CCol md={6} className="mb-3">
              <CFormLabel>Correo Electrónico (Opcional)</CFormLabel>
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
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={6} className="mb-3">
              <CFormLabel>Estado</CFormLabel>
              <CInputGroup>
                <CFormSelect
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </CFormSelect>
              </CInputGroup>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={12}>
              <div className="bg-light rounded-3 p-3 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <CFormLabel className="mb-0 fw-semibold text-dark">Representante Legal</CFormLabel>
                  <CButton
                    color="primary"
                    size="sm"
                    variant="outline"
                    onClick={agregarRepresentante}
                    type="button"
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Agregar Representante
                  </CButton>
                </div>

                {representantes.map((rep, index) => (
                  <div
                    key={index}
                    className={`mb-3 ${index > 0 ? 'pt-3 border-top' : ''}`}
                  >
                    <CRow className="align-items-end">
                      <CCol md={5} className="mb-2">
                        <CFormLabel className="small text-muted mb-1">
                          {index === 0 ? 'Representante Principal' : `Representante #${index + 1}`}
                        </CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>
                            <CIcon icon={cilUser} />
                          </CInputGroupText>
                          <CFormSelect
                            value={rep.id_persona}
                            onChange={(e) => handleRepresentanteChange(index, 'id_persona', e.target.value)}
                            required={index === 0}
                          >
                            <option value="">Seleccione una persona...</option>
                            {personas.map((p) => (
                              <option key={p.id_persona} value={p.id_persona}>
                                {p.ci_rif} — {p.razon_social}
                              </option>
                            ))}
                          </CFormSelect>
                        </CInputGroup>
                      </CCol>

                      <CCol md={5} className="mb-2">
                        <CFormLabel className="small text-muted mb-1">Cargo</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Ej: Representante Legal, Apoderado..."
                          value={rep.cargo || ''}
                          onChange={(e) => handleRepresentanteChange(index, 'cargo', e.target.value)}
                        />
                      </CCol>

                      <CCol md={2} className="mb-2">
                        {representantes.length > 1 && (
                          <CButton
                            color="danger"
                            variant="outline"
                            onClick={() => eliminarRepresentante(index)}
                            type="button"
                            className="w-100"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  </div>
                ))}
              </div>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end mt-3">
            <CButton type="submit" color="primary" size="lg">
              {isEditMode ? 'Guardar cambios' : 'Registrar Comercializador'}
            </CButton>
          </div>
        </>
      )}
    </CForm>
  )
}

export default ComercializadoresForm
