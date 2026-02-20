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
    <article className="bg-white rounded-xl p-6 shadow-sm mb-4 last:mb-0">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm text-gray-400">{formatDate(post.created_at)}</span>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
      <Link to={`/posts/${post.slug}`} className="group">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {post.title}
        </h2>
      </Link>
      {post.excerpt && (
        <p className="text-gray-600 text-sm leading-relaxed">{post.excerpt}</p>
      )}
    </article>
  )
}
