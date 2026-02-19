import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  function fetchPosts() {
    setLoading(true)
    client
      .get('/admin/posts')
      .then((res) => setPosts(res.data))
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return
    try {
      await client.delete(`/admin/posts/${id}`)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete post.')
    }
  }

  async function handleTogglePublish(post) {
    try {
      const res = await client.put(`/admin/posts/${post.id}`, {
        published: !post.published,
      })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? res.data : p)))
    } catch {
      alert('Failed to update post.')
    }
  }

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Posts</h1>
        <Link
          to="/admin/posts/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Create one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{post.title}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      } transition-colors`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(post.created_at)}</td>
                  <td className="py-3 flex gap-3">
                    <Link
                      to={`/admin/posts/${post.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
