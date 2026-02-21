import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import client from '../api/client'
import PostCard from '../components/PostCard'

export default function TagFeed() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    client
      .get('/posts', { params: { tag: slug, size: 50 } })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="text-navy-200">Loading...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-navy-300 hover:text-navy-400 hover:underline mb-6 inline-block transition-colors"
      >
        &larr; All posts
      </Link>
      <h1 className="text-2xl font-bold mb-8">
        Posts tagged <span className="text-navy-300">#{slug}</span>
      </h1>
      {data.items.length === 0 ? (
        <p className="text-navy-200">No posts with this tag.</p>
      ) : (
        data.items.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  )
}
