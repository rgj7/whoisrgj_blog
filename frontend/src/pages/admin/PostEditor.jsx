import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import client from '../../api/client'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [published, setPublished] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [activeMediaTab, setActiveMediaTab] = useState('games')

  useEffect(() => {
    client.get('/tags').then((res) => setAllTags(res.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    client
      .get(`/admin/posts/${id}`)
      .then((res) => {
        const p = res.data
        setTitle(p.title)
        setContent(p.content)
        setExcerpt(p.excerpt || '')
        setPublished(p.published)
        setSelectedTagIds(p.tags.map((t) => t.id))
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function toggleTag(tagId) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  async function handleAddTag() {
    const name = newTagName.trim()
    if (!name) return
    try {
      const res = await client.post('/admin/tags', { name })
      setAllTags((prev) => [...prev, res.data])
      setSelectedTagIds((prev) => [...prev, res.data.id])
      setNewTagName('')
    } catch (err) {
      if (err.response?.status === 409) {
        alert('Tag already exists.')
      } else {
        alert('Failed to create tag.')
      }
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setError(null)
    setSaving(true)
    const payload = {
      title,
      content,
      excerpt: excerpt || null,
      published,
      tag_ids: selectedTagIds,
    }
    try {
      if (isEdit) {
        await client.put(`/admin/posts/${id}`, payload)
      } else {
        await client.post('/admin/posts', payload)
      }
      navigate('/admin')
    } catch {
      setError('Failed to save post.')
      setSaving(false)
    }
  }

  if (loading) return <p className="text-navy-200">Loading...</p>

  return (
    <div className="content-card space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-navy-100 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded"
            />
            Published
          </label>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm bg-navy-700 hover:bg-navy-600 text-navy-100 hover:text-navy-50 px-3 py-1.5 border border-navy-600 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && <p className="error-alert">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-navy-100 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-100 mb-1">
          Excerpt <span className="text-navy-200">(optional)</span>
        </label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary shown in post list"
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-100 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-2.5 py-0.5 rounded text-xs font-medium border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-navy-300 text-white border-navy-300'
                  : 'bg-navy-700 text-navy-100 border-navy-600 hover:border-navy-400'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="New tag name"
            className="form-input"
          />
          <button
            onClick={handleAddTag}
            className="text-sm px-3 py-1.5 bg-navy-700 border border-navy-600 rounded hover:bg-navy-600 text-navy-100 transition-colors"
          >
            Add Tag
          </button>
        </div>
      </div>

      {/* Collapsible Media section */}
      <div className="border border-navy-600 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setMediaOpen((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-2.5 bg-navy-700 hover:bg-navy-600 text-sm font-medium text-navy-100 hover:text-navy-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-xs">{mediaOpen ? '▾' : '▸'}</span>
            Media
          </span>
        </button>

        {mediaOpen && (
          <div className="border-t border-navy-600">
            {/* Tab bar — mirrors Dashboard tab pattern */}
            <div className="flex border-b border-navy-600 bg-navy-900 px-2 pt-2">
              {['games', 'movies', 'tv'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveMediaTab(tab)}
                  className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                    activeMediaTab === tab
                      ? 'border-navy-300 text-navy-300'
                      : 'border-transparent text-navy-200 hover:text-navy-50'
                  }`}
                >
                  {tab === 'tv' ? 'TV Shows' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-4 bg-navy-800 text-navy-200 text-sm">
              {activeMediaTab === 'games' && <p className="italic">Games — coming soon.</p>}
              {activeMediaTab === 'movies' && <p className="italic">Movies — coming soon.</p>}
              {activeMediaTab === 'tv' && <p className="italic">TV Shows — coming soon.</p>}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-100 mb-2">Content (Markdown)</label>
        <div data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={500}
            preview="live"
            textareaProps={{ spellCheck: true }}
          />
        </div>
      </div>
    </div>
  )
}
