import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import client from '../api/client'
import TagBadge from '../components/TagBadge'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Post() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Post not found.')
        } else {
          setError('Failed to load post.')
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <article className="max-w-none">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to posts
      </Link>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-400 mb-3">{formatDate(post.created_at)}</p>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  )
}
