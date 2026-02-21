import { Link } from 'react-router-dom'

export default function TagBadge({ tag }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-navy-700 text-navy-100 hover:bg-navy-600 transition-colors"
    >
      {tag.name}
    </Link>
  )
}
