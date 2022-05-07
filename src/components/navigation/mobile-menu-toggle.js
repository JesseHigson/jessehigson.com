import { useIsMobile } from '@superrb/gatsby-addons/hooks'
import React, { useCallback, useContext } from 'react'
import { NavContext } from '../../context/nav-context-provider'

const MenuToggle = ({
  className,
  label = 'Open Nav',
  closeLabel = 'Close Nav',
  ...props
}) => {
  const { navOpen, toggleNav } = useContext(NavContext)
  const isMobile = useIsMobile()

  return (
    <button
      className={`menu-toggle ${className}`}
      onClick={() => {
        toggleNav()
      }}
      aria-expanded={navOpen}
      aria-controls="main-nav"
      aria-hidden={!isMobile}
      {...props}
    >
      {navOpen ? '×' : '꠵'}
      <span className="screenreader-text">{navOpen ? closeLabel : label}</span>
    </button>
  )
}

export default MenuToggle
