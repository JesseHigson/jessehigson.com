import { Link } from '@superrb/gatsby-addons/types'
import { graphql } from 'gatsby'

interface MainFooter {
  data: {
    contact_link: Link
    contact_link_text: string
  }
}

export const query = graphql`
  fragment MainFooter on PrismicMainFooter {
    data {
      contact_link {
        uid
        url
        type
        link_type
        target
      }
      contact_link_text
    }
  }
`

export default MainFooter
