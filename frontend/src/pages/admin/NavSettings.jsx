import { useState, useEffect } from 'react'
import client from '../../api/client'

export default function NavSettings() {
  const [navLinks, setNavLinks] = useState([])
  const [allPages, setAllPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      client.get('/admin/nav-links'),
      client.get('/admin/pages'),
    ])
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

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  const navPageIds = new Set(navLinks.map((nl) => nl.page_id))
  const availablePages = allPages.filter((p) => p.published && !navPageIds.has(p.id))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Current Navigation Links
        </h3>
        {navLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No navigation links yet.</p>
        ) : (
          <ul className="space-y-2">
            {navLinks.map((nl, index) => (
              <li
                key={nl.id}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <span className="flex-1 font-medium">
                  {nl.page.title}
                  {!nl.page.published && (
                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-normal">
                      Draft — hidden from nav
                    </span>
                  )}
                </span>
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || saving}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === navLinks.length - 1 || saving}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemove(nl.id)}
                  className="text-red-400 hover:text-red-600 ml-1"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Add a Published Page
        </h3>
        {availablePages.length === 0 ? (
          <p className="text-gray-500 text-sm">No published pages available to add.</p>
        ) : (
          <ul className="space-y-2">
            {availablePages.map((page) => (
              <li
                key={page.id}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <span className="flex-1">{page.title}</span>
                <button
                  onClick={() => handleAdd(page.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
