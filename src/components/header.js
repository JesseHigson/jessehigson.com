import React, { useRef } from 'react'
import { graphql, Link, useStaticQuery } from 'gatsby'
import MainHeader from '../types/main-header'
import { SiteConfig } from '@superrb/gatsby-addons/types'
import { useIsMobile } from '@superrb/gatsby-addons/hooks'
import Nav from './nav'

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

        {!isMobile && (
          <Nav classes="main-header__nav" />
        )}
      </div>
    </header>
  )
}

export default Header
