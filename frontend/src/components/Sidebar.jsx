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

export default function Sidebar() {
  const [links, setLinks] = useState([])

  useEffect(() => {
    client
      .get('/social-links')
      .then((res) => setLinks(res.data))
      .catch(() => {})
  }, [])

  if (links.length === 0) return null

  return (
    <aside className="w-60 shrink-0 bg-navy-700 rounded-xl p-6 border border-navy-600 self-start">
      <h2 className="text-sm font-semibold text-navy-200 uppercase tracking-wide mb-3">
        Find me on
      </h2>
      <ul className="space-y-2">
        {links.map((link) => {
          const icon = ICON_MAP[link.platform] || faGlobe
          return (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-navy-50 hover:text-navy-400 transition-colors"
              >
                <FontAwesomeIcon icon={icon} style={{ width: 20, height: 20 }} />
                <span className="capitalize">{link.platform}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
