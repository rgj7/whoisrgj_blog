import { useState, useEffect } from 'react'
import client from '../api/client'

export default function BioWidget() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    client
      .get('/profile')
      .then((res) => setProfile(res.data))
      .catch(() => {})
  }, [])

  if (!profile || (!profile.photo_url && !profile.bio)) return null

  return (
    <aside className="bg-navy-950 rounded-xl p-4 w-60 shrink-0 self-start border border-navy-800">
      <h2 className="text-sm font-semibold text-navy-200 uppercase tracking-wide mb-3">About Me</h2>
      {profile.photo_url && (
        <img src={profile.photo_url} alt="Profile" className="rounded-xl w-full object-cover" />
      )}
      {profile.bio && <p className="text-sm text-navy-100 mt-3">{profile.bio}</p>}
    </aside>
  )
}
