import { Link } from 'react-router-dom'

export default function TagBadge({ tag }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-navy-700 text-stone-800 dark:text-navy-100 hover:bg-stone-200 dark:hover:bg-navy-600 transition-colors"
    >
      {tag.name}
    </Link>
  )
}
