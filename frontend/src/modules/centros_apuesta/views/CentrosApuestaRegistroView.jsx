import { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CCardHeader, CContainer, CAlert } from '@coreui/react'
import { createCentroApuesta, getCentrosApuestaActivos } from '../services/centros_apuesta.service'
import { getComercializadoresActivos } from '../../comercializadores/services/comercializadores.service'
import { getPersonas } from '../../personas/services/personas.service'
import FeedbackModal from '../../../components/FeedbackModal'
import CentrosApuestaForm from '../components/CentrosApuestaForm'
import { extractErrorMessage } from '../../../utils/errorHandler'

const CentrosApuestaRegistroView = () => {
  const [formData, setFormData] = useState({
    id_comercializador: '',
    nombre_agencia: '',
    direccion: '',
    estado: 'activo',
    representantes: [{ id_persona: '', cargo: '' }],
  })

  const [comercializadores, setComercializadores] = useState([])
  const [personas, setPersonas] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [errorDeps, setErrorDeps] = useState(null)

  const [modalState, setModalState] = useState({
    visible: false,
    type: '',
    message: '',
  })

  useEffect(() => {
    const cargarDependencias = async () => {
      setLoadingDeps(true)
      setErrorDeps(null)
      try {
        const [dataComercializadores, dataPersonas] = await Promise.all([
          getComercializadoresActivos(),
          getPersonas(),
        ])
        setComercializadores(dataComercializadores || [])
        setPersonas(dataPersonas || [])
      } catch {
        setErrorDeps('No se pudieron cargar los datos necesarios. Verifique la conexión con el servidor.')
      } finally {
        setLoadingDeps(false)
      }
    }

    cargarDependencias()
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setModalState({
      visible: true,
      type: 'loading',
      message: 'Registrando centro de apuesta...',
    })

    try {
      const payload = {
        id_comercializador: formData.id_comercializador,
        nombre_agencia: formData.nombre_agencia,
        direccion: formData.direccion,
        estado: formData.estado,
        representantes: formData.representantes.filter((r) => r.id_persona),
      }

      const response = await createCentroApuesta(payload)

      setModalState({
        visible: true,
        type: 'success',
        message: response.message || 'Centro de apuesta registrado exitosamente.',
      })

      setFormData({
        id_comercializador: '',
        nombre_agencia: '',
        direccion: '',
        estado: 'activo',
        representantes: [{ id_persona: '', cargo: '' }],
      })
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error inesperado al registrar el centro de apuesta.')

      setModalState({
        visible: true,
        type: 'error',
        message: errorMsg,
      })
    }
  }

  return (
    <CContainer fluid>
      <FeedbackModal
        visible={modalState.visible}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, visible: false }))}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0">
          <h4 className="mb-3 text-primary">Registro de Centros de Apuesta</h4>
          <p className="text-muted small">
            Registre una nueva agencia física (punto de venta) vinculada a un comercializador.
          </p>
        </CCardHeader>
        <CCardBody>
          {errorDeps ? (
            <CAlert color="danger">{errorDeps}</CAlert>
          ) : (
            <CentrosApuestaForm
              formData={formData}
              handleInputChange={handleInputChange}
              onSubmit={handleSubmit}
              comercializadores={comercializadores}
              personas={personas}
              loadingDeps={loadingDeps}
            />
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CentrosApuestaRegistroView
