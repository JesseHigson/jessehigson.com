import * as React from 'react'
import { withPrismicUnpublishedPreview } from 'gatsby-plugin-prismic-previews'

const NotFoundPage = () => (
  <section className="error">
    <div className="error__container container">
      <div className="error__content">
        <h1 className="error__title">404</h1>
        <h3 className="error__subtitle">
          The page you are looking for was not found
        </h3>
        <a href="/" className="error__link">
          Return to homepage
        </a>
      </div>
    </div>
  </section>
)

export default withPrismicUnpublishedPreview(NotFoundPage)
