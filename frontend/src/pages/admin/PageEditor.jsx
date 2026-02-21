import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import client from '../../api/client'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [slugError, setSlugError] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    client
      .get(`/admin/pages/${id}`)
      .then((res) => {
        const p = res.data
        setTitle(p.title)
        setSlug(p.slug)
        setContent(p.content)
        setPublished(p.published)
      })
      .catch(() => setError('Failed to load page.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function handleSlugChange(e) {
    const val = e.target.value
    setSlug(val)
    if (val && !SLUG_RE.test(val)) {
      setSlugError('Slug must be lowercase letters, numbers, and hyphens only, with no leading or trailing hyphens.')
    } else {
      setSlugError(null)
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!slug.trim()) {
      setError('Slug is required.')
      return
    }
    if (slugError) {
      setError('Please fix the slug before saving.')
      return
    }
    setError(null)
    setSaving(true)
    const payload = { title, slug, content, published }
    try {
      if (isEdit) {
        await client.put(`/admin/pages/${id}`, payload)
      } else {
        await client.post('/admin/pages', payload)
      }
      navigate('/admin')
    } catch (err) {
      if (err.response?.status === 409) {
        setError('A page with this slug already exists.')
      } else if (err.response?.status === 422) {
        const detail = err.response.data?.detail
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join(' '))
        } else {
          setError(detail || 'Validation error.')
        }
      } else {
        setError('Failed to save page.')
      }
      setSaving(false)
    }
  }

  if (loading) return <p className="text-navy-200">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Page' : 'New Page'}</h1>
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
            className="text-sm text-navy-200 hover:text-navy-50 px-3 py-1.5 border border-navy-600 rounded transition-colors"
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
          placeholder="Page title"
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-100 mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={handleSlugChange}
          placeholder="e.g. about or resume"
          className={`w-full bg-navy-800 border rounded px-3 py-2 text-sm text-navy-50 focus:outline-none focus:ring-2 focus:ring-navy-300 ${
            slugError ? 'border-red-500' : 'border-navy-600'
          }`}
        />
        {slugError && (
          <p className="mt-1 text-xs text-red-400">{slugError}</p>
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
