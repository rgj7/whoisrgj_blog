import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGithub,
  faXTwitter,
  faLinkedin,
  faInstagram,
  faYoutube,
  faTwitch,
  faSteam,
  faLetterboxd,
  faMastodon,
  faBluesky,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe, faRss, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import client from '../api/client'

const ICON_MAP = {
  github: faGithub,
  twitter: faXTwitter,
  linkedin: faLinkedin,
  instagram: faInstagram,
  youtube: faYoutube,
  twitch: faTwitch,
  steam: faSteam,
  letterboxd: faLetterboxd,
  mastodon: faMastodon,
  bluesky: faBluesky,
  rss: faRss,
  email: faEnvelope,
}

export default function Footer() {
  const [links, setLinks] = useState([])

  useEffect(() => {
    client
      .get('/social-links')
      .then((res) => setLinks(res.data))
      .catch(() => {})
  }, [])

  return (
    <footer className="sticky bottom-0 bg-gradient-to-b from-gray-900 to-black relative text-gray-400 py-5">
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/60 to-transparent" />

      <div className="container mx-auto px-4 max-w-4xl grid grid-cols-3 items-center gap-4">
        <div className="flex items-center gap-4">
          {links.map((link) => {
            const icon = ICON_MAP[link.platform] || faGlobe
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platform}
                className="footer-icon"
              >
                <FontAwesomeIcon icon={icon} style={{ width: 16, height: 16 }} />
              </a>
            )
          })}
        </div>

        <div />

        <div className="flex justify-end">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border border-gray-700 text-gray-500 hover:border-gray-400 hover:text-white rounded px-3 py-1.5 transition-colors duration-200"
            style={{ fontSize: '0.68rem', letterSpacing: '0.13em', textTransform: 'uppercase' }}
          >
            ↑ Top
          </button>
        </div>
      </div>
    </footer>
  )
}
