import { LiveElement } from 'live-node-list'
import { bind } from 'decko'
import SpotifyWebApi from 'spotify-web-api-js'

/**
 * @type {string}
 */
const LAST_FM_API_KEY = `4fea93fcce575c984478257bc9d88b7e`

/**
 * @type {string}
 */
const LAST_FM_USER = `jessehigson`

/**
 * @type {string}
 */
const LAST_FM_API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=` + LAST_FM_USER + `&api_key=` + LAST_FM_API_KEY + `&format=json&period=7day&limit=1`

/**
 * @type {string}
 */
const SPOTIFY_AUTHORISATION_CODE = `BQDT24AieS04OIt3NbKGOXylE0x4LgpuzxtxvDtOtIc-7VcjyshgzUh4R4_zFhDAl_QSQtW6zvdhJrUDB9zcjz8j2VksL1wj1jFHe8ldfqDKY-vRsVqoBCsVRoPVVP85e4EnP8fxLCHW3qoPwxjN1p6VPfYdxCbuM0ZF0a105PXo6QFGnPzDvZZxa8-ovY6FASWyRiN2J7dZ64dmBjQW7W0vs1YpTQK-01Hl5b-1Hk0wgXoeP_zK9o5N668Og1mcdYiaJQPX2UWjW0tkHI28xAFGy4M`


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
    if (!this.feedContainer.item) {
      return
    }

    this.getLastfmTrack()

    this.feedContainer.on('update', (newItems, oldItems) => {
      this.getLastfmTrack()
    })
  }

  /**
   *
   */
  @bind
  async getLastfmTrack() {
    await fetch(LAST_FM_API_URL, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        const lastfmTrack = data.toptracks.track[0]
        const artist = lastfmTrack.artist.name
        const track = lastfmTrack.name

        this.getSpotifyTrack(artist, track)
      })
  }

  /**
   *
   */
  @bind
  async getSpotifyTrack(artist, track) {
    const spotifyApi = new SpotifyWebApi()
    spotifyApi.setAccessToken(SPOTIFY_AUTHORISATION_CODE)

    const query = 'artist: ' + artist + ' track: ' + track

    spotifyApi.searchTracks(query, { limit: 1 })
      .then(data => {
        this.injectElements(data)
      })
  }

  /**
   *
   */
  @bind
  injectElements(data) {
    this.feedContainer.pause()

    const resultsData = Object.keys(data.tracks.items).map(id => `
      My favourite song this week is 
      <a href="${ data.tracks.items[id].external_urls.spotify }" target="_blank" class="song-feed__link link">
        ${ data.tracks.items[id].name } by ${ data.tracks.items[id].artists[0].name }

        <img src="${ data.tracks.items[id].album.images[2].url }" 
              alt="Artwork for the song ${ data.tracks.items[id].name } by ${ data.tracks.items[id].artists[0].name }"
              class="song-feed__artwork">
      </a>
    `).join('')

    this.feedContainer.item.innerHTML = resultsData
    this.feedContainer.resume()
  }
}
