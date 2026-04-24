import type { Metadata } from 'next'
import { getStaticPageBySlug } from '@/lib/strapi'
import Breadcrumb from '@/components/Breadcrumb'

const FALLBACK_CONTENT = `
<p>Nous nous engageons à protéger vos données personnelles conformément au RGPD.</p>
<h2>Données collectées</h2>
<p>Nous collectons uniquement les données que vous nous transmettez volontairement (formulaire de contact).</p>
<h2>Vos droits</h2>
<p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contact : privacy@votresite.fr</p>
`

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getStaticPageBySlug('politique-confidentialite')
    const page = data[0]
    return {
      title: page?.attributes?.seoTitle || 'Politique de confidentialité',
      description:
        page?.attributes?.seoDescription || 'Notre politique de confidentialité et gestion des données.',
    }
  } catch {
    return { title: 'Politique de confidentialité' }
  }
}

export default async function PolitiqueConfidentialitePage() {
  let title = 'Politique de confidentialité'
  let content = FALLBACK_CONTENT

  try {
    const { data } = await getStaticPageBySlug('politique-confidentialite')
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
