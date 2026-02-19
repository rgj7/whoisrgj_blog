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
  const [activeTab, setActiveTab] = useState('posts')

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState(null)

  const [pages, setPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [pagesError, setPagesError] = useState(null)
  const [pagesFetched, setPagesFetched] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  function fetchPosts() {
    setPostsLoading(true)
    client
      .get('/admin/posts')
      .then((res) => setPosts(res.data))
      .catch(() => setPostsError('Failed to load posts.'))
      .finally(() => setPostsLoading(false))
  }

  function fetchPages() {
    setPagesLoading(true)
    client
      .get('/admin/pages')
      .then((res) => {
        setPages(res.data)
        setPagesFetched(true)
      })
      .catch(() => setPagesError('Failed to load pages.'))
      .finally(() => setPagesLoading(false))
  }

  function handleTabSwitch(tab) {
    setActiveTab(tab)
    if (tab === 'pages' && !pagesFetched) {
      fetchPages()
    }
  }

  async function handleDeletePost(id) {
    if (!confirm('Delete this post?')) return
    try {
      await client.delete(`/admin/posts/${id}`)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete post.')
    }
  }

  async function handleTogglePostPublish(post) {
    try {
      const res = await client.put(`/admin/posts/${post.id}`, {
        published: !post.published,
      })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? res.data : p)))
    } catch {
      alert('Failed to update post.')
    }
  }

  async function handleDeletePage(id) {
    if (!confirm('Delete this page?')) return
    try {
      await client.delete(`/admin/pages/${id}`)
      setPages((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete page.')
    }
  }

  async function handleTogglePagePublish(page) {
    try {
      const res = await client.put(`/admin/pages/${page.id}`, {
        published: !page.published,
      })
      setPages((prev) => prev.map((p) => (p.id === page.id ? res.data : p)))
    } catch {
      alert('Failed to update page.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        {activeTab === 'posts' ? (
          <Link
            to="/admin/posts/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            New Post
          </Link>
        ) : (
          <Link
            to="/admin/pages/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            New Page
          </Link>
        )}
      </div>

      <div className="flex border-b mb-6">
        <button
          onClick={() => handleTabSwitch('posts')}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabSwitch('pages')}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            activeTab === 'pages'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pages
        </button>
      </div>

      {activeTab === 'posts' && (
        <>
          {postsLoading && <p className="text-gray-400">Loading...</p>}
          {postsError && <p className="text-red-500">{postsError}</p>}
          {!postsLoading && !postsError && (
            posts.length === 0 ? (
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
                            onClick={() => handleTogglePostPublish(post)}
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
                            onClick={() => handleDeletePost(post.id)}
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
            )
          )}
        </>
      )}

      {activeTab === 'pages' && (
        <>
          {pagesLoading && <p className="text-gray-400">Loading...</p>}
          {pagesError && <p className="text-red-500">{pagesError}</p>}
          {!pagesLoading && !pagesError && (
            pages.length === 0 ? (
              <p className="text-gray-500">No pages yet. Create one!</p>
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
                    {pages.map((page) => (
                      <tr key={page.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <span className="font-medium">{page.title}</span>
                          <span className="block text-xs text-gray-400">/pages/{page.slug}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleTogglePagePublish(page)}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              page.published
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            } transition-colors`}
                          >
                            {page.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{formatDate(page.created_at)}</td>
                        <td className="py-3 flex gap-3">
                          <Link
                            to={`/admin/pages/${page.id}/edit`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeletePage(page.id)}
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
            )
          )}
        </>
      )}
    </div>
  )
}
