import Link from 'next/link'
import { getSiteSettings } from '@/lib/strapi'

export default async function Footer() {
  let siteName = 'Mon Site'
  let siteDescription = 'Votre référence éditoriale.'
  let contactEmail = ''

  try {
    const { data } = await getSiteSettings()
    siteName = data?.attributes?.siteName || siteName
    siteDescription = data?.attributes?.siteDescription || siteDescription
    contactEmail = data?.attributes?.contactEmail || ''
  } catch {
    // Utilise les valeurs par défaut
  }

  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Identité */}
          <div>
            <p className="text-white font-bold text-lg mb-2">{siteName}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{siteDescription}</p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/articles" className="hover:text-white transition-colors">Articles</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Catégories</Link></li>
              <li><Link href="/ecrire-pour-nous" className="hover:text-white transition-colors">Écrire pour nous</Link></li>
            </ul>
          </div>

          {/* Contact & Légal */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Informations</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-gray-500 text-center">
          © {year} {siteName}. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
