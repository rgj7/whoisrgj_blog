import { useState, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import axios from 'axios'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const MIN_ZOOM = 1
const MAX_ZOOM = 8

export default function Travels() {
  const [visitedCodes, setVisitedCodes] = useState(new Set())
  const [visitedNames, setVisitedNames] = useState({})
  const [count, setCount] = useState(0)
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
    <div>
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
    </div>
  )
}
