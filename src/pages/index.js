import { graphql, Link } from 'gatsby'
import React from 'react'
import Homepage from '../types/pages/homepage'
import { Image, Seo } from '@superrb/gatsby-addons/components'
import { RichText } from 'prismic-reactjs'

const Index = ({ data }) => {
  /** @type {Homepage} page */
  const page = data.page
  if (!page) {
    return null
  }

  const {
    data: { page_title, headshot, projects_title, projects },
  } = page

  return (
    <>
      <Seo data={page.data} />

      <section className="hero">
        <div className="hero__container container">
          <div className="hero__content">
            {headshot && <Image image={headshot} className="hero__headshot" />}

            {page_title && (
              <h1 className="hero__title">
                <RichText render={page_title.richText} />
              </h1>
            )}
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="projects__container container">
          {projects_title && (
            <h3 className="projects__title">{projects_title}</h3>
          )}

          {projects && (
            <ul className="projects__list">
              {projects.map((project, index) => (
                <li key={index} className="projects__list-item project-item">
                  {project?.project?.document?.data?.link && (
                    <Link
                      to={project?.project?.document?.data?.link?.url}
                      target="_blank"
                      className="project-item__link"
                    >
                      {project?.project?.document?.data?.image && (
                        <Image
                          image={project?.project?.document?.data?.image}
                          className="project-item__image"
                        />
                      )}

                      {project?.project?.document?.data?.title && (
                        <h5 className="project-item__title">
                          {project?.project?.document?.data?.title}
                        </h5>
                      )}

                      {project?.project?.document?.data?.description && (
                        <h6 className="project-item__description">
                          {project?.project?.document?.data?.description}
                        </h6>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
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
