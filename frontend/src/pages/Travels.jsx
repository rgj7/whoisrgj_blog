import { useState, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import axios from 'axios'
import { COUNTRY_META } from '../data/countryMeta'

const CONTINENT_ORDER = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']

const FlagImg = ({ alpha2, name }) => (
  <img
    src={`https://flagcdn.com/16x12/${alpha2.toLowerCase()}.png`}
    srcSet={`https://flagcdn.com/32x24/${alpha2.toLowerCase()}.png 2x`}
    width="16"
    height="12"
    alt={name}
    className="inline-block align-middle mr-1.5 rounded-sm"
  />
)

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const MIN_ZOOM = 1
const MAX_ZOOM = 8

export default function Travels() {
  const [visitedCodes, setVisitedCodes] = useState(new Set())
  const [visitedNames, setVisitedNames] = useState({})
  const [wishlistCodes, setWishlistCodes] = useState(new Set())
  const [wishlistNames, setWishlistNames] = useState({})
  const [count, setCount] = useState(0)
  const [grouped, setGrouped] = useState({})
  const [wishlistGrouped, setWishlistGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const topoId = (n) => String(n).padStart(3, '0')

    Promise.all([
      axios.get('/api/travels'),
      axios.get('/api/travels/wishlist'),
    ])
      .then(([visitedRes, wishlistRes]) => {
        // Visited
        setVisitedCodes(new Set(visitedRes.data.map((c) => topoId(c.iso_numeric))))
        setVisitedNames(Object.fromEntries(visitedRes.data.map((c) => [topoId(c.iso_numeric), c.name])))
        setCount(visitedRes.data.length)

        const groups = {}
        for (const c of visitedRes.data) {
          const meta = COUNTRY_META[c.iso_numeric]
          if (!meta) continue
          const { alpha2, continent } = meta
          if (!groups[continent]) groups[continent] = []
          groups[continent].push({ name: c.name, alpha2 })
        }
        for (const continent of Object.keys(groups)) {
          groups[continent].sort((a, b) => a.name.localeCompare(b.name))
        }
        setGrouped(groups)

        // Wishlist
        setWishlistCodes(new Set(wishlistRes.data.map((c) => topoId(c.iso_numeric))))
        setWishlistNames(Object.fromEntries(wishlistRes.data.map((c) => [topoId(c.iso_numeric), c.name])))

        const wGroups = {}
        for (const c of wishlistRes.data) {
          const meta = COUNTRY_META[c.iso_numeric]
          if (!meta) continue
          const { alpha2, continent } = meta
          if (!wGroups[continent]) wGroups[continent] = []
          wGroups[continent].push({ name: c.name, alpha2 })
        }
        for (const continent of Object.keys(wGroups)) {
          wGroups[continent].sort((a, b) => a.name.localeCompare(b.name))
        }
        setWishlistGrouped(wGroups)
      })
      .finally(() => setLoading(false))
  }, [])

  function getGeoFill(geoId) {
    if (visitedCodes.has(geoId)) return '#3b82f6'
    if (wishlistCodes.has(geoId)) return '#22c55e'
    return '#e5e7eb'
  }

  function getGeoHoverFill(geoId) {
    if (visitedCodes.has(geoId)) return '#2563eb'
    if (wishlistCodes.has(geoId)) return '#16a34a'
    return '#d1d5db'
  }

  function handleGeoMouseEnter(geo, evt) {
    const isVisited = visitedCodes.has(geo.id)
    const isWishlist = wishlistCodes.has(geo.id)
    if (!isVisited && !isWishlist) return
    const rect = containerRef.current.getBoundingClientRect()
    const name = isVisited ? visitedNames[geo.id] : wishlistNames[geo.id]
    const label = isVisited ? '(visited)' : '(wishlist)'
    setTooltip({ name, label, x: evt.clientX - rect.left, y: evt.clientY - rect.top })
  }

  function handleGeoMouseMove(geo, evt) {
    const isVisited = visitedCodes.has(geo.id)
    const isWishlist = wishlistCodes.has(geo.id)
    if (!isVisited && !isWishlist) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip((prev) => prev ? { ...prev, x: evt.clientX - rect.left, y: evt.clientY - rect.top } : prev)
  }

  function handleGeoMouseLeave() {
    setTooltip(null)
  }

  function handleZoomIn() {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 2, MAX_ZOOM) }))
  }

  function handleZoomOut() {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 2, MIN_ZOOM) }))
  }

  function handleReset() {
    setPosition({ coordinates: [0, 0], zoom: 1 })
  }

  const wishlistCount = wishlistCodes.size

  return (
    <div className="content-card">
      <h1 className="text-2xl font-bold mb-1">Travels</h1>
      <p className="text-gray-500 text-sm mb-6">
        {loading ? 'Loading...' : `${count} ${count === 1 ? 'country' : 'countries'} visited`}
      </p>
      <div ref={containerRef} className="bg-white rounded-lg overflow-hidden relative">
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            disabled={position.zoom >= MAX_ZOOM}
            className="w-7 h-7 bg-white border border-gray-300 rounded shadow text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
            aria-label="Zoom in"
          >+</button>
          <button
            onClick={handleZoomOut}
            disabled={position.zoom <= MIN_ZOOM}
            className="w-7 h-7 bg-white border border-gray-300 rounded shadow text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
            aria-label="Zoom out"
          >−</button>
          <button
            onClick={handleReset}
            disabled={position.zoom === 1 && position.coordinates[0] === 0 && position.coordinates[1] === 0}
            className="w-7 h-7 bg-white border border-gray-300 rounded shadow text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs leading-none"
            aria-label="Reset view"
          >⊙</button>
        </div>
        <ComposableMap
          projectionConfig={{ scale: 140 }}
          height={400}
          style={{ width: '100%', height: 'auto', cursor: position.zoom > 1 ? 'grab' : 'default' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={setPosition}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getGeoFill(geo.id)}
                    stroke="#fff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: getGeoHoverFill(geo.id) },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(evt) => handleGeoMouseEnter(geo, evt)}
                    onMouseMove={(evt) => handleGeoMouseMove(geo, evt)}
                    onMouseLeave={handleGeoMouseLeave}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
          >
            {tooltip.name}{' '}
            <span className="opacity-70">{tooltip.label}</span>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Visited Countries</h2>
          <div className="space-y-5">
            {CONTINENT_ORDER.filter((c) => grouped[c]).map((continent) => (
              <div key={continent}>
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">
                  {continent}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {grouped[continent].map(({ name, alpha2 }) => (
                    <span
                      key={name}
                      className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm"
                    >
                      <FlagImg alpha2={alpha2} name={name} />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {wishlistCount > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Wishlist</h2>
          <div className="space-y-5">
            {CONTINENT_ORDER.filter((c) => wishlistGrouped[c]).map((continent) => (
              <div key={continent}>
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">
                  {continent}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {wishlistGrouped[continent].map(({ name, alpha2 }) => (
                    <span
                      key={name}
                      className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm"
                    >
                      <FlagImg alpha2={alpha2} name={name} />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
