import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { faLetterboxd } from '@fortawesome/free-brands-svg-icons'
import client from '../api/client'

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      <FontAwesomeIcon icon={faStar} className="text-yellow-400" /> {rating}
    </span>
  )
}

export default function LetterboxdWidget() {
  const [films, setFilms] = useState([])

  useEffect(() => {
    client.get('/letterboxd').then((res) => setFilms(res.data)).catch(() => {})
  }, [])

  if (films.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FontAwesomeIcon icon={faLetterboxd} style={{ color: '#00e054' }} className="text-2xl" />
        <span className="text-base font-semibold text-navy-50">Recently Watched</span>
      </div>
      <div className="flex gap-3">
        {films.map((film, i) => (
          <a
            key={i}
            href={film.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-1 rounded-xl overflow-hidden h-44 bg-navy-700"
          >
            {film.poster_url && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${film.poster_url})` }}
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/70 to-black/10">
              <p className="text-xs font-bold text-white leading-tight line-clamp-2">{film.title}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-300">
                {film.year && <span>{film.year}</span>}
                {film.year && <span>/</span>}
                <StarRating rating={film.rating} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
