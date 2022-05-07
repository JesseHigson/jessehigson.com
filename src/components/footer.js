import React from 'react'
import { NowPlaying } from './now-playing'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container container">
        <NowPlaying
          userName={process.env.GATSBY_LAST_FM_USERNAME}
          apiKey={process.env.GATSBY_LAST_FM_API_KEY}
        />
      </div>
    </footer>
  )
}

export default Footer
