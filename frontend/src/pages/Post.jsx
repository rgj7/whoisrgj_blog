import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import 'github-markdown-css/github-markdown-dark.css'
import client from '../api/client'
import TagBadge from '../components/TagBadge'
import GameInfoPanel from '../components/GameInfoPanel'
import { formatDate } from '../utils/date'

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

  if (loading) return <p className="text-navy-200">Loading...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const bgUrl = post.media?.find((m) => m.background_image_url)?.background_image_url
  const gameMedia = post.media?.find((m) => m.media_type === 'game')

  return (
    <article
      className="max-w-none content-card"
      style={bgUrl ? { paddingTop: 0, paddingLeft: 0, paddingRight: 0 } : {}}
    >
      {bgUrl ? (
        <>
          {/* Cinematic hero banner */}
          <header
            style={{
              position: 'relative',
              height: '280px',
              overflow: 'hidden',
              borderRadius: '0.75rem 0.75rem 0 0',
              marginBottom: gameMedia ? 0 : '2rem',
            }}
          >
            {/* Cover art */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundImage: `url('${bgUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.55) saturate(0.75)',
              }}
            />
            {/* Bottom gradient scrim — text sits here */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                background:
                  'linear-gradient(to bottom, rgba(13,27,42,0.1) 0%, rgba(13,27,42,0.7) 55%, rgba(13,27,42,0.97) 100%)',
              }}
            />
            {/* Back link — floats top-left over the banner */}
            <Link
              to="/"
              className="text-sm text-navy-100 hover:text-navy-50 hover:underline transition-colors"
              style={{
                position: 'absolute',
                top: '1.25rem',
                left: '1.5rem',
                zIndex: 10,
                background: 'rgba(13,27,42,0.55)',
                padding: '0.25rem 0.6rem',
                borderRadius: '0.375rem',
              }}
            >
              &larr; Back to posts
            </Link>
            {/* Title, date, tags — anchored to banner bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: '1.75rem',
                left: '1.5rem',
                right: '1.5rem',
                zIndex: 10,
              }}
            >
              <h1 className="text-4xl font-bold text-navy-50 mb-1.5">{post.title}</h1>
              <p className="text-sm text-navy-200 mb-2.5">{formatDate(post.created_at, 'long')}</p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </header>
          {/* Game info panel — full-width, flush under hero */}
          {gameMedia && <GameInfoPanel gameId={gameMedia.external_id} />}
          {/* Markdown content — restored horizontal padding */}
          <div className="px-8 pb-8">
            {gameMedia && (
              <p className="text-navy-500 text-center tracking-[0.4em] mt-6 mb-6 select-none">
                · · ·
              </p>
            )}
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </>
      ) : (
        <>
          <Link
            to="/"
            className="text-sm text-navy-300 hover:text-navy-400 hover:underline mb-6 inline-block transition-colors"
          >
            &larr; Back to posts
          </Link>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-sm text-navy-200 mb-3">{formatDate(post.created_at, 'long')}</p>
          {post.tags.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 ${gameMedia ? 'mb-3' : 'mb-8'}`}>
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}
          {gameMedia && <GameInfoPanel gameId={gameMedia.external_id} />}
          {gameMedia && (
            <p className="text-navy-500 text-center tracking-[0.4em] mb-6 select-none">· · ·</p>
          )}
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </>
      )}
    </article>
  )
}
