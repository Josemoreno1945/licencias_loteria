import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
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
  cilCheckCircle,
} from '@coreui/icons'
import '../styles/auth.css'

/* ------------------------------------------------------------------ */
/*  LoginView — Lotería del Táchira                                    */
/* ------------------------------------------------------------------ */
const LoginView = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  // --- Estado del formulario ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // --- Estados de UI ---
  const [loadingAction, setLoadingAction] = useState(false)
  const [actionLabel, setActionLabel] = useState('')

  const [mensajeError, setMensajeError] = useState('')
  const [modalError, setModalError] = useState(false)

  // --- Modal recuperar contraseña ---
  const [modalRecuperar, setModalRecuperar] = useState(false)
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [mensajeRecuperar, setMensajeRecuperar] = useState('')
  const [modalExito, setModalExito] = useState(false)

  /* ---- Handlers ---- */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación básica
    if (!formData.email.trim() || !formData.password.trim()) {
      setMensajeError('Por favor completa todos los campos.')
      setModalError(true)
      return
    }

    setLoadingAction(true)
    setActionLabel('Iniciando sesión...')
    try {
      await login(formData)
      // Primero apagamos el spinner, LUEGO navegamos para evitar el
      // crash aria-hidden de CoreUI al desmontar un CModal abierto.
      setLoadingAction(false)
      setActionLabel('')
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Credenciales inválidas. Intenta de nuevo.')
      setMensajeError(errorMsg)
      setModalError(true)
    } finally {
      setLoadingAction(false)
      setActionLabel('')
    }
  }

  const handleRecuperar = async () => {
    if (!emailRecuperar.trim()) {
      setMensajeError('Ingresa tu correo electrónico.')
      setModalError(true)
      return
    }
    setModalRecuperar(false)
    setLoadingAction(true)
    setActionLabel('Enviando correo...')
    try {
      // Simulación — reemplazar con llamada real: authService.forgotPassword(emailRecuperar)
      await new Promise((r) => setTimeout(r, 1200))
      setMensajeRecuperar(
        'Se ha enviado un enlace de recuperación a tu correo electrónico.',
      )
      setModalExito(true)
    } catch (err) {
      setMensajeError(
        err?.response?.data?.error || 'No se pudo enviar el correo de recuperación.',
      )
      setModalError(true)
    } finally {
      setLoadingAction(false)
      setActionLabel('')
      setEmailRecuperar('')
    }
  }

  /* ---- Render ---- */
  return (
    <div className="auth-page">

      {/* ======== Overlay: Cargando (sin CModal para evitar aria-hidden crash) ======== */}
      {loadingAction && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">
            <CSpinner style={{ color: 'var(--lot-azul-med, #321fdb)' }} />
            <span style={{ color: 'var(--lot-azul, #321fdb)', fontWeight: 500, marginTop: '0.75rem' }}>
              {actionLabel}
            </span>
          </div>
        </div>
      )}

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

      {/* ======== Modal: Éxito recuperación ======== */}
      <CModal
        visible={modalExito}
        backdrop="static"
        keyboard={false}
        onClose={() => setModalExito(false)}
        alignment="center"
      >
        <CModalHeader className="auth-modal-header">Mensaje</CModalHeader>
        <CModalBody className="d-flex align-items-center gap-3 py-3">
          <CIcon icon={cilCheckCircle} style={{ color: '#1b8a4e', fontSize: '1.4rem' }} />
          <span>{String(mensajeRecuperar)}</span>
        </CModalBody>
        <CModalFooter>
          <CButton
            className="btn-auth-cerrar"
            onClick={() => {
              setModalExito(false)
              setMensajeRecuperar('')
            }}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ======== Modal: Recuperar contraseña ======== */}
      <CModal
        visible={modalRecuperar}
        backdrop="static"
        keyboard={false}
        alignment="center"
        onClose={() => setModalRecuperar(false)}
      >
        <CModalHeader className="auth-modal-header">Recuperar contraseña</CModalHeader>
        <CModalBody className="py-3">
          <CFormLabel className="auth-label">Correo electrónico registrado</CFormLabel>
          <CInputGroup>
            <CInputGroupText style={{ background: 'var(--lot-azul)', borderColor: 'var(--lot-azul)', color: '#fff' }}>
              <CIcon icon={cilEnvelopeClosed} />
            </CInputGroupText>
            <CFormInput
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={emailRecuperar}
              onChange={(e) => setEmailRecuperar(e.target.value)}
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter className="gap-2">
          <CButton className="btn-auth-cerrar" onClick={() => setModalRecuperar(false)}>
            Cancelar
          </CButton>
          <CButton className="btn-auth-dorado" onClick={handleRecuperar}>
            Enviar enlace
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ======== Card principal ======== */}
      <CCard className="auth-card">

        {/* --- Cabecera --- */}
        <div className="auth-card__header">
          <div className="auth-card__logo-wrap">
            <div className="auth-card__logo-placeholder">🎰</div>
          </div>
          <h1 className="auth-card__title">Lotería del Táchira</h1>
          <p className="auth-card__subtitle">Sistema de Gestión de Licencias</p>
        </div>

        {/* --- Cuerpo --- */}
        <CCardBody className="auth-card__body">
          <CForm onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="auth-input-group">
              <CFormLabel className="auth-label">Correo electrónico</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilEnvelopeClosed} />
                </CInputGroupText>
                <CFormInput
                  type="email"
                  name="email"
                  placeholder="usuario@loteria.gob.ve"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                />
              </CInputGroup>
            </div>

            {/* Contraseña */}
            <div className="auth-input-group">
              <CFormLabel className="auth-label">Contraseña</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                />
              </CInputGroup>
            </div>

            {/* Acción principal */}
            <CButton
              type="submit"
              className="btn-auth-primary mt-2"
              disabled={loadingAction}
            >
              {loadingAction ? 'Ingresando...' : 'Iniciar Sesión'}
            </CButton>
          </CForm>
        </CCardBody>

        {/* --- Footer con links --- */}
        <CCardFooter className="auth-card__footer">
          <div className="auth-footer__links">
            <button
              type="button"
              className="btn-auth-link"
              onClick={() => navigate('/register')}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
          <button
            type="button"
            className="btn-auth-link"
            onClick={() => setModalRecuperar(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </CCardFooter>
      </CCard>
    </div>
  )
}

export default LoginView
