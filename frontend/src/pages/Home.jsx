import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import client from '../api/client'
import PostCard from '../components/PostCard'
import Sidebar from '../components/Sidebar'
import LetterboxdWidget from '../components/LetterboxdWidget'
import BioWidget from '../components/BioWidget'

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)

  useEffect(() => {
    setLoading(true)
    client
      .get('/posts', { params: { page, size: 10 } })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
{data.items.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          data.items.map((post) => <PostCard key={post.id} post={post} />)
        )}
        {data.pages > 1 && (
          <div className="flex justify-between mt-8 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setSearchParams({ page: page - 1 })}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-gray-500">
              Page {data.page} of {data.pages}
            </span>
            <button
              disabled={page >= data.pages}
              onClick={() => setSearchParams({ page: page + 1 })}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6 shrink-0 self-start">
        <BioWidget />
        <Sidebar />
        <LetterboxdWidget />
      </div>
    </div>
  )
}
