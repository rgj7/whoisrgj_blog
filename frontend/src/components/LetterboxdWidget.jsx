import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons'
import { faLetterboxd } from '@fortawesome/free-brands-svg-icons'
import client from '../api/client'

function StarRating({ rating }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />)
    } else if (rating >= i - 0.5) {
      stars.push(<FontAwesomeIcon key={i} icon={faStarHalfStroke} className="text-yellow-400" />)
    }
  }
  return <span className="flex gap-0.5 text-xs">{stars}</span>
}

export default function LetterboxdWidget() {
  const [films, setFilms] = useState([])

  useEffect(() => {
    client.get('/letterboxd').then((res) => setFilms(res.data)).catch(() => {})
  }, [])

  if (films.length === 0) return null

  return (
    <aside className="w-60 shrink-0 bg-gray-800 rounded-xl p-6 shadow-sm self-start">
      <div className="flex items-center gap-2 mb-2">
        <FontAwesomeIcon icon={faLetterboxd} style={{ color: '#00e054' }} className="text-3xl" />
        <span className="text-lg font-semibold text-gray-100">Letterboxd</span>
      </div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recently Watched</h2>
      <ul className="divide-y divide-gray-700">
        {films.map((film, i) => (
          <li key={i} className="py-2 first:pt-0 last:pb-0">
            <a
              href={film.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-100 hover:text-blue-400 transition-colors font-medium"
            >
              {film.title}
            </a>
            <div className="flex items-center gap-2 mt-0.5">
              {film.year && <span className="text-xs text-gray-400">{film.year}</span>}
              <StarRating rating={film.rating} />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
