import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import client from '../api/client'

export default function Page() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client
      .get(`/pages/${slug}`)
      .then((res) => setPage(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Page not found.')
        } else {
          setError('Failed to load page.')
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="text-navy-200">Loading...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <article className="max-w-none content-card">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
      </div>
    </article>
  )
}
