import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import axiosInstance from '../../../api/axiosInstance'

const getEstadoDocColor = (estado) => {
  switch (estado) {
    case 'vigente':    return 'success'
    case 'vencido':    return 'danger'
    case 'suspendido': return 'warning'
    case 'anulado':    return 'secondary'
    default:           return 'secondary'
  }
}

const LicenciaDetalleModal = ({ idLicencia, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [juegos, setJuegos] = useState([])
  const [loadingJuegos, setLoadingJuegos] = useState(false)

  useEffect(() => {
    if (!idLicencia) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/licencias/${idLicencia}`)
        setData(Array.isArray(res.data) ? res.data[0] : res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle de la licencia')
      } finally {
        setLoading(false)
      }

      setLoadingJuegos(true)
      try {
        const resJ = await axiosInstance.get(`/documento-juegos/por-documento/${idLicencia}`)
        setJuegos(resJ.data || [])
      } catch {
        setJuegos([])
      } finally {
        setLoadingJuegos(false)
      }
    }
    fetchData()
  }, [idLicencia])

  if (!idLicencia) return null

  return (
    <CModal visible={!!idLicencia} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle de la Licencia</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading && (
          <div className="d-flex justify-content-center py-4">
            <CSpinner color="primary" />
          </div>
        )}
        {error && !loading && <CAlert color="danger">{error}</CAlert>}
        {!loading && !error && data && (
          <div className="px-2">
            <h5 className="text-primary fw-semibold mb-3">Información del Documento</h5>
            <CRow className="gy-3 mb-4">
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Nº de Documento</CFormLabel>
                <CFormInput type="text" value={data.numero_documento || ''} readOnly className="bg-light fw-bold" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Estado</CFormLabel>
                <div>
                  <CBadge color={getEstadoDocColor(data.estado_documento)} className="fs-6 px-3 py-2">
                    {data.estado_documento}
                  </CBadge>
                </div>
              </CCol>
              
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Categoría</CFormLabel>
                <CFormInput type="text" value={data.categoria || '—'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Tipo de Emisión</CFormLabel>
                <CFormInput type="text" value={data.tipo_emision || '—'} readOnly className="bg-light" />
              </CCol>
              
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Expedición</CFormLabel>
                <CFormInput type="text" value={data.fecha_expedicion ? new Date(data.fecha_expedicion).toLocaleDateString() : '—'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Vencimiento</CFormLabel>
                <CFormInput type="text" value={data.fecha_vencimiento ? new Date(data.fecha_vencimiento).toLocaleDateString() : '—'} readOnly className="bg-light fw-bold" />
              </CCol>

              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Papel de Seguridad</CFormLabel>
                <CFormInput type="text" value={data.papel_seguridad || '—'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Emitido Por (Usuario)</CFormLabel>
                <CFormInput type="text" value={data.emitido_por || '—'} readOnly className="bg-light" />
              </CCol>
            </CRow>

            <hr className="text-muted opacity-25 my-4" />

             <h5 className="text-primary fw-semibold mb-3">Asignaciones & Dirección</h5>
             <CRow className="gy-3 mb-2">
               <CCol md={12}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Persona Titular</CFormLabel>
                 <CFormInput type="text" value={`${data.ci_rif} — ${data.persona}`} readOnly className="bg-light fw-semibold" />
               </CCol>
               
               <CCol md={12}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Comercializador Asociado</CFormLabel>
                 <CFormInput type="text" value={data.comercializador || 'Ninguno'} readOnly className="bg-light" />
               </CCol>

               <CCol md={6}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Centro de Apuesta</CFormLabel>
                 <CFormInput type="text" value={data.centro_apuesta || 'Ninguno'} readOnly className="bg-light" />
               </CCol>

               <CCol md={6}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Representante Legal</CFormLabel>
                 <CFormInput type="text" value={data.representante_legal || 'Ninguno'} readOnly className="bg-light" />
               </CCol>
               
                <CCol md={12}>
                  <CFormLabel className="text-muted small fw-semibold mb-1">Dirección del Establecimiento</CFormLabel>
                  <CFormInput type="text" value={data.direccion_establecimiento || 'No registrada'} readOnly className="bg-light" />
                </CCol>
              </CRow>

              <hr className="text-muted opacity-25 my-4" />

              <h5 className="text-primary fw-semibold mb-3">Datos del Pago</h5>
              {data.pago_numero_referencia ? (
                <CRow className="gy-3 mb-2">
                  <CCol md={6}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Banco</CFormLabel>
                    <CFormInput type="text" value={data.pago_banco || '—'} readOnly className="bg-light" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Número de Referencia</CFormLabel>
                    <CFormInput type="text" value={data.pago_numero_referencia || '—'} readOnly className="bg-light fw-semibold" />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Monto</CFormLabel>
                    <CFormInput type="text" value={data.pago_monto ? new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(data.pago_monto) : '—'} readOnly className="bg-light fw-bold" />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Tasa del Día</CFormLabel>
                    <CFormInput type="text" value={data.pago_tasa_dia ? data.pago_tasa_dia.toLocaleString('es-VE') : '—'} readOnly className="bg-light" />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Fecha de Pago</CFormLabel>
                    <CFormInput type="text" value={data.pago_fecha_pago ? new Date(data.pago_fecha_pago).toLocaleDateString() : '—'} readOnly className="bg-light" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Responsable</CFormLabel>
                    <CFormInput type="text" value={data.pago_responsable || '—'} readOnly className="bg-light" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="text-muted small fw-semibold mb-1">Observaciones</CFormLabel>
                    <CFormInput type="text" value={data.pago_observaciones || '—'} readOnly className="bg-light" />
                  </CCol>
                </CRow>
              ) : (
                <CAlert color="info" className="small">Esta licencia no tiene pago registrado.</CAlert>
              )}

              <hr className="text-muted opacity-25 my-4" />

              <h5 className="text-primary fw-semibold mb-3">Juegos Autorizados</h5>
              {loadingJuegos ? (
                <div className="d-flex justify-content-center py-3">
                  <CSpinner color="primary" size="sm" />
                </div>
              ) : juegos.length === 0 ? (
                <CAlert color="info" className="small">Esta licencia no tiene juegos autorizados.</CAlert>
              ) : (
                <CTable hover responsive striped className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Juego</CTableHeaderCell>
                      <CTableHeaderCell>Operadora</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {juegos.map((j, index) => (
                      <CTableRow key={j.id_juego}>
                        <CTableDataCell className="text-muted small">{index + 1}</CTableDataCell>
                        <CTableDataCell className="fw-semibold">{j.nombre_juego || '—'}</CTableDataCell>
                        <CTableDataCell>{j.operadora || '—'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
           </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default LicenciaDetalleModal
