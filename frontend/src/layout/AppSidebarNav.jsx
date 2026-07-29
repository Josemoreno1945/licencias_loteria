import { useLocation, NavLink } from 'react-router-dom'
import { CBadge, CNavItem, CNavGroup, CNavTitle } from '@coreui/react'
import PropTypes from 'prop-types'

/**
 * Renderiza recursivamente los items de navegación a partir de
 * la configuración declarada en _nav.jsx.
 */
const AppSidebarNav = ({ items }) => {
  const location = useLocation()

  // Determina si algún ítem hijo está activo (para resaltar el grupo)
  const isGroupActive = (groupItems = []) =>
    groupItems.some((item) => item.to && location.pathname.startsWith(item.to))

  const navLink = (name, icon, badge, indent = false) => (
    <>
      {icon && icon}
      {indent && <span className="nav-icon" />}
      {name && <span className="nav-link-name">{name}</span>}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  )

  const navItem = (item, index) => {
    const { component: Component, name, badge, icon, indent, ...rest } = item
    return (
      <Component as="div" key={index}>
        {rest.to ? (
          <NavLink
            {...(rest.to && { to: rest.to })}
            className={({ isActive }) =>
              ['nav-link', isActive ? 'active' : ''].join(' ')
            }
          >
            {navLink(name, icon, badge, indent)}
          </NavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component: Component, name, icon, items: children, ...rest } = item
    const active = isGroupActive(children)
    return (
      <Component
        compact
        as="div"
        key={index}
        toggler={navLink(name, icon)}
        visible={active}
        {...rest}
      >
        {children?.map((child, i) =>
          child.items ? navGroup(child, i) : navItem(child, i),
        )}
      </Component>
    )
  }

  return (
    <>
      {items &&
        items.map((item, index) => {
          if (item.component === CNavTitle) {
            return (
              <CNavTitle key={index}>{item.name}</CNavTitle>
            )
          }
          return item.items ? navGroup(item, index) : navItem(item, index)
        })}
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}

export default AppSidebarNav
