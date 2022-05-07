import { graphql, Link } from 'gatsby'
import React from 'react'
import Homepage from '../types/pages/homepage'
import { Seo } from '@superrb/gatsby-addons/components'

const Index = ({ data }) => {
  /** @type {Homepage} page */
  const page = data.page
  if (!page) {
    return null
  }

  const {
    data: { page_title, contact_link, contact_link_text },
  } = page

  return (
    <>
      <Seo data={page.data} />
      <section className="hero">
        <div className="hero__container container">
          {page_title && <h1>{page_title}</h1>}

          {contact_link && contact_link_text && (
            <a 
              href={contact_link?.url}
              target={contact_link?.link?.target ? contact_link?.link?.target : ''}
              className="hero__contact-link"
            >
              { contact_link_text }
            </a>
          )}
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
