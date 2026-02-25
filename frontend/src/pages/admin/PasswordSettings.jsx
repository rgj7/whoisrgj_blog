import { useState } from 'react'
import client from '../../api/client'

export default function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }

    setSaving(true)
    try {
      await client.put('/admin/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password updated successfully.' })
    } catch (err) {
      const detail = err.response?.data?.detail
      setMessage({ type: 'error', text: detail || 'Failed to update password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-navy-100 mb-1">Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full bg-navy-950 border border-navy-600 text-navy-50 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-100 mb-1">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full bg-navy-950 border border-navy-600 text-navy-50 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-100 mb-1">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full bg-navy-950 border border-navy-600 text-navy-50 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="text-sm px-3 py-1.5 bg-navy-700 hover:bg-navy-600 border border-navy-600 rounded text-navy-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Change Password'}
        </button>
        {message && (
          <span
            className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  )
}
