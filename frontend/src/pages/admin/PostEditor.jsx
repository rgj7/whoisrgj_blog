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

  if (loading) return <p className="text-gray-400">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
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
            className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 border rounded"
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

      {error && (
        <p className="error-alert">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Excerpt <span className="text-gray-400">(optional)</span>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-2.5 py-0.5 rounded text-xs font-medium border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
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
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTag}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
          >
            Add Tag
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content (Markdown)</label>
        <div data-color-mode="light">
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
