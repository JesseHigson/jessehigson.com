import objectFitImages from 'object-fit-images'
import LiveNodeList from 'live-node-list'
import { bind } from 'decko'

/**
 * Creates an Intersection observer to animate elements
 * matching a specific selector.
 *
 * @type {ImageLazyLoader}
 */
export default class Animator {
  /**
   * The default config for lazy loader instances
   *
   * @type {object}
   */
  config = {
    // If the element gets within 50px in the Y axis, start the download.
    rootMargin: '0px 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  }

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
   * @type {LiveNodeList}
   */
  elements = null

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

    // Create the IntersectionObserver instance and observe each
    // of the elements matching our selector
    this.observer = new IntersectionObserver(this.intersect, this.config)
    this.observe()
  }

  /**
   * Collect elements on the page to be animated
   */
  @bind
  collect () {
    // Select all the elements to be animated
    this.elements = new LiveNodeList(this.selector)
    this.elements.on('update', (newItems, oldItems) => {
      oldItems.forEach(item => this.observer.unobserve(item))
      newItems.forEach(item => this.observer.observe(item))
    })
  }

  /**
   * Begin observation for each of the collected elements
   */
  @bind
  observe () {
    this.elements.forEach(element => this.observer.observe(element))
  }

  /**
   * Begin observation for each of the collected elements
   */
  @bind
  unobserve () {
    this.elements.forEach(element => this.observer.unobserve(element))
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
        // Stop watching and load the image
        this.observer.unobserve(entry.target)

        this.animate(entry.target)
      }
    })
  }

  /**
   * Animate an element
   *
   * @param {HTMLElement} element
   */
  @bind
  animate (element) {
    element.classList.add('animated')
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
