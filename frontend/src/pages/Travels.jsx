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
  const [count, setCount] = useState(0)
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    axios
      .get('/api/travels')
      .then((res) => {
        const topoId = (n) => String(n).padStart(3, '0')
        setVisitedCodes(new Set(res.data.map((c) => topoId(c.iso_numeric))))
        setVisitedNames(Object.fromEntries(res.data.map((c) => [topoId(c.iso_numeric), c.name])))
        setCount(res.data.length)

        const groups = {}
        for (const c of res.data) {
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
      })
      .finally(() => setLoading(false))
  }, [])

  function handleGeoMouseEnter(geo, evt) {
    if (!visitedCodes.has(geo.id)) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip({ name: visitedNames[geo.id], x: evt.clientX - rect.left, y: evt.clientY - rect.top })
  }

  function handleGeoMouseMove(geo, evt) {
    if (!visitedCodes.has(geo.id)) return
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
                    fill={visitedCodes.has(geo.id) ? '#3b82f6' : '#e5e7eb'}
                    stroke="#fff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: visitedCodes.has(geo.id) ? '#2563eb' : '#d1d5db' },
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
            {tooltip.name}
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
    </div>
  )
}
