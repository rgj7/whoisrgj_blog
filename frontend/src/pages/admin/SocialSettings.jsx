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

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Current Social Links
        </h3>
        {socialLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No social links yet.</p>
        ) : (
          <ul className="space-y-2">
            {socialLinks.map((sl, index) => (
              <li
                key={sl.id}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <span className="capitalize font-medium w-24 shrink-0">{sl.platform}</span>
                <span className="flex-1 text-gray-500 truncate">{sl.url}</span>
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
                  disabled={index === socialLinks.length - 1 || saving}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemove(sl.id)}
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
          Add a Social Link
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={adding.platform}
            onChange={(e) => setAdding((prev) => ({ ...prev, platform: e.target.value }))}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm capitalize"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>
          <input
            type="url"
            placeholder="https://..."
            value={adding.url}
            onChange={(e) => setAdding((prev) => ({ ...prev, url: e.target.value }))}
            className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm"
          />
          <button
            onClick={handleAdd}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
