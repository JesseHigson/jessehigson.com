// Import our default set of polyfills
import polyfill from './polyfills'

// Import Turbolinks for navigation
import Turbolinks from 'turbolinks'

// Import dependencies
import { bind } from 'decko'

// Import components
import ImageLazyLoader from './components/image-lazy-loader'
import Animator from './components/animator'
import FontLoader from './font-loader'

/**
 * The main wrapper around our app's functionality
 *
 * @type {App}
 */
class App {
  /**
   * An object for storing application components
   *
   * @type {object}
   */
  components = {}

  /**
   * Create the application instance
   */
  constructor () {
    this.refreshHtmlClasses(document.body)

    // Start the font loader
    this.fontLoader = new FontLoader()

    this.registerComponents()
    this.registerCSSOnLoadEvent()

    polyfill()
  }

  /**
   * Register an onload event for CSS stylesheets (both sync and async)
   */
  registerCSSOnLoadEvent () {
    const stylesheets = document.styleSheets
    const promises = [...stylesheets].map(stylesheet => {
      return new Promise((resolve, reject) => {
        // Stylesheets embedded in style tags will not have a href, and will never
        // fire the load event
        if (stylesheet.href === null) {
          return resolve(stylesheet)
        }

        // Stylesheets from third-party domains cannot be parsed due to CORS restrictions
        const url = new URL(stylesheet.href)
        if (url.host !== window.location.host) {
          return resolve(stylesheet)
        }

        // Add an event listener for the load of event on the stylesheet's link
        if (stylesheet.ownerNode) {
          stylesheet.ownerNode.addEventListener('load', e => {
            resolve(stylesheet)
          })
        }

        try {
          // See if CSS Rules already exist within the stylesheet.
          // If they do, the stylesheet is already loaded and parsed, and we don't
          // need to rely on the load event
          if (stylesheet.cssRules && stylesheet.cssRules.length > 0) {
            return resolve(stylesheet)
          }
        } catch (err) {
          // InvalidAccessError is thrown if CSS has not yet finished parsing
          // If this is the case, we let the error slide and add the event listener,
          // but rethrow any other errors to catch legitimate bugs
          if (err.name !== 'InvalidAccessError') {
            throw err
          }
        }
      })
    })

    Promise.all(promises)
      .then(() => {
        let evt

        if (typeof Event === 'function') {
          evt = new Event('css:load')
        } else {
          evt = document.createEvent('Event')
          evt.initEvent('css:load', true, true)
        }

        document.dispatchEvent(evt)
      })
  }

  /**
   * Register individual application components here
   */
  registerComponents () {
    // Create the image lazy loader. To handle different groups of images,
    // create individual ImageLazyLoader instances for each selector
    this.components.imageLazyLoader = new ImageLazyLoader('img[data-lazy-load-src], img[data-lazy-load-srcset], picture source[data-lazy-load-srcset]')
    this.components.animator = new Animator('.animate-on-scroll')
  }

  /**
   * Transfer classes from the body to HTML so that they can remain
   * consistent whilst the page is transitioning
   *
   * @param {HTMLElement} el
   */
  @bind
  refreshHtmlClasses (el) {
    for (let className of document.documentElement.classList.values()) {
      if (className === 'page' || className.startsWith('page')) {
        document.documentElement.classList.remove(className)
      }
    }

    for (let className of el.classList.values()) {
      if (className === 'page' || className.startsWith('page')) {
        document.documentElement.classList.add(className)
      }
    }
  }

  /**
   * Triggered once a navigation is complete
   */
  @bind
  handleReload () {
    setTimeout(() => {
      document.documentElement.classList.remove('loading')
    }, 50)
    this.refreshHtmlClasses(document.body)
  }

  /**
   * Triggered before a page (or it's cached equivalent) is rendered
   *
   * @param {Event} e
   */
  @bind
  handleBeforeRender (e) {
    this.refreshHtmlClasses(e.data.newBody)
  }

  /**
   * Triggered when a page (or it's cached equivalent) is loaded
   *
   * @param {Event} e
   */
  @bind
  handleRender (e) {
    this.components.imageLazyLoader.unpause()
    this.components.animator.unpause()
    setTimeout(() => {
      document.documentElement.classList.remove('loading')
    }, 50)
  }

  /**
   * Triggered immediately before a navigation action
   *
   * @param {Event} e
   */
  @bind
  handleBeforeVisit (e) {
    this.components.imageLazyLoader.pause()
    this.components.animator.pause()
    document.documentElement.classList.add('loading')
  }

  /**
   * Triggered at the start of a navigation action
   *
   * @param {Event} e
   */
  @bind
  handleVisit (e) {
    this.components.imageLazyLoader.pause()
    this.components.animator.pause()
    document.documentElement.classList.add('loading')
  }
}

window.app = new App()
document.addEventListener('turbolinks:load', window.app.handleReload)
document.addEventListener('turbolinks:before-render', window.app.handleBeforeRender)
document.addEventListener('turbolinks:render', window.app.handleRender)
document.addEventListener('turbolinks:before-visit', window.app.handleBeforeVisit)
document.addEventListener('turbolinks:visit', window.app.handleVisit)

Turbolinks.start()
Turbolinks.setProgressBarDelay(100)
