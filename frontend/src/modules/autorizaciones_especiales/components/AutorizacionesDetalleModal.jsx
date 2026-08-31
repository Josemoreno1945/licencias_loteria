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

const getDetallesExtra = (val) => {
  if (val == null) return 'No registrado'
  try {
    const obj = typeof val === 'string' ? JSON.parse(val) : val
    if (obj && typeof obj === 'object' && obj.observaciones != null) {
      return obj.observaciones || 'No registrado'
    }
    return JSON.stringify(obj)
  } catch {
    return String(val)
  }
}

const AutorizacionesDetalleModal = ({ idAutorizacion, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pago, setPago] = useState(null)
  const [loadingPago, setLoadingPago] = useState(false)

  useEffect(() => {
    if (!idAutorizacion) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/autorizaciones-especiales/${idAutorizacion}`)
        setData(Array.isArray(res.data) ? res.data[0] : res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el detalle de la autorización')
      } finally {
        setLoading(false)
      }

      setLoadingPago(true)
      try {
        const resP = await axiosInstance.get(`/pagos/por-autorizacion/${idAutorizacion}`)
        const arr = Array.isArray(resP.data) ? resP.data : [resP.data]
        setPago(arr.length ? arr[0] : null)
      } catch {
        setPago(null)
      } finally {
        setLoadingPago(false)
      }
    }
    fetchData()
  }, [idAutorizacion])

  if (!idAutorizacion) return null

  return (
    <CModal visible={!!idAutorizacion} onClose={onClose} alignment="center" size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Detalle de la Autorización</CModalTitle>
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
                <CFormLabel className="text-muted small fw-semibold mb-1">Nº de Mesa / ID</CFormLabel>
                <CFormInput type="text" value={data.nro_mesa || '—'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Tipo de Autorización</CFormLabel>
                <CFormInput type="text" value={data.tipo || '—'} readOnly className="bg-light fw-bold" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Tipo de Emisión</CFormLabel>
                <CFormInput type="text" value={data.tipo_emision || '—'} readOnly className="bg-light" />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Número LOT</CFormLabel>
                <CFormInput type="text" value={data.numero_lot || '—'} readOnly className="bg-light fw-bold" />
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

              <CCol md={12}>
                <CFormLabel className="text-muted small fw-semibold mb-1">Observaciones / Detalles Extra</CFormLabel>
                <CFormInput type="text" value={getDetallesExtra(data.detalles_extra)} readOnly className="bg-light" />
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

               <CCol md={12}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Tipo de Persona</CFormLabel>
                 <CFormInput type="text" value={data.tipo_persona || '—'} readOnly className="bg-light" />
               </CCol>

               <CCol md={12}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Agencia Texto</CFormLabel>
                 <CFormInput type="text" value={data.agencia_texto || '—'} readOnly className="bg-light" />
               </CCol>

               <CCol md={12}>
                 <CFormLabel className="text-muted small fw-semibold mb-1">Dir. Centro Asignado</CFormLabel>
                 <CFormInput type="text" value={data.direccion_centro_asignado || data.direccion_establecimiento || 'No registrada'} readOnly className="bg-light" />
               </CCol>

               {data.direccion_localidad && (
                 <CCol md={12}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Dirección de la Localidad</CFormLabel>
                   <CFormInput type="text" value={data.direccion_localidad} readOnly className="bg-light" />
                 </CCol>
               )}

               {data.direccion_responsable && (
                 <CCol md={12}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Dirección del Responsable</CFormLabel>
                   <CFormInput type="text" value={data.direccion_responsable} readOnly className="bg-light" />
                 </CCol>
               )}
             </CRow>

             <hr className="text-muted opacity-25 my-4" />

             <h5 className="text-primary fw-semibold mb-3">Datos del Pago</h5>
             {loadingPago ? (
               <div className="d-flex justify-content-center py-3">
                 <CSpinner color="primary" size="sm" />
               </div>
             ) : pago ? (
               <CRow className="gy-3 mb-2">
                 <CCol md={6}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Banco</CFormLabel>
                   <CFormInput type="text" value={pago.banco || '—'} readOnly className="bg-light" />
                 </CCol>
                 <CCol md={6}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Número de Referencia</CFormLabel>
                   <CFormInput type="text" value={pago.num_referencia || '—'} readOnly className="bg-light fw-semibold" />
                 </CCol>
                 <CCol md={4}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Monto</CFormLabel>
                   <CFormInput type="text" value={pago.monto ? new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(pago.monto) : '—'} readOnly className="bg-light fw-bold" />
                 </CCol>
                 <CCol md={4}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Tasa del Día</CFormLabel>
                   <CFormInput type="text" value={pago.tasa_dia ? pago.tasa_dia.toLocaleString('es-VE') : '—'} readOnly className="bg-light" />
                 </CCol>
                 <CCol md={4}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Fecha de Pago</CFormLabel>
                   <CFormInput type="text" value={pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : '—'} readOnly className="bg-light" />
                 </CCol>
                 <CCol md={6}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Responsable</CFormLabel>
                   <CFormInput type="text" value={pago.responsable_texto || '—'} readOnly className="bg-light" />
                 </CCol>
                 <CCol md={6}>
                   <CFormLabel className="text-muted small fw-semibold mb-1">Observaciones</CFormLabel>
                   <CFormInput type="text" value={pago.observaciones || '—'} readOnly className="bg-light" />
                 </CCol>
               </CRow>
             ) : (
               <CAlert color="info" className="small">Esta autorización no tiene pago registrado.</CAlert>
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

export default AutorizacionesDetalleModal
