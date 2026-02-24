import { useState, useEffect } from 'react'
import client from '../api/client'

function MetaField({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-navy-400 uppercase tracking-widest mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-navy-100">{children}</dd>
    </div>
  )
}

function MetacriticScore({ score, url }) {
  const colour = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const inner = <span className={`text-2xl font-bold tabular-nums ${colour}`}>{score}</span>
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
        {inner}
      </a>
    )
  }
  return inner
}

export default function GameInfoPanel({ gameId }) {
  const [game, setGame] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!gameId) return
    client
      .get(`/rawg/games/${gameId}`)
      .then((res) => setGame(res.data))
      .catch(() => {})
  }, [gameId])

  if (!game) return null

  const hasDescription = game.description_raw && game.description_raw.length > 0

  return (
    <div className="border-y border-navy-700/50 bg-navy-950 overflow-hidden">
      <div className="flex flex-col md:flex-row py-7 px-8">
        {/* Left — description */}
        {hasDescription && (
          <div className="flex-1 pb-4 md:pb-0 md:pr-5 border-b border-navy-700/50 md:border-b-0 md:border-r">
            <h2 className="text-xs font-semibold text-navy-400 uppercase tracking-widest mb-2">
              About the Game
            </h2>
            <p
              className={`text-sm text-navy-100 leading-relaxed whitespace-pre-line ${!expanded ? 'line-clamp-4' : ''}`}
            >
              {game.description_raw}
            </p>
            {game.description_raw.length > 280 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 text-xs text-navy-400 hover:text-navy-200 transition-colors"
              >
                {expanded ? 'Show less ▲' : 'Show more ▼'}
              </button>
            )}
          </div>
        )}

        {/* Right — compact stats sidebar */}
        <div className="shrink-0 md:w-40 pt-4 md:pt-0 md:pl-5 flex flex-col gap-2.5">
          {game.released && <MetaField label="Released">{game.released}</MetaField>}

          {game.metacritic != null && (
            <MetaField label="Metacritic">
              <MetacriticScore score={game.metacritic} url={game.metacritic_url} />
            </MetaField>
          )}

          {game.esrb_rating && (
            <MetaField label="ESRB">
              <span className="font-mono text-xs bg-navy-800 border border-navy-600 text-navy-100 px-2 py-0.5 rounded">
                {game.esrb_rating}
              </span>
            </MetaField>
          )}
        </div>
      </div>

      {/* Bottom strip — genre, developer, publisher, platforms */}
      <div className="border-t border-navy-700/50 px-8 py-4 flex flex-wrap items-start gap-x-8 gap-y-3">
        {game.genres?.length > 0 && <MetaField label="Genre">{game.genres.join(', ')}</MetaField>}
        {game.developers?.length > 0 && (
          <MetaField label="Developer">{game.developers.join(', ')}</MetaField>
        )}
        {game.publishers?.length > 0 && (
          <MetaField label="Publisher">{game.publishers.join(', ')}</MetaField>
        )}
        {game.platforms?.length > 0 && (
          <MetaField label="Platforms">{game.platforms.join(', ')}</MetaField>
        )}

        {/* RAWG attribution — required by API terms */}
        <div className="ml-auto self-end">
          <a
            href={`https://rawg.io/games/${game.rawg_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-navy-400 hover:text-navy-200 transition-colors"
          >
            Data via RAWG ↗
          </a>
        </div>
      </div>
    </div>
  )
}
