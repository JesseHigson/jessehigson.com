import React from 'react'
import { Helmet } from 'react-helmet'
import { SkipTo } from './skip-to'
import Header from './header'
import Footer from './footer'
import { graphql, useStaticQuery } from 'gatsby'

export const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </Helmet>
      <SkipTo />
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
