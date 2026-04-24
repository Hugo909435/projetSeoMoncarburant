import type { Metadata } from 'next'
import { getStaticPageBySlug } from '@/lib/strapi'
import Breadcrumb from '@/components/Breadcrumb'

const FALLBACK_CONTENT = `
<p>Nous accueillons les contributions de professionnels et d'experts souhaitant partager leur analyse avec notre lectorat.</p>
<h2>Notre ligne éditoriale</h2>
<p>Nous publions des articles d'analyse et de décryptage. Nous privilégions les contenus approfondis, sourcés et accessibles.</p>
<h2>Ce que nous attendons</h2>
<ul>
<li>Articles originaux, non publiés ailleurs</li>
<li>Entre 800 et 2 000 mots</li>
<li>Sources vérifiables et citées</li>
<li>Ton professionnel et nuancé</li>
</ul>
<h2>Comment soumettre ?</h2>
<p>Envoyez votre proposition à <strong>redaction@votresite.fr</strong></p>
`

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getStaticPageBySlug('ecrire-pour-nous')
    const page = data[0]
    return {
      title: page?.attributes?.seoTitle || 'Écrire pour nous',
      description:
        page?.attributes?.seoDescription ||
        'Contribuez à notre site éditorial en proposant vos articles.',
    }
  } catch {
    return { title: 'Écrire pour nous' }
  }
}

export default async function EcrirePourNousPage() {
  let title = 'Écrire pour nous'
  let content = FALLBACK_CONTENT

  try {
    const { data } = await getStaticPageBySlug('ecrire-pour-nous')
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
