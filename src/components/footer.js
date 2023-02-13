import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import MainFooter from '../types/main-footer'
import { NowPlaying } from './now-playing'

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

  return (
    <footer className="footer">
      <div className="footer__container container container--flex">
        <NowPlaying
          userName={process.env.GATSBY_LAST_FM_USERNAME}
          apiKey={process.env.GATSBY_LAST_FM_API_KEY}
        />

        {footer.data.contact_link && footer.data.contact_link_text && (
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
      </div>
    </footer>
  )
}

export default Footer
