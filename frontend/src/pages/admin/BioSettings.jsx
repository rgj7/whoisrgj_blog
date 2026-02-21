import { useState, useEffect } from 'react'
import client from '../../api/client'

export default function BioSettings() {
  const [photoUrl, setPhotoUrl] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [photoKey, setPhotoKey] = useState(0)

  useEffect(() => {
    client
      .get('/admin/profile')
      .then((res) => {
        setPhotoUrl(res.data.photo_url || '')
        setBio(res.data.bio || '')
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile.' }))
      .finally(() => setLoading(false))
  }, [])

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setMessage(null)
    try {
      const res = await client.post('/admin/profile/photo', formData)
      setPhotoUrl(res.data.photo_url || '')
      setPhotoKey(k => k + 1)
      setMessage({ type: 'success', text: 'Photo uploaded.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload photo.' })
    } finally {
      setUploading(false)
    }
  }

  async function handleRemovePhoto() {
    setMessage(null)
    try {
      await client.put('/admin/profile', { photo_url: null, bio: bio.trim() || null })
      setPhotoUrl('')
      setMessage({ type: 'success', text: 'Photo removed.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove photo.' })
    }
  }

  async function handleSave() {
    setMessage(null)
    try {
      await client.put('/admin/profile', {
        photo_url: photoUrl.trim() || null,
        bio: bio.trim() || null,
      })
      setMessage({ type: 'success', text: 'Profile saved.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save profile.' })
    }
  }

  const isUploaded = photoUrl.startsWith('/api/uploads/')

  if (loading) return <p className="text-gray-400">Loading...</p>

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            disabled={isUploaded}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          />
          <div className="flex items-center gap-2 mt-1">
            <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
              {uploading ? 'Uploading…' : 'Upload a photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
        </div>
        {photoUrl && (
          <div className="flex flex-col items-center gap-1 pt-5">
            <img
              src={photoKey ? `${photoUrl}?t=${photoKey}` : photoUrl}
              alt="Profile preview"
              className="w-20 h-20 rounded-full object-cover border border-gray-200"
            />
            <button
              onClick={handleRemovePhoto}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="A short bio..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-y"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Save
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
