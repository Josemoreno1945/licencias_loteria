import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as registerService } from '../services/auth.service'
import { extractErrorMessage } from '../../../utils/errorHandler'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilLockLocked,
  cilEnvelopeClosed,
  cilPencil,
  cilCheckCircle,
} from '@coreui/icons'
import '../styles/auth.css'

/* ------------------------------------------------------------------ */
/*  RegisterView — Lotería del Táchira                                 */
/* ------------------------------------------------------------------ */
const RegisterView = () => {
  const navigate = useNavigate()

  // --- Estado del formulario ---
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // --- Estados de UI ---
  const [loadingAction, setLoadingAction] = useState(false)
  const [actionLabel, setActionLabel] = useState('')

  const [mensajeError, setMensajeError] = useState('')
  const [modalError, setModalError] = useState(false)

  const [mensajeExito, setMensajeExito] = useState('')
  const [modalExito, setModalExito] = useState(false)

  // --- Validación inline de contraseñas ---
  const [passMatch, setPassMatch] = useState(null) // null | true | false

  /* ---- Handlers ---- */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validación dinámica de coincidencia de contraseña
    if (name === 'confirmPassword') {
      if (value === '') {
        setPassMatch(null)
      } else {
        setPassMatch(value === formData.password)
      }
    }
    if (name === 'password') {
      if (formData.confirmPassword !== '') {
        setPassMatch(value === formData.confirmPassword)
      }
    }
  }

  const validarFormulario = () => {
    const { username, email, password, confirmPassword } = formData

    if (!username.trim() || !email.trim() || !password.trim()) {
      setMensajeError('Por favor completa todos los campos obligatorios.')
      setModalError(true)
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMensajeError('El correo electrónico no tiene un formato válido.')
      setModalError(true)
      return false
    }

    if (password.length < 6) {
      setMensajeError('La contraseña debe tener al menos 6 caracteres.')
      setModalError(true)
      return false
    }

    if (password !== confirmPassword) {
      setMensajeError('Las contraseñas no coinciden.')
      setModalError(true)
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) return

    setLoadingAction(true)
    setActionLabel('Registrando usuario...')
    try {
      const payload = {
        nombre_usuario: formData.username.trim(),
        email:          formData.email.trim(),
        password:       formData.password,
      }
      const data = await registerService(payload)
      setMensajeExito(data?.message || 'Usuario registrado exitosamente.')
      setModalExito(true)
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Ocurrió un error al registrar. Intenta de nuevo.')
      setMensajeError(errorMsg)
      setModalError(true)
    } finally {
      setLoadingAction(false)
      setActionLabel('')
    }
  }

  /* ---- Render ---- */
  return (
    <div className="auth-page">

      {/* ======== Modal: Cargando ======== */}
      <CModal
        visible={loadingAction}
        backdrop="static"
        keyboard={false}
        alignment="center"
        onClose={() => {}}
      >
        <CModalHeader className="auth-modal-header" closeButton={false}>
          {actionLabel}
        </CModalHeader>
        <CModalBody className="d-flex align-items-center gap-3 py-4">
          <CSpinner style={{ color: 'var(--lot-azul-med)' }} />
          <span style={{ color: 'var(--lot-azul)', fontWeight: 500 }}>{actionLabel}</span>
        </CModalBody>
      </CModal>

      {/* ======== Modal: Error ======== */}
      <CModal
        visible={modalError}
        backdrop="static"
        keyboard={false}
        onClose={() => setModalError(false)}
        alignment="center"
      >
        <CModalHeader className="auth-modal-header">Error</CModalHeader>
        <CModalBody className="py-3">
          {Array.isArray(mensajeError) ? (
            <ul className="mb-0 ps-3">
              {mensajeError.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          ) : (
            <div>{String(mensajeError)}</div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton className="btn-auth-cerrar" onClick={() => setModalError(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ======== Modal: Registro exitoso ======== */}
      <CModal
        visible={modalExito}
        backdrop="static"
        keyboard={false}
        alignment="center"
        onClose={() => setModalExito(false)}
      >
        <CModalHeader className="auth-modal-header">Registro Exitoso</CModalHeader>
        <CModalBody className="d-flex align-items-center gap-3 py-3">
          <CIcon icon={cilCheckCircle} style={{ color: '#1b8a4e', fontSize: '1.5rem', flexShrink: 0 }} />
          <span>{String(mensajeExito)}</span>
        </CModalBody>
        <CModalFooter>
          <CButton
            className="btn-auth-dorado"
            onClick={() => {
              setModalExito(false)
              navigate('/login')
            }}
          >
            Ir al Login
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ======== Card principal ======== */}
      <CCard className="auth-card auth-card--wide">

        {/* --- Cabecera --- */}
        <div className="auth-card__header">
          <div className="auth-card__logo-wrap">
            <div className="auth-card__logo-placeholder">🎰</div>
          </div>
          <h1 className="auth-card__title">Registro de Usuario</h1>
          <p className="auth-card__subtitle">Lotería del Táchira — Sistema de Licencias</p>
        </div>

        {/* --- Cuerpo --- */}
        <CCardBody className="auth-card__body">
          <CForm onSubmit={handleSubmit} noValidate>

            {/* Fila 1: Username / Email */}
            <div className="auth-row-double">
              <div className="auth-input-group">
                <CFormLabel className="auth-label">Nombre de Usuario *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    name="username"
                    placeholder="usuario123"
                    value={formData.username}
                    onChange={handleInputChange}
                    autoComplete="username"
                    required
                  />
                </CInputGroup>
              </div>

              <div className="auth-input-group">
                <CFormLabel className="auth-label">Correo Electrónico *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilEnvelopeClosed} />
                  </CInputGroupText>
                  <CFormInput
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    required
                  />
                </CInputGroup>
              </div>
            </div>

            {/* Fila 2: Contraseña / Confirmar */}
            <div className="auth-row-double">
              <div className="auth-input-group">
                <CFormLabel className="auth-label">Contraseña *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    name="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    required
                  />
                </CInputGroup>
              </div>

              <div className="auth-input-group">
                <CFormLabel className="auth-label">Confirmar Contraseña *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Repite la contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    required
                  />
                </CInputGroup>
                {passMatch === true && (
                  <small className="auth-feedback auth-feedback--ok">✔ Las contraseñas coinciden</small>
                )}
                {passMatch === false && (
                  <small className="auth-feedback auth-feedback--err">✖ Las contraseñas no coinciden</small>
                )}
              </div>
            </div>

            {/* Botón de registro */}
            <CButton
              type="submit"
              className="btn-auth-primary mt-2"
              disabled={loadingAction || passMatch === false}
            >
              {loadingAction ? 'Registrando...' : 'Crear Cuenta'}
            </CButton>
          </CForm>
        </CCardBody>

        {/* --- Footer --- */}
        <CCardFooter className="auth-card__footer">
          <span style={{ fontSize: '0.82rem', color: 'var(--lot-texto-sec)' }}>
            ¿Ya tienes una cuenta?
          </span>
          <button
            type="button"
            className="btn-auth-link"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
        </CCardFooter>
      </CCard>
    </div>
  )
}

export default RegisterView
