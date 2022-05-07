import { PrismicProvider } from '@prismicio/react'
import { Link } from 'gatsby'
import { PrismicPreviewProvider } from 'gatsby-plugin-prismic-previews'
import * as React from 'react'
import { Layout } from './src/components/layout'
import './src/stylesheets/style.sass'
import { repositoryConfigs } from './src/utils/prismic-previews'

export const wrapRootElement = ({ element }) => (
  <PrismicProvider
    internalLinkComponent={({ href, ...props }) => (
      <Link to={href} {...props} />
    )}
  >
    <PrismicPreviewProvider repositoryConfigs={repositoryConfigs}>
      <Layout>{element}</Layout>
    </PrismicPreviewProvider>
  </PrismicProvider>
)
