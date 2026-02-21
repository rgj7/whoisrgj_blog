import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-xs text-navy-200" style={{ letterSpacing: '0.08em' }}>
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
        <h2 className="text-xl font-bold text-navy-50 group-hover:text-navy-400 group-hover:translate-x-1 transition-all duration-200 mb-2">
          {post.title}
        </h2>
      </Link>
      {post.excerpt && <p className="text-navy-100 text-base leading-relaxed">{post.excerpt}</p>}
    </article>
  )
}
