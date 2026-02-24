import { useState, useEffect, useRef } from 'react'
import client from '../../api/client'

export default function GameSearch({ selectedGame, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await client.get('/rawg/search', { params: { q: query } })
        setResults(res.data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(game) {
    onSelect(game)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  if (selectedGame) {
    return (
      <div className="flex items-center gap-3">
        {selectedGame.background_image && (
          <img
            src={selectedGame.background_image}
            alt={selectedGame.name}
            className="w-12 h-8 object-cover rounded border border-navy-600"
          />
        )}
        <span className="text-navy-50 text-sm font-medium">{selectedGame.name}</span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-navy-200 hover:text-red-400 text-xs transition-colors"
        >
          ✕ Remove
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search for a game…"
        className="w-full bg-navy-950 border border-navy-600 text-navy-50 rounded px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-navy-300 placeholder-navy-400"
      />
      {loading && <span className="absolute right-3 top-2 text-navy-400 text-xs">Searching…</span>}
      {open && results.length > 0 && (
        <ul
          className="absolute z-10 mt-1 w-full bg-navy-700 border border-navy-600 rounded
                     shadow-md max-h-72 overflow-y-auto text-sm"
        >
          {results.map((game) => (
            <li
              key={game.id}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer text-navy-50
                         hover:bg-navy-600 transition-colors"
              onMouseDown={() => handleSelect(game)}
            >
              {game.background_image && (
                <img
                  src={game.background_image}
                  alt=""
                  className="w-10 h-7 object-cover rounded border border-navy-600 shrink-0"
                />
              )}
              <span className="truncate">{game.name}</span>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && results.length === 0 && query.trim() && (
        <div
          className="absolute z-10 mt-1 w-full bg-navy-700 border border-navy-600 rounded
                     shadow-md px-3 py-2 text-sm text-navy-400"
        >
          No results found.
        </div>
      )}
    </div>
  )
}
