import { graphql } from 'gatsby'
import { Page } from '@superrb/gatsby-addons/types'

interface Homepage extends Page {
  data: Page['data']
}

export const query = graphql`
  fragment Homepage on PrismicHomepage {
    _previewable
    uid
    id
    type
    tags
    data {
      page_title
      contact_link {
        uid
        url
        type
        link_type
        target
      }
      contact_link_text
      headshot {
        gatsbyImageData(
          layout: CONSTRAINED
          imgixParams: { q: 85 }
          placeholder: BLURRED
          breakpoints: [750, 1080, 1366, 1920, 2048, 2560, 3840, 4096, 5120]
        )
      }

      meta_description
      meta_navigation_title
      meta_robots
      meta_title
      meta_image {
        fluid {
          base64
          src
        }
        gatsbyImageData(
          layout: CONSTRAINED
          imgixParams: { q: 65 }
          placeholder: BLURRED
          breakpoints: [750, 1080, 1366, 1920, 2048, 2560, 3840, 4096, 5120]
        )
      }
    }
  }
`

export default Homepage
