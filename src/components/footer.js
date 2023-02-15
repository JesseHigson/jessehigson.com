import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import MainFooter from '../types/main-footer'
import { NowPlaying } from './now-playing'
import Nav from './nav'
import { useIsMobile } from '@superrb/gatsby-addons/hooks'

const Footer = () => {
  const data = useStaticQuery(graphql`
    query MainFooterQuery {
      footer: prismicMainFooter {
        ...MainFooter
      }
    }
  `)

  /** @type {MainFooter} footer */
  const footer = data?.footer

  if (!footer) {
    return null
  }

  const isMobile = useIsMobile()

  return (
    <footer className="footer">
      <div className="footer__container container container--flex">
        {isMobile && <Nav classes="footer__nav" />}

        <NowPlaying
          userName={process.env.GATSBY_LAST_FM_USERNAME}
          apiKey={process.env.GATSBY_LAST_FM_API_KEY}
          classes="footer__now-playing"
        />
      </div>
    </footer>
  )
}

export default Footer
