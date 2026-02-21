import { useState, useEffect } from 'react'
import client from '../../api/client'

export default function NavSettings() {
  const [navLinks, setNavLinks] = useState([])
  const [allPages, setAllPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  useEffect(() => {
    Promise.all([client.get('/admin/nav-links'), client.get('/admin/pages')])
      .then(([navRes, pagesRes]) => {
        setNavLinks(navRes.data)
        setAllPages(pagesRes.data)
      })
      .catch(() => setError('Failed to load navigation settings.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleMove(index, direction) {
    const newLinks = [...navLinks]
    const swapIndex = index + direction
    ;[newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]]
    setSaving(true)
    try {
      const res = await client.put('/admin/nav-links/reorder', {
        ordered_ids: newLinks.map((nl) => nl.id),
      })
      setNavLinks(res.data)
    } catch {
      alert('Failed to reorder.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    if (!confirm('Remove this page from the navigation?')) return
    try {
      await client.delete(`/admin/nav-links/${id}`)
      setNavLinks((prev) => prev.filter((nl) => nl.id !== id))
    } catch {
      alert('Failed to remove nav link.')
    }
  }

  async function handleAdd(pageId) {
    try {
      const res = await client.post('/admin/nav-links', { page_id: pageId })
      setNavLinks((prev) => [...prev, res.data])
    } catch {
      alert('Failed to add nav link.')
    }
  }

  async function handleAddCustom() {
    const label = customLabel.trim()
    const url = customUrl.trim()
    if (!label || !url) {
      alert('Both label and URL are required.')
      return
    }
    try {
      const res = await client.post('/admin/nav-links', { custom_label: label, custom_url: url })
      setNavLinks((prev) => [...prev, res.data])
      setCustomLabel('')
      setCustomUrl('')
    } catch {
      alert('Failed to add custom link.')
    }
  }

  if (loading) return <p className="text-navy-200">Loading...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const navPageIds = new Set(navLinks.map((nl) => nl.page_id))
  const availablePages = allPages.filter((p) => p.published && !navPageIds.has(p.id))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-navy-200 uppercase tracking-wide mb-3">
          Current Navigation Links
        </h3>
        {navLinks.length === 0 ? (
          <p className="text-navy-200 text-sm">No navigation links yet.</p>
        ) : (
          <ul className="space-y-2">
            {navLinks.map((nl, index) => (
              <li
                key={nl.id}
                className="flex items-center gap-3 bg-navy-700 border border-navy-600 rounded px-3 py-2 text-sm"
              >
                <span className="flex-1 font-medium">
                  {nl.page ? (
                    <>
                      {nl.page.title}
                      {!nl.page.published && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yellow-900 text-yellow-400 rounded text-xs font-normal">
                          Draft — hidden from nav
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {nl.custom_label}
                      <span className="ml-2 text-xs text-navy-200 font-normal">
                        {nl.custom_url}
                      </span>
                    </>
                  )}
                </span>
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || saving}
                  className="text-navy-200 hover:text-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === navLinks.length - 1 || saving}
                  className="text-navy-200 hover:text-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemove(nl.id)}
                  className="text-red-400 hover:text-red-300 ml-1 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-navy-200 uppercase tracking-wide mb-3">
          Add a Published Page
        </h3>
        {availablePages.length === 0 ? (
          <p className="text-navy-200 text-sm">No published pages available to add.</p>
        ) : (
          <ul className="space-y-2">
            {availablePages.map((page) => (
              <li
                key={page.id}
                className="flex items-center gap-3 bg-navy-800 border border-navy-600 rounded px-3 py-2 text-sm"
              >
                <span className="flex-1">{page.title}</span>
                <button
                  onClick={() => handleAdd(page.id)}
                  className="text-navy-300 hover:text-navy-400 font-medium transition-colors"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-navy-200 uppercase tracking-wide mb-3">
          Add a Custom Link
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Label"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="form-input w-36"
          />
          <input
            type="text"
            placeholder="URL (e.g. /travels)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="form-input flex-1"
          />
          <button
            onClick={handleAddCustom}
            className="text-navy-300 hover:text-navy-400 font-medium text-sm whitespace-nowrap transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
