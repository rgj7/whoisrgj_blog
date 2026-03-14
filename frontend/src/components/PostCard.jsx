import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'
import { formatDate } from '../utils/date'
import { useTheme } from '../hooks/useTheme'

export default function PostCard({ post }) {
  const bgUrl = post.media?.find((m) => m.background_image_url)?.background_image_url
  const { isDark } = useTheme()

  const cardBg = isDark ? '#0d1b2a' : '#f5f5f4'

  return (
    <article className="post-card" style={bgUrl ? { overflow: 'hidden', minHeight: '7.5rem' } : {}}>
      {bgUrl && (
        <>
          {/* Cover art panel — right 46% of card, dimmed and desaturated */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '46%',
              backgroundImage: `url('${bgUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0.65) saturate(0.8)',
            }}
          />
          {/* Gradient scrim — slightly wider than image, blends bg into art */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '52%',
              background: `linear-gradient(to right, ${cardBg} 25%, ${isDark ? 'rgba(13,27,42,0.6)' : 'rgba(245,245,244,0.6)'} 65%, ${isDark ? 'rgba(13,27,42,0.1)' : 'rgba(245,245,244,0.1)'} 100%)`,
            }}
          />
        </>
      )}

      {/* Text content — constrained to the left zone when cover art is present */}
      <div className={bgUrl ? 'relative z-10' : undefined} style={bgUrl ? { maxWidth: '56%' } : {}}>
        <div className="flex items-center gap-3 mb-2.5">
          <span
            className="text-xs text-stone-600 dark:text-navy-200"
            style={{ letterSpacing: '0.08em' }}
          >
            {formatDate(post.created_at)}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </div>
        <Link to={`/posts/${post.slug}`} className="group block">
          <h2 className="text-xl font-bold text-stone-900 dark:text-navy-50 group-hover:text-stone-500 dark:group-hover:text-navy-400 group-hover:translate-x-1 transition-all duration-200 mb-2">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-stone-800 dark:text-navy-100 text-base leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>
    </article>
  )
}
