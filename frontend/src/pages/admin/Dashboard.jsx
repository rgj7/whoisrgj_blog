import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client'
import NavSettings from './NavSettings'
import SocialSettings from './SocialSettings'
import TravelSettings from './TravelSettings'
import BioSettings from './BioSettings'

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

  function fetchPosts() {
    setPostsLoading(true)
    client
      .get('/admin/posts')
      .then((res) => setPosts(res.data))
      .catch(() => setPostsError('Failed to load posts.'))
      .finally(() => setPostsLoading(false))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

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

  const TABS = ['posts', 'pages', 'travels', 'settings']

  return (
    <div className="content-card">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        {activeTab === 'posts' && (
          <Link to="/admin/posts/new" className="btn-primary">
            New Post
          </Link>
        )}
        {activeTab === 'pages' && (
          <Link to="/admin/pages/new" className="btn-primary">
            New Page
          </Link>
        )}
      </div>

      <div className="flex border-b border-navy-600 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabSwitch(tab)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-navy-300 text-navy-300'
                : 'border-transparent text-navy-200 hover:text-navy-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'posts' && (
        <>
          {postsLoading && <p className="text-navy-200">Loading...</p>}
          {postsError && <p className="text-red-400">{postsError}</p>}
          {!postsLoading &&
            !postsError &&
            (posts.length === 0 ? (
              <p className="text-navy-200">No posts yet. Create one!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-600 text-left text-navy-200 font-medium">
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-navy-700 last:border-0">
                        <td className="py-3 pr-4 font-medium">{post.title}</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleTogglePostPublish(post)}
                            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                              post.published
                                ? 'bg-green-900 text-green-400 hover:bg-green-800'
                                : 'bg-yellow-900 text-yellow-400 hover:bg-yellow-800'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-navy-200">{formatDate(post.created_at)}</td>
                        <td className="py-3 flex gap-3">
                          <Link
                            to={`/admin/posts/${post.id}/edit`}
                            className="text-navy-300 hover:text-navy-400 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-400 hover:text-red-300 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </>
      )}

      {activeTab === 'pages' && (
        <>
          {pagesLoading && <p className="text-navy-200">Loading...</p>}
          {pagesError && <p className="text-red-400">{pagesError}</p>}
          {!pagesLoading &&
            !pagesError &&
            (pages.length === 0 ? (
              <p className="text-navy-200">No pages yet. Create one!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-600 text-left text-navy-200 font-medium">
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id} className="border-b border-navy-700 last:border-0">
                        <td className="py-3 pr-4">
                          <span className="font-medium">{page.title}</span>
                          <span className="block text-xs text-navy-200">/pages/{page.slug}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleTogglePagePublish(page)}
                            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                              page.published
                                ? 'bg-green-900 text-green-400 hover:bg-green-800'
                                : 'bg-yellow-900 text-yellow-400 hover:bg-yellow-800'
                            }`}
                          >
                            {page.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-navy-200">{formatDate(page.created_at)}</td>
                        <td className="py-3 flex gap-3">
                          <Link
                            to={`/admin/pages/${page.id}/edit`}
                            className="text-navy-300 hover:text-navy-400 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-400 hover:text-red-300 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Bio</h2>
          <BioSettings />
          <hr className="my-8 border-navy-600" />
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          <NavSettings />
          <hr className="my-8 border-navy-600" />
          <h2 className="text-lg font-semibold mb-4">Social Links</h2>
          <SocialSettings />
        </div>
      )}

      {activeTab === 'travels' && (
        <div>
          <TravelSettings />
        </div>
      )}
    </div>
  )
}
