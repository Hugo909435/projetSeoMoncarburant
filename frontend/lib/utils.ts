export function formatDate(dateString: string, locale = 'fr-FR'): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function buildPageTitle(title: string, siteName?: string | null): string {
  if (!siteName) return title
  return `${title} | ${siteName}`
}
