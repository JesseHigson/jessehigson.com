import { useIsMobile } from '@superrb/gatsby-addons/hooks'
import { Link } from 'gatsby'
import React, { useState, useEffect } from 'react'

export const NowPlaying = ({ userName, apiKey }) => {
  const isMobile = useIsMobile()
  const [lfmData, updateLfmData] = useState({})

  useEffect(() => {
    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${apiKey}&limit=1&nowplaying=true&format=json`,
    )
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('error')
      })
      .then(data => updateLfmData(data))
      .catch(() =>
        updateLfmData({ error: 'Whoops! Something went wrong with Last.fm' }),
      )
  }, [])

  const buildLastFmData = () => {
    const { error } = lfmData
    const track = lfmData?.recenttracks?.track

    if (error) {
      console.log(error)
    }

    if (!track) {
      return null
    }

    const image = track[0].image.find(i => {
      return i.size === 'extralarge'
    })

    const trackName = track[0].name
    const artistName = track[0].artist['#text']
    const url = track[0].url

    return (
      <div className="now-playing">
        <Link
          to={url}
          rel="nofollow noopener"
          target="_blank"
          className="now-playing__link"
        >
          <img
            src="/images/guitar-emoji.png"
            alt="Guitar emoji"
            className="now-playing__link-icon"
          />
          <span className="now-playing__link-label">Now Playing:&nbsp;</span>
          <span className="now-playing__link-content">
            {trackName} by {artistName}
          </span>
        </Link>
      </div>
    )
  }

  return buildLastFmData()
}
