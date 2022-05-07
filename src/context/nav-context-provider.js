import { useLockBodyScroll } from '@superrb/gatsby-addons/hooks'
import React, { createContext, useCallback, useState } from 'react'

export const NavContext = createContext({
  navOpen: false,
  toggleNav: () => {},
  closeNav: () => {},
})

export const NavContextProvider = ({ children }) => {
  const [navOpen, setNavOpen] = useState(false)
  useLockBodyScroll(navOpen)

  const toggleNav = useCallback(() => {
    setNavOpen((navOpen) => !navOpen)
  }, [setNavOpen])

  const closeNav = useCallback(() => {
    setNavOpen(false)
  }, [setNavOpen])

  return (
    <NavContext.Provider value={{ navOpen, toggleNav, closeNav }}>
      {children}
    </NavContext.Provider>
  )
}

export default NavContextProvider
