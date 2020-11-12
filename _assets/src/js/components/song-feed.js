import { LiveElement } from 'live-node-list'
import { bind } from 'decko'

/**
 * @type {string}
 */
const API_KEY = `4fea93fcce575c984478257bc9d88b7e`

/**
 * @type {string}
 */
const LAST_FM_USER = `jessehigson`

/**
 * @type {string}
 */
const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=` + LAST_FM_USER + `&api_key=` + API_KEY + `&format=json&limit=1`

export default class SongFeed {

  /**
   * @type {LiveElement}
   */
  feedContainer = new LiveElement('#song-feed')

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
    this.injectElements()

    this.feedContainer.on('update', (newItems, oldItems) => {
      this.injectElements()
    })
  }


  /**
   *
   */
  @bind
  async injectElements() {
    if (!this.feedContainer.item) {
      return
    }

    this.feedContainer.pause()

    console.log('testing 1')

    await fetch(API_URL, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        const resultsData = Object.keys(data.recenttracks.track).map(id => `
          The last song I listened to was 
          <a href="${ data.recenttracks.track[id].url }" target="_blank" class="song-feed__link link">
            ${ data.recenttracks.track[id].name } by ${ data.recenttracks.track[id].artist['#text'] }
          </a>.
        `).join('')

        this.feedContainer.item.innerHTML = resultsData
      })

      this.feedContainer.resume()
  }
}
