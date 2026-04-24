import type { Metadata } from 'next'
import { getStaticPageBySlug } from '@/lib/strapi'
import Breadcrumb from '@/components/Breadcrumb'

const FALLBACK_CONTENT = `
<p>Vous souhaitez nous contacter pour une question éditoriale, une proposition de partenariat ou toute autre demande ?</p>
<h2>Par e-mail</h2>
<p>Écrivez-nous à : <strong>contact@votresite.fr</strong></p>
<p>Nous répondons à toutes les demandes dans un délai de 48 heures ouvrées.</p>
<h2>Proposer un article</h2>
<p>Consultez notre page <a href="/ecrire-pour-nous">Écrire pour nous</a> pour connaître nos conditions de contribution.</p>
`

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getStaticPageBySlug('contact')
    const page = data[0]
    return {
      title: page?.attributes?.seoTitle || 'Contact',
      description: page?.attributes?.seoDescription || 'Contactez notre équipe éditoriale.',
    }
  } catch {
    return { title: 'Contact', description: 'Contactez notre équipe éditoriale.' }
  }
}

export default async function ContactPage() {
  let title = 'Nous contacter'
  let content = FALLBACK_CONTENT

  try {
    const { data } = await getStaticPageBySlug('contact')
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
