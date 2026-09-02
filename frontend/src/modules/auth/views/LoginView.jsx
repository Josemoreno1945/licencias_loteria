import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { extractErrorMessage } from '../../../utils/errorHandler'
import {
  CButton,
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
  cilLockLocked,
  cilEnvelopeClosed,
  cilWarning,
} from '@coreui/icons'
import loteriaLogo from '../../../assets/images/loteria-del-tachira-logo-png_seeklogo-535936.png'
import '../styles/auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ------------------------------------------------------------------ */
/*  LoginView — Lotería del Táchira                                    */
/*  Sistema cerrado: 4 usuarios. Sin registro público.                 */
/*  Sin recuperación: contactar al administrador.                      */
/* ------------------------------------------------------------------ */
const LoginView = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  const [modalError, setModalError] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      return 'Por favor completa todos los campos.'
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      return 'El correo electrónico no tiene un formato válido.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setMensajeError(validationError)
      setModalError(true)
      return
    }

    setLoadingAction(true)
    try {
      await login(
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        rememberMe,
      )
      navigate('/dashboard')
    } catch (err) {
      // Mensaje genérico para no filtrar si el email existe o no.
      setMensajeError(extractErrorMessage(err, 'Usuario o contraseña incorrectos.'))
      setModalError(true)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ======== Overlay: Cargando ======== */}
      {loadingAction && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">
            <CSpinner style={{ color: 'var(--lot-azul-med)' }} />
            <span style={{ color: 'var(--lot-azul)', fontWeight: 500, marginTop: '0.75rem' }}>
              Iniciando sesión...
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
        <CModalBody className="py-3" role="alert" aria-live="assertive">
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

      {/* ======== Split Card (branding + form) ======== */}
      <div className="auth-card">

        {/* --- Panel izquierdo: branding --- */}
        <aside className="auth-card__brand">
          <div className="auth-card__brand-inner">
            <div className="auth-card__logo-wrap">
              <img
                src={loteriaLogo}
                alt="Logo Lotería del Táchira"
                className="auth-card__logo"
              />
            </div>
            <div className="auth-card__brand-divider" aria-hidden="true" />
            <p className="auth-card__brand-tag">Sistema de Archivo y Consulta</p>
          </div>
          <div className="auth-card__brand-decor" aria-hidden="true">
            <span className="decor-circle decor-circle--1" />
            <span className="decor-circle decor-circle--2" />
            <span className="decor-circle decor-circle--3" />
          </div>
        </aside>

        {/* --- Panel derecho: formulario --- */}
        <main className="auth-card__form">
          <div className="auth-card__form-head">
            <h1 className="auth-card__title">Bienvenido</h1>
            <p className="auth-card__subtitle">Inicia sesión para continuar</p>
          </div>

          <CForm onSubmit={handleSubmit} noValidate className="auth-form">

            <div className="auth-input-group">
              <CFormLabel className="auth-label">Correo electrónico</CFormLabel>
              <CInputGroup>
                <CInputGroupText className="auth-input-icon">
                  <CIcon icon={cilEnvelopeClosed} />
                </CInputGroupText>
                <CFormInput
                  type="email"
                  name="email"
                  placeholder="usuario@loteria.gob.ve"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </CInputGroup>
            </div>

            <div className="auth-input-group">
              <CFormLabel className="auth-label">Contraseña</CFormLabel>
              <CInputGroup>
                <CInputGroupText className="auth-input-icon">
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.45 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </CInputGroup>
            </div>

            <div className="auth-form__row">
              <label className="auth-remember" title="Mantener la sesión iniciada en este dispositivo">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Recordarme en este dispositivo</span>
              </label>
            </div>

            <CButton
              type="submit"
              className="btn-auth-primary"
              disabled={loadingAction}
            >
              {loadingAction ? 'Ingresando...' : 'Iniciar Sesión'}
            </CButton>

            <div className="auth-form__notice">
              <CIcon icon={cilWarning} className="auth-form__notice-icon" />
              <span>
                ¿Problemas para acceder? Contacte al administrador del sistema
                para restablecer sus credenciales.
              </span>
            </div>
          </CForm>
        </main>
      </div>

      <footer className="auth-page__footer">
        © {new Date().getFullYear()} Lotería del Táchira · Gerencia de Productos
      </footer>
    </div>
  )
}

export default LoginView
