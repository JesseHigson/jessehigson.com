import React, { useRef } from 'react'
import { graphql, Link, useStaticQuery } from 'gatsby'
import MainHeader from '../types/main-header'
import { SiteConfig } from '@superrb/gatsby-addons/types'
import { useIsMobile } from '@superrb/gatsby-addons/hooks'

const Header = ({ siteTitle }) => {
  const data = useStaticQuery(graphql`
    query MainHeaderQuery {
      header: prismicMainHeader {
        ...MainHeader
      }
      config: prismicSiteConfig {
        ...SiteConfig
      }
    }
  `)

  const isMobile = useIsMobile()
  const headerElement = useRef(null)

  /** @type {MainHeader} header */
  const header = data?.header
  if (!header) {
    return null
  }

  /** @type {SiteConfig} config */
  const config = data?.config
  if (!config) {
    return null
  }

  return (
    <header className="main-header" ref={headerElement}>
      <div className="main-header__container container container--flex">
        <Link to="/" className="main-header__logo">
          {siteTitle}
        </Link>
        <nav
          className="main-header__nav nav"
          aria-hidden={isMobile}
        >
          <ul className="nav__list">
            {header.data.navigation_items.map((link, index) => (
              <li key={index} className="nav__list-item">
                <Link to={link.link?.url} target="_blank" className="nav__list-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
