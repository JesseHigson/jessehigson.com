import React from 'react'
import { graphql, Link, useStaticQuery } from 'gatsby'
import MainHeader from '../types/main-header'
import { SiteConfig } from '@superrb/gatsby-addons/types'

const Nav = ({classes}) => {
  const data = useStaticQuery(graphql`
    query NavQuery {
      header: prismicMainHeader {
        ...MainHeader
      }
      config: prismicSiteConfig {
        ...SiteConfig
      }
    }
  `)

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
    <nav className={`nav ${classes ? classes : ''}`}>
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
  )
}

export default Nav
