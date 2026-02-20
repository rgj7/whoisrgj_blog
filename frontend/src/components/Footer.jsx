import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGithub, faXTwitter, faLinkedin, faInstagram, faYoutube,
  faTwitch, faSteam, faLetterboxd, faMastodon, faBluesky,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe, faRss, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import client from '../api/client'

const ICON_MAP = {
  github:     faGithub,
  twitter:    faXTwitter,
  linkedin:   faLinkedin,
  instagram:  faInstagram,
  youtube:    faYoutube,
  twitch:     faTwitch,
  steam:      faSteam,
  letterboxd: faLetterboxd,
  mastodon:   faMastodon,
  bluesky:    faBluesky,
  rss:        faRss,
  email:      faEnvelope,
}

export default function Footer() {
  const [links, setLinks] = useState([])

  useEffect(() => {
    client.get('/social-links').then((res) => setLinks(res.data)).catch(() => {})
  }, [])

  return (
    <footer className="sticky bottom-0 bg-black border-t border-gray-800 text-gray-400 text-sm py-6">
      <div className="container mx-auto px-4 max-w-4xl grid grid-cols-3 items-center gap-4">
        <div className="flex items-center gap-3">
          {links.map((link) => {
            const icon = ICON_MAP[link.platform] || faGlobe
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platform}
                className="hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={icon} style={{ width: 16, height: 16 }} />
              </a>
            )
          })}
        </div>
        <p className="text-center">Built by RGJ.<br />Occasional writer, chronic puzzle seeker.</p>
        <div className="flex justify-end">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-white transition-colors"
          >
            &uarr; Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
