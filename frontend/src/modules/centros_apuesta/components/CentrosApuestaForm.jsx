import React, { useEffect, useState } from 'react'
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
  CCard,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilHome, cilUser, cilPlus, cilTrash } from '@coreui/icons'
import axiosInstance from '../../../api/axiosInstance'

// ── Tarjeta de información de entidad (solo lectura) ────────────────────────
const InfoCard = ({ titulo, campos }) => (
  <CCard className="border-start border-start-3 border-start-info mb-3">
    <CCardBody className="py-2 px-3">
      <p
        className="text-info fw-semibold small mb-2"
        style={{ letterSpacing: '0.05em' }}
      >
        {titulo}
      </p>
      <CRow className="gy-1">
        {campos.map(({ label, value }) => (
          <CCol key={label} md={6}>
            <span className="text-muted small">{label}: </span>
            <span className="small fw-semibold">{value || '—'}</span>
          </CCol>
        ))}
      </CRow>
    </CCardBody>
  </CCard>
)

const CentrosApuestaForm = ({
  formData,
  handleInputChange,
  onSubmit,
  isEditMode,
  comercializadores,
  personas,
  loadingDeps,
}) => {
  // ── Datos autocompletados del comercializador seleccionado ──
  const [detalleComercializador, setDetalleComercializador] = useState(null)
  const [loadingDetalleC, setLoadingDetalleC] = useState(false)

  const [representantes, setRepresentantes] = useState(
    formData.representantes?.length > 0
      ? formData.representantes
      : [{ id_persona: '', cargo: '' }]
  )

  // Cuando cambia el comercializador → autocompletar su detalle
  useEffect(() => {
    if (!formData.id_comercializador) {
      setDetalleComercializador(null)
      return
    }

    const fetchDetalle = async () => {
      setLoadingDetalleC(true)
      try {
        const res = await axiosInstance.get(
          `/comercializadores/${formData.id_comercializador}/detalle-completo`,
        )
        setDetalleComercializador(res.data)
      } catch (err) {
        console.error('Error al cargar detalle del comercializador:', err)
        setDetalleComercializador(null)
      } finally {
        setLoadingDetalleC(false)
      }
    }
    fetchDetalle()
  }, [formData.id_comercializador])

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
              <CFormLabel>Nombre de la Agencia</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="nombre_agencia"
                  placeholder="Nombre del punto de venta / agencia"
                  value={formData.nombre_agencia}
                  onChange={handleInputChange}
                  required
                />
              </CInputGroup>
            </CCol>

            <CCol md={6} className="mb-3">
              <CFormLabel>Comercializador</CFormLabel>
              <CInputGroup>
                <CFormSelect
                  name="id_comercializador"
                  value={formData.id_comercializador}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un comercializador...</option>
                  {comercializadores.map((com) => (
                    <option key={com.id_comercializadores} value={com.id_comercializadores}>
                      {com.rif} — {com.razon_social}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            </CCol>
          </CRow>

          {/* Panel de autocompletado del Comercializador */}
          {loadingDetalleC && (
            <div className="d-flex align-items-center gap-2 text-muted small mb-3">
              <CSpinner size="sm" /> Cargando datos del comercializador...
            </div>
          )}
          {!loadingDetalleC && detalleComercializador && (
            <InfoCard
              titulo="📋 Datos del Comercializador"
              campos={[
                { label: 'RIF', value: detalleComercializador.rif },
                {
                  label: 'Razón Social',
                  value: detalleComercializador.razon_social,
                },
                {
                  label: 'Dirección Fiscal',
                  value: detalleComercializador.direccion_fiscal,
                },
                { label: 'Teléfono', value: detalleComercializador.telefono },
                { label: 'Email', value: detalleComercializador.email },
              ]}
            />
          )}

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

          <CRow className="mb-4">
            <CCol md={8} className="mb-3">
              <CFormLabel>Dirección del Centro</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilHome} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="direccion"
                  placeholder="Dirección física del centro de apuesta"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </CInputGroup>
            </CCol>

            <CCol md={4} className="mb-3">
              <CFormLabel>Estado</CFormLabel>
              <CFormSelect
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end mt-3">
            <CButton type="submit" color="primary" size="lg">
              {isEditMode ? 'Guardar cambios' : 'Registrar Centro de Apuesta'}
            </CButton>
          </div>
        </>
      )}
    </CForm>
  )
}

export default CentrosApuestaForm
