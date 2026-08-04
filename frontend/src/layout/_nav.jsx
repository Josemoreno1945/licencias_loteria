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

// ─── Grupos de roles (nombres exactos de la tabla `rol` en bdd.sql) ──────────
const TODOS    = ['superAdmin', 'gerente', 'gestor_de_tramites', 'supervisor']
const GESTORES = ['superAdmin', 'gerente', 'gestor_de_tramites'] // escritura general (sin supervisor)
const ADMINS   = ['superAdmin', 'gerente']                       // solo administradores

// ─── Definición base de la navegación ────────────────────────────────────────
/**
 * Cada ítem puede incluir la propiedad `roles` con la lista de roles que lo ven.
 * Si un CNavGroup queda sin sub-ítems visibles, se descarta automáticamente.
 * Si un CNavTitle queda sin contenido visible debajo, también se descarta.
 */
const _navBase = [

  // ── INICIO ────────────────────────────────────────────────────────────────
  { component: CNavTitle, name: 'Principal', roles: TODOS },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    roles: TODOS,
  },

  // ── ENTIDADES ─────────────────────────────────────────────────────────────
  { component: CNavTitle, name: 'Gestion de Entidades', roles: TODOS },
  {
    component: CNavGroup,
    name: 'Personas',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/personas/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/personas/registro', indent: true, roles: GESTORES },
    ],
  },
  {
    component: CNavGroup,
    name: 'Operadoras',
    icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/operadoras/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/operadoras/registro', indent: true, roles: GESTORES },
    ],
  },
  {
    component: CNavGroup,
    name: 'Comercializadores',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/comercializadores/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/comercializadores/registro', indent: true, roles: GESTORES },
    ],
  },
  {
    component: CNavGroup,
    name: 'Centros de Apuesta',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/centros-apuesta/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/centros-apuesta/registro', indent: true, roles: GESTORES },
    ],
  },

  // ── TRÁMITES ──────────────────────────────────────────────────────────────
  { component: CNavTitle, name: 'Tramites y Documentos', roles: TODOS },
  {
    component: CNavGroup,
    name: 'Solicitudes',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/solicitudes/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/solicitudes/registro', indent: true, roles: GESTORES },
    ],
  },

  // ── DOCUMENTOS EMITIDOS ───────────────────────────────────────────────────
  { component: CNavTitle, name: 'Documentos Emitidos', roles: TODOS },
  {
    component: CNavGroup,
    name: 'Licencias',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/licencias/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/licencias/registro', indent: true, roles: GESTORES },
    ],
  },
  {
    component: CNavGroup,
    name: 'Participaciones',
    icon: <CIcon icon={cilPaperclip} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/participaciones/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/participaciones/registro', indent: true, roles: GESTORES },
    ],
  },
  {
    component: CNavGroup,
    name: 'Autorizaciones Especiales',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/autorizaciones/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/autorizaciones/registro', indent: true, roles: GESTORES },
    ],
  },

  // ── CATÁLOGOS ─────────────────────────────────────────────────────────────
  { component: CNavTitle, name: 'Catalogos', roles: TODOS },
  {
    component: CNavGroup,
    name: 'Bancos',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/bancos/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/bancos/registro', indent: true, roles: GESTORES },
    ],
  },
  {
    component: CNavGroup,
    name: 'Juegos',
    icon: <CIcon icon={cilGamepad} customClassName="nav-icon" />,
    roles: TODOS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/juegos/lista',    indent: true, roles: TODOS    },
      { component: CNavItem, name: 'Registro', to: '/juegos/registro', indent: true, roles: GESTORES },
    ],
  },

  // ── ADMINISTRACIÓN ────────────────────────────────────────────────────────
  // El título de Administración solo aparece para admins (por la sección Usuarios).
  // Pagos es accesible para GESTORES, pero al vivir bajo el mismo título se mueve
  // a un bloque propio para no ocultar Pagos a gestores_de_tramites.
  { component: CNavTitle, name: 'Pagos', roles: GESTORES },
  {
    component: CNavGroup,
    name: 'Pagos',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    roles: GESTORES,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/pagos/lista',    indent: true, roles: GESTORES },
      { component: CNavItem, name: 'Registro', to: '/pagos/registro', indent: true, roles: GESTORES },
    ],
  },

  { component: CNavTitle, name: 'Administracion', roles: ADMINS },
  {
    component: CNavGroup,
    name: 'Usuarios',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    roles: ADMINS,
    items: [
      { component: CNavItem, name: 'Lista',    to: '/usuarios/lista',    indent: true, roles: ADMINS },
      { component: CNavItem, name: 'Registro', to: '/usuarios/registro', indent: true, roles: ADMINS },
    ],
  },
]

// ─── Función pública de filtrado ─────────────────────────────────────────────
/**
 * Devuelve los items de navegación filtrados según el rol del usuario autenticado.
 *
 * Roles válidos (tabla `rol` en bdd.sql):
 *   superAdmin | gerente | gestor_de_tramites | supervisor
 *
 * @param {string} rol - El rol del usuario desde AuthContext
 * @returns {Array}    - Items listos para pasarle a <AppSidebarNav />
 */
export const getNavItems = (rol) => {
  if (!rol) return []

  // 1. Filtrar ítems raíz y limpiar sub-ítems de los grupos
  const filtered = _navBase
    .filter((item) => item.roles?.includes(rol) ?? true)
    .map((item) => {
      if (!item.items) return item
      const visibles = item.items.filter((sub) => sub.roles?.includes(rol) ?? true)
      if (visibles.length === 0) return null
      return { ...item, items: visibles }
    })
    .filter(Boolean)

  // 2. Eliminar CNavTitle huérfanos (sin ningún item de contenido después de ellos
  //    antes del siguiente CNavTitle o del fin del array)
  return filtered.filter((item, i, arr) => {
    if (item.component !== CNavTitle) return true
    const next = arr[i + 1]
    return next != null && next.component !== CNavTitle
  })
}

export default getNavItems
