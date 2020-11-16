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

        // this.getSpotifyTrack(artist, track)
        this.injectLastfmElements(data)
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
        this.injectSpotifyElements(data)
      })
  }

  /**
   *
   */
  @bind
  injectLastfmElements(data) {
    this.feedContainer.pause()

    console.log(data.toptracks.track)

    const resultsData = Object.keys(data.toptracks.track).map(id => `
      My favourite song this week is 
      <a href="${ data.toptracks.track[id].url }" target="_blank" class="song-feed__link link">
        ${ data.toptracks.track[id].name } by ${ data.toptracks.track[id].artist.name }

        <img src="${ data.toptracks.track[id].image[0]['#text'] }" 
          alt="Artwork for the song ${ data.toptracks.track[id].name } by ${ data.toptracks.track[id].artist.name }"
          class="song-feed__artwork">
      </a>
    `).join('')

    this.feedContainer.item.innerHTML = resultsData
    this.feedContainer.resume()
  }

  /**
   *
   */
  @bind
  injectSpotifyElements(data) {
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
