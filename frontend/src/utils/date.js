export function formatDate(dateStr, month = 'short') {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month,
    day: 'numeric',
  })
}
