import { bind } from 'decko'
import { LiveNodeList } from 'live-node-list'

export default class Favicon {
  /**
   * @type {LiveNodeList}
   */
  favicons = new LiveNodeList('link[rel$="icon"]')

  /**
   *
   */
  constructor() {
    this.registerListeners()
  }

  /**
   *
   */
  @bind
  registerListeners() {
    this.favicons.addDelegatedEventListener(window, 'visibilitychange', this.toggleFavicon, {
      passive: true
    })
  }

  /**
   *
   */
  @bind
  toggleFavicon() {
    this.favicons.forEach(favicon => {
      const defaultFavicon = favicon.getAttribute('data-default-favicon')
      const altFavicon = favicon.getAttribute('data-alt-favicon')

      if (document.visibilityState === 'hidden') {
        favicon.setAttribute('href', altFavicon)
      } else {
        favicon.setAttribute('href', defaultFavicon)
      }
    })
  }
}
