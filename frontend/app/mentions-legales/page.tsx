import type { Metadata } from 'next'
import { getStaticPageBySlug } from '@/lib/strapi'
import Breadcrumb from '@/components/Breadcrumb'

const FALLBACK_CONTENT = `
<h2>Éditeur du site</h2>
<p><strong>[Nom de la société]</strong><br>Siège social : [Adresse]<br>Contact : contact@votresite.fr</p>
<h2>Hébergement</h2>
<p>Ce site est hébergé par Vercel Inc., San Francisco, États-Unis.</p>
<h2>Propriété intellectuelle</h2>
<p>L'ensemble du contenu est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p>
`

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getStaticPageBySlug('mentions-legales')
    const page = data[0]
    return {
      title: page?.attributes?.seoTitle || 'Mentions légales',
      description: page?.attributes?.seoDescription || 'Mentions légales du site.',
    }
  } catch {
    return { title: 'Mentions légales' }
  }
}

export default async function MentionsLegalesPage() {
  let title = 'Mentions légales'
  let content = FALLBACK_CONTENT

  try {
    const { data } = await getStaticPageBySlug('mentions-legales')
    const page = data[0]
    if (page) {
      title = page.attributes.title
      content = page.attributes.content || FALLBACK_CONTENT
    }
  } catch {
    // Utilise le contenu par défaut
  }

  return (
    <main className="py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: title }]} />
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
          <div
            className="prose prose-gray prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </main>
  )
}
