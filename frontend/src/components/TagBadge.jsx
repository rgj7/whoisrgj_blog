import { Link } from 'react-router-dom'

export default function TagBadge({ tag }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
    >
      {tag.name}
    </Link>
  )
}
