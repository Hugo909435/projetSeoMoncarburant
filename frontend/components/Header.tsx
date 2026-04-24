import Link from 'next/link'
import { getSiteSettings } from '@/lib/strapi'
import MobileMenu from './MobileMenu'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/articles', label: 'Articles' },
  { href: '/categories', label: 'Catégories' },
  { href: '/ecrire-pour-nous', label: 'Écrire pour nous' },
]

export default async function Header() {
  let siteName = 'Mon Site'

  try {
    const { data } = await getSiteSettings()
    siteName = data?.attributes?.siteName || 'Mon Site'
  } catch {
    // Utilise la valeur par défaut
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors shrink-0"
        >
          {siteName}
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Menu mobile */}
        <MobileMenu links={[...NAV_LINKS, { href: '/contact', label: 'Contact' }]} />
      </div>
    </header>
  )
}
