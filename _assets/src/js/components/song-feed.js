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
const LAST_FM_API_URL = `https://ws.audioscrobbler.com/2.0/`

/**
 * @type {string}
 */
const SPOTIFY_API_URL = `https://accounts.spotify.com/api/token`

/**
 * @type {string}
 */
const SPOTIFY_CLIENT_ID = `e5de900fb4964a7e89560f6a230ddc4f`

/**
 * @type {string}
 */
const SPOTIFY_CLIENT_SECRET = `807e0767e59f4c35b90e85c2ac28945c`

export default class SongFeed {

  /**
   * @type {LiveElement}
   */
  feedContainer = new LiveElement('#song-feed')

  /**
   * @type {String}
   */
  spotifyAccessToken = ''

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

    this.authenticateSpotify()
    this.getTracks()

    this.feedContainer.on('update', (newItems, oldItems) => {
      this.getTracks()
    })
  }

  /**
   *
   */
  @bind
  authenticateSpotify() {
    let authorization = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')

    fetch(SPOTIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authorization}`
      },
      body: 'grant_type=client_credentials'
    })
      .then(response => response.json())
      .then(data => {
        this.spotifyAccessToken = data.access_token
      })
  }

  /**
   *
   */
  @bind
  getTracks() {
    const periods = ['7day', '1month', '12month']

    this.tracks = {}
    this.spotifyTracks = {}

    periods.forEach(period => {
      this.getLastfmTrack(period)
    })

    this.tracks.items = this.spotifyTracks
  }

  /**
   *
   */
  @bind
  async getLastfmTrack(period) {
    await fetch(LAST_FM_API_URL + '?method=user.gettoptracks&user=' + LAST_FM_USER + '&api_key=' + LAST_FM_API_KEY + '&format=json&period=' + period + '&limit=1', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.getSpotifyTrack(data.toptracks.track, period)
      })
  }

  /**
   *
   */
  @bind
  async getSpotifyTrack(lastfmTrack, period) {
    const spotifyApi = new SpotifyWebApi()
    spotifyApi.setAccessToken(this.spotifyAccessToken)

    if (period === '7day') {
      period = 'week'
    } else if (period === '1month') {
      period = 'month'
    } else if (period === '12month') {
      period = 'year'
    }

    Object.keys(lastfmTrack).map(id => {
      const artist = lastfmTrack[id].artist.name
      const track = lastfmTrack[id].name
      const query = 'artist: ' + artist + ' track: ' + track

      spotifyApi.searchTracks(query, { limit: 1 })
        .then(data => {
          this.spotifyTracks[period] = data

          this.injectElements(this.tracks)
        })
    })
  }

  /**
   *
   */
  @bind
  async injectElements(tracks) {
    this.feedContainer.pause()

    const week = tracks.items.week.tracks.items[0]
    const month = tracks.items.month.tracks.items[0]
    const year = tracks.items.year.tracks.items[0]

    const markup = `
      My most listened to song so far this week is 
      <a href="${ week.external_urls.spotify }" target="_blank" class="song-feed__link image-cursor link">
        ${ week.name } by ${ week.artists[0].name }

        <div class="image-cursor__image">
          <figure class="image">
            <picture class="image__image">
              <img
                src="${ week.album.images[2].url }"
                data-lazy-load-src="${ week.album.images[0].url }"
                alt="Artwork for the song ${ week.name } by ${ week.artists[0].name }"
              />
            </picture>
          </figure>
        </div>
      </a>, 
      this month is
      <a href="${ month.external_urls.spotify }" target="_blank" class="song-feed__link image-cursor link">
        ${ month.name } by ${ month.artists[0].name }

        <div class="image-cursor__image">
          <figure class="image">
            <picture class="image__image">
              <img
                src="${ month.album.images[2].url }"
                data-lazy-load-src="${ month.album.images[0].url }"
                alt="Artwork for the song ${ month.name } by ${ month.artists[0].name }"
              />
            </picture>
          </figure>
        </div>
      </a> 
      and this year is  
      <a href="${ year.external_urls.spotify }" target="_blank" class="song-feed__link image-cursor link">
        ${ year.name } by ${ year.artists[0].name }

        <div class="image-cursor__image">
          <figure class="image">
            <picture class="image__image">
              <img
                src="${ year.album.images[2].url }"
                data-lazy-load-src="${ year.album.images[0].url }"
                alt="Artwork for the song ${ year.name } by ${ year.artists[0].name }"
              />
            </picture>
          </figure>
        </div>
      </a>.
    `

    this.feedContainer.item.innerHTML = markup
    this.feedContainer.resume()
  }
}
