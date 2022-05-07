import { PrismicProvider } from '@prismicio/react'
import { Link } from 'gatsby'
import { PrismicPreviewProvider } from 'gatsby-plugin-prismic-previews'
import * as React from 'react'
import { StateInspector } from 'reinspect'
import { Layout } from './src/components/layout'
import './src/stylesheets/style.sass'
import { repositoryConfigs } from './src/utils/prismic-previews'

export const wrapRootElement = ({ element }) => (
  <StateInspector name="App">
    <PrismicProvider
      internalLinkComponent={({ href, ...props }) => (
        <Link to={href} {...props} />
      )}
    >
      <PrismicPreviewProvider repositoryConfigs={repositoryConfigs}>
        <Layout>{element}</Layout>
      </PrismicPreviewProvider>
    </PrismicProvider>
  </StateInspector>
)

export const onRouteUpdate = ({ location: { pathname } }) => {
  if (pathname === '/') {
    pathname = 'home'
  }

  document.body.setAttribute(
    'class',
    `page ${[
      ...pathname
        .split('/')
        .filter(x => !!x)
        .map(slug => `page--${slug}`),
    ].join(' ')}`,
  )
}
