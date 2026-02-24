import { useState, useEffect } from 'react'
import client from '../../api/client'

const PLATFORMS = [
  'github',
  'twitter',
  'linkedin',
  'instagram',
  'youtube',
  'twitch',
  'steam',
  'letterboxd',
  'mastodon',
  'rss',
  'email',
  'bluesky',
]

export default function SocialSettings() {
  const [socialLinks, setSocialLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState({ platform: PLATFORMS[0], url: '' })

  useEffect(() => {
    client
      .get('/admin/social-links')
      .then((res) => setSocialLinks(res.data))
      .catch(() => setError('Failed to load social links.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleMove(index, direction) {
    const newLinks = [...socialLinks]
    const swapIndex = index + direction
    ;[newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]]
    setSaving(true)
    try {
      const res = await client.put('/admin/social-links/reorder', {
        ordered_ids: newLinks.map((sl) => sl.id),
      })
      setSocialLinks(res.data)
    } catch {
      alert('Failed to reorder.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id) {
    if (!confirm('Remove this social link?')) return
    try {
      await client.delete(`/admin/social-links/${id}`)
      setSocialLinks((prev) => prev.filter((sl) => sl.id !== id))
    } catch {
      alert('Failed to remove social link.')
    }
  }

  async function handleAdd() {
    if (!adding.url.trim()) {
      alert('Please enter a URL.')
      return
    }
    try {
      const res = await client.post('/admin/social-links', {
        platform: adding.platform,
        url: adding.url.trim(),
      })
      setSocialLinks((prev) => [...prev, res.data])
      setAdding({ platform: PLATFORMS[0], url: '' })
    } catch {
      alert('Failed to add social link.')
    }
  }

  if (loading) return <p className="text-navy-200">Loading...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-navy-200 uppercase tracking-wide mb-3">
          Current Social Links
        </h3>
        {socialLinks.length === 0 ? (
          <p className="text-navy-200 text-sm">No social links yet.</p>
        ) : (
          <ul className="space-y-2">
            {socialLinks.map((sl, index) => (
              <li
                key={sl.id}
                className="flex items-center gap-3 bg-navy-700 border border-navy-600 rounded px-3 py-2 text-sm"
              >
                <span className="capitalize font-medium w-24 shrink-0">{sl.platform}</span>
                <span className="flex-1 text-navy-200 truncate">{sl.url}</span>
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
                  disabled={index === socialLinks.length - 1 || saving}
                  className="text-navy-200 hover:text-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemove(sl.id)}
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
          Add a Social Link
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={adding.platform}
            onChange={(e) => setAdding((prev) => ({ ...prev, platform: e.target.value }))}
            className="bg-navy-950 border border-navy-600 text-navy-50 rounded px-2 py-1.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-navy-300"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="capitalize bg-navy-950">
                {p}
              </option>
            ))}
          </select>
          <input
            type="url"
            placeholder="https://..."
            value={adding.url}
            onChange={(e) => setAdding((prev) => ({ ...prev, url: e.target.value }))}
            className="form-input flex-1"
          />
          <button
            onClick={handleAdd}
            className="text-sm px-3 py-1.5 bg-navy-700 hover:bg-navy-600 border border-navy-600 rounded text-navy-100 font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
