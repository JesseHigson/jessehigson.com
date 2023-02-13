import { graphql } from 'gatsby'
import React from 'react'
import Homepage from '../types/pages/homepage'
import { Image, Seo } from '@superrb/gatsby-addons/components'
import { RichText } from 'prismic-reactjs'
import Nav from '../components/nav'
import { useIsMobile } from '@superrb/gatsby-addons/hooks'

const Index = ({ data }) => {
  /** @type {Homepage} page */
  const page = data.page
  if (!page) {
    return null
  }

  const {
    data: { page_title, headshot },
  } = page

  const isMobile = useIsMobile()

  return (
    <>
      <Seo data={page.data} />

      <section className="hero">
        <div className="hero__container container">
          <div className="hero__content">
            {headshot && (
              <Image
                image={headshot}
                className="hero__headshot"
              />
            )}

            {page_title && (
              <h1 className="hero__title">
                <RichText render={page_title.richText} />
              </h1>
            )}

            {isMobile && (
              <Nav classes="hero__nav" />
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export const query = graphql`
  query HomepageQuery {
    page: prismicHomepage {
      ...Homepage
    }
  }
`

export default Index
