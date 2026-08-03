import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilBuilding,
  cilFactory,
  cilLocationPin,
  cilClipboard,
  cilTask,
  cilPaperclip,
  cilBank,
  cilGamepad,
  cilShieldAlt,
  cilUser,
  cilCreditCard,
} from '@coreui/icons'

/**
 * Configuracion de navegacion del sidebar.
 * Cada objeto puede ser de tipo:
 *   - { component: CNavTitle, name }
 *   - { component: CNavItem, name, to, icon }
 *   - { component: CNavGroup, name, icon, items: [...] }
 */
const _nav = [
  // INICIO
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

  // ENTIDADES
  {
    component: CNavTitle,
    name: 'Gestion de Entidades',
  },
  {
    component: CNavGroup,
    name: 'Personas',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/personas/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/personas/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Operadoras',
    icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'lista',
        to: '/operadoras/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/operadoras/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Comercializadores',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/comercializadores/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/comercializadores/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Centros de Apuesta',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/centros-apuesta/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/centros-apuesta/registro',
        indent: true,
      },
    ],
  },

  // TRAMITES
  {
    component: CNavTitle,
    name: 'Tramites y Documentos',
  },
  {
    component: CNavGroup,
    name: 'Solicitudes',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/solicitudes/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/solicitudes/registro',
        indent: true,
      },
    ],
  },

  // DOCUMENTOS EMITIDOS
  {
    component: CNavTitle,
    name: 'Documentos Emitidos',
  },
  {
    component: CNavGroup,
    name: 'Licencias',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/licencias/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/licencias/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Participaciones',
    icon: <CIcon icon={cilPaperclip} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/participaciones/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/participaciones/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Autorizaciones Especiales',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/autorizaciones/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/autorizaciones/registro',
        indent: true,
      },
    ],
  },

  // CATALOGOS
  {
    component: CNavTitle,
    name: 'Catalogos',
  },
  {
    component: CNavGroup,
    name: 'Bancos',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/bancos/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/bancos/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Juegos',
    icon: <CIcon icon={cilGamepad} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/juegos/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/juegos/registro',
        indent: true,
      },
    ],
  },

  // ADMINISTRACION
  {
    component: CNavTitle,
    name: 'Administracion',
  },
  {
    component: CNavGroup,
    name: 'Usuarios',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/usuarios/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/usuarios/registro',
        indent: true,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Pagos',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Lista',
        to: '/pagos/lista',
        indent: true,
      },
      {
        component: CNavItem,
        name: 'Registro',
        to: '/pagos/registro',
        indent: true,
      },
    ],
  },
]

export default _nav
