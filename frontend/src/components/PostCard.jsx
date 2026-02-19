import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm mb-4 last:mb-0">
      <Link to={`/posts/${post.slug}`} className="group">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
          {post.title}
        </h2>
      </Link>
      <p className="text-sm text-gray-400 mb-2">{formatDate(post.created_at)}</p>
      {post.excerpt && (
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{post.excerpt}</p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </article>
  )
}
