const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

const prismicConfig = require('./prismic-configuration')

module.exports = {
  siteMetadata: {
    title: 'Jesse Higson',
    description: 'Jesse Higson is a developer from Portsmouth, UK currently building websites at Superrb.',
    siteUrl: 'https://jessehigson.com',
  },
  plugins: [
    {
      resolve: `gatsby-plugin-preload`,
      options: {
        preloaders: [
          {
            href: '/fonts/Inter-Regular.woff2',
            as: 'font',
            type: 'font/woff2',
          },
          {
            href: '/fonts/Inter-Medium.woff2',
            as: 'font',
            type: 'font/woff2',
          },
        ],
      },
    },
    {
      resolve: 'gatsby-source-prismic',
      options: {
        repositoryName: prismicConfig.prismicRepo,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
        customTypesApiToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
        linkResolver: require('./src/utils/link-resolver').linkResolver,
      },
    },
    {
      resolve: 'gatsby-plugin-prismic-previews',
      options: {
        repositoryName: prismicConfig.prismicRepo,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
      },
    },
    'gatsby-plugin-image',
    `gatsby-plugin-netlify`,
    'gatsby-plugin-sharp',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://jessehigson.com',
        sitemap: 'https://jessehigson.com/sitemap.xml',
        resolveEnv: () => process.env.NODE_ENV,
        env: {
          development: {
            policy: [{ userAgent: '*', disallow: ['/'] }],
          },
          production: {
            policy: [{ userAgent: '*', allow: '/' }],
          },
        },
      },
    },
    'gatsby-plugin-sass',
    `gatsby-plugin-sitemap`,
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: path.resolve(__dirname, 'src', 'images', 'favicon.png'),
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: path.resolve(__dirname, 'src', 'images'),
      },
    }
  ],
}
