import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilBuilding,
  cilFactory,
  cilLocationPin,
  cilClipboard,
  cilDescription,
  cilTask,
  cilPaperclip,
  cilBank,
  cilGamepad,
  cilShieldAlt,
  cilUser,
  cilCreditCard,
} from '@coreui/icons'

/**
 * Configuración de navegación del sidebar.
 * Cada objeto puede ser de tipo:
 *   - { component: CNavTitle, name }
 *   - { component: CNavItem, name, to, icon }
 *   - { component: CNavGroup, name, icon, items: [...] }
 */
const _nav = [
  // ─── INICIO ──────────────────────────────────────────────
  {
    component: CNavTitle,
    name: 'Principal',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  // ─── ENTIDADES ───────────────────────────────────────────
  {
    component: CNavTitle,
    name: 'Gestión de Entidades',
  },
  {
    component: CNavItem,
    name: 'Personas',
    to: '/personas',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Operadoras',
    to: '/operadoras',
    icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Comercializadores',
    to: '/comercializadores',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Centros de Apuesta',
    to: '/centros-apuesta',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  },

  // ─── TRÁMITES ────────────────────────────────────────────
  {
    component: CNavTitle,
    name: 'Trámites y Documentos',
  },
  {
    component: CNavItem,
    name: 'Solicitudes',
    to: '/solicitudes',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Documentos Emitidos',
  },
  {
    component: CNavItem,
    name: 'Licencias',
    to: '/licencias',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Participaciones',
    to: '/participaciones',
    icon: <CIcon icon={cilPaperclip} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Autorizaciones Especiales',
    to: '/autorizaciones',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
  },

  // ─── CATÁLOGOS ───────────────────────────────────────────
  {
    component: CNavTitle,
    name: 'Catálogos',
  },
  {
    component: CNavItem,
    name: 'Bancos',
    to: '/bancos',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Juegos',
    to: '/juegos',
    icon: <CIcon icon={cilGamepad} customClassName="nav-icon" />,
  },

  // ─── ADMINISTRACIÓN ──────────────────────────────────────
  {
    component: CNavTitle,
    name: 'Administración',
  },
  {
    component: CNavItem,
    name: 'Usuarios',
    to: '/usuarios',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Pagos',
    to: '/pagos',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
  },
]

export default _nav
