import LiveNodeList from 'live-node-list'
import { bind } from 'decko'
import { isInViewport } from '../helpers'

/**
 * Creates an Intersection observer to lazy load images
 * matching a specific selector. Images matching selector
 * must have either an `data-src` or `data-srcset` attribute.
 * After the image is successfully loaded, both `data-src` and
 * `data-srcset` attributes are removed, allowing before and
 * after states to be styled in CSS
 *
 * @type {ImageLazyLoader}
 */
export default class ImageLazyLoader {
  /**
   * The default config for lazy loader instances
   *
   * @type {object}
   */
  config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '100px 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  }

  /**
   * @type {string}
   */
  containerSelector = '.lazy-load-container'

  /**
   * The selector used to gather images
   *
   * @type {String}
   */
  selector = null

  /**
   * The node list in which we'll store all the images
   * to be lazy loaded
   *
   * @type {NodeList}
   */
  images = null

  /**
   * A node list containing lazy load containers
   *
   * @type {NodeList}
   */
  containers = null

  /**
   * The IntersectionObserver instance powering this lazy loader
   *
   * @type {IntersectionObserver}
   */
  observer = null

  /**
   * @type {boolean}
   */
  paused = false

  /**
   * Create the lazy loader instance
   *
   * @param {string} selector
   * @param {object} config
   */
  constructor (selector, config = {}) {
    this.selector = selector

    // Merge optional config with the default
    this.config = {
      ...this.config,
      ...config
    }

    this.collect()

    this.images.forEach(image => {
      if (isInViewport(image)) {
        this.load(image)
      }
    })

    // Create the IntersectionObserver instance and observe each
    // of the images and containers matching our selector
    this.observer = new IntersectionObserver(this.intersect, this.config)
    this.observe()
  }

  /**
   * Collect images and containers on the page to be lazy loaded
   */
  @bind
  collect () {
    // Select all the images to be lazy loaded
    this.images = new LiveNodeList(this.selector)
    this.containers = new LiveNodeList(this.containerSelector)

    this.images.on('update', (newItems, oldItems) => {
      oldItems.forEach(item => this.observer.unobserve(item))
      newItems.forEach(item => this.observer.observe(item))
    })

    this.containers.on('update', (newItems, oldItems) => {
      oldItems.forEach(item => this.observer.unobserve(item))
      newItems.forEach(item => this.observer.observe(item))
    })
  }

  /**
   * Begin observation for each of the collected elements
   */
  @bind
  observe () {
    this.images.forEach(image => this.observer.observe(image))
    this.containers.forEach(container => this.observer.observe(container))
  }

  /**
   * Begin observation for each of the collected elements
   */
  @bind
  unobserve () {
    this.images.forEach(image => this.observer.unobserve(image))
    this.containers.forEach(container => this.observer.unobserve(container))
  }

  /**
   * Handle a list of entries when an intersection occurs
   *
   * @param {Array} entries
   */
  @bind
  intersect (entries) {
    if (this.paused) {
      return
    }

    // Loop through the entries
    entries.forEach(entry => {
      // Are we in viewport?
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        // If the entry is a container, load all the images within it
        if (entry.target.matches(this.containerSelector)) {
          Promise.all(Array.prototype.map.call(entry.target.querySelectorAll(this.selector), this.load)).then(() => {
            this.observer.unobserve(entry.target)
          })

          return
        }

        this.load(entry.target).then(() => {
          // Stop watching and load the image
          this.observer.unobserve(entry.target)
        })
      }
    })
  }

  /**
   * Load an image
   *
   * @param {HTMLImageElement} image
   */
  @bind
  load (image) {
    return new Promise((resolve, reject) => {
      // Remove the data-src and data-srcset attributes when
      // the image has successfully loaded
      image.addEventListener('load', () => {
        requestAnimationFrame(() => {
          image.removeAttribute('data-lazy-load-src')
          image.removeAttribute('data-lazy-load-srcset')

        })

        // If image is within a slideshow, trigger a transition to ensure that
        // the slide is in the correct position. This is necessary because until
        // the image is loaded the slide may be of an incorrect size
        const slideshow = image.closest('.slideshow')
        if (slideshow && slideshow.magicRoundabout) {
          slideshow.magicRoundabout.transition()
        }

        resolve(true)
      })

      image.addEventListener('error', e => {
        reject(e)
      })

      // Set the srcset or src attribute on the image.
      // We prefer srcset if it is defined
      if ('srcset' in image && 'lazyLoadSrcset' in image.dataset) {
        image.srcset = image.dataset.lazyLoadSrcset
      } else if ('lazyLoadSrc' in image.dataset) {
        image.src = image.dataset.lazyLoadSrc
      }

    })
  }

  /**
   * Unobserve the current list of images and reselect all images on the page
   *
   * @return {void}
   */
  @bind
  refreshImages () {
    this.unobserve()
    this.collect()
    this.observe()
  }

  /**
   * @return {void}
   */
  @bind
  pause () {
    this.paused = true
  }

  /**
   * @return {void}
   */
  @bind
  unpause () {
    this.paused = false
  }
}
