import React from 'react'
import { graphql, Link, useStaticQuery } from 'gatsby'
import MainHeader from '../types/main-header'
import MainFooter from '../types/main-footer'
import { SiteConfig } from '@superrb/gatsby-addons/types'

const Nav = ({ classes }) => {
  const data = useStaticQuery(graphql`
    query NavQuery {
      header: prismicMainHeader {
        ...MainHeader
      }
      footer: prismicMainFooter {
        ...MainFooter
      }
      config: prismicSiteConfig {
        ...SiteConfig
      }
    }
  `)

  /** @type {MainHeader} header */
  const header = data?.header

  /** @type {SiteConfig} config */
  const config = data?.config

  /** @type {MainFooter} footer */
  const footer = data?.footer

  if (!header || !config) {
    return null
  }

  return (
    <nav className={`nav ${classes ? classes : ''}`}>
      <ul className="nav__list">
        {header.data.navigation_items.map((link, index) => (
          <li key={index} className="nav__list-item">
            <Link
              to={link.link?.url}
              target="_blank"
              className="nav__list-link"
            >
              {link.label}
            </Link>
          </li>
        ))}

        {footer?.data?.contact_link && footer?.data?.contact_link_text && (
          <a
            href={footer.data.contact_link?.url}
            target={
              footer.data.contact_link?.link?.target
                ? footer.data.contact_link?.link?.target
                : ''
            }
            className="footer__contact-link"
          >
            {footer.data.contact_link_text}
          </a>
        )}
      </ul>
    </nav>
  )
}

export default Nav
