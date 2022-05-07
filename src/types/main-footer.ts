import { Link } from '@superrb/gatsby-addons/types'
import { graphql } from 'gatsby'

interface MainFooter {
  data: {
    navigation_items: Array<{
      label: string
      link: Link
    }>
  }
}

export const query = graphql`
  fragment MainFooter on PrismicMainFooter {
    data {
      navigation_items {
        label
        link {
          link_type
          type
          uid
          url
        }
      }
    }
  }
`

export default MainFooter
