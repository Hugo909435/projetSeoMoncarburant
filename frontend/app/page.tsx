import Link from 'next/link'
import { getArticles, getCategories, getSiteSettings } from '@/lib/strapi'
import ArticleCard from '@/components/ArticleCard'

export default async function HomePage() {
  const [articlesResult, categoriesResult, settingsResult] = await Promise.allSettled([
    getArticles({ pageSize: 6 }),
    getCategories(),
    getSiteSettings(),
  ])

  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value.data : []
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : []
  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value.data : null

  const siteName = settings?.attributes?.siteName || 'Mon Site Éditorial'
  const siteDescription =
    settings?.attributes?.siteDescription ||
    'Le média de référence sur notre thématique. Analyses, décryptages et expertise à votre service.'

  return (
    <main>
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            {siteName}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {siteDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/articles"
              className="bg-gray-900 text-white px-7 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Lire les articles
            </Link>
            <Link
              href="/ecrire-pour-nous"
              className="border border-gray-300 text-gray-700 px-7 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Écrire pour nous
            </Link>
          </div>
        </div>
      </section>

      {/* Derniers articles */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Derniers articles</h2>
            <Link
              href="/articles"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4"
            >
              Voir tout →
            </Link>
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Aucun article publié pour le moment.</p>
              <p className="text-sm mt-2">Revenez bientôt !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-200 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Nos thématiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.attributes.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-gray-900">{category.attributes.name}</h3>
                  {category.attributes.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {category.attributes.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bloc crédibilité */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Un contenu de qualité, écrit par des experts
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nos rédacteurs sont des professionnels de leur domaine. Chaque article est sourcé,
            relu et mis à jour pour garantir une information fiable et utile.
          </p>
          <div className="grid grid-cols-3 gap-8 mt-12 mb-10">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
              <p className="text-sm text-gray-500">Articles publiés</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">10+</div>
              <p className="text-sm text-gray-500">Experts contributeurs</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">5 ans</div>
              <p className="text-sm text-gray-500">D'expertise éditoriale</p>
            </div>
          </div>
          <Link
            href="/ecrire-pour-nous"
            className="inline-block bg-gray-900 text-white px-7 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Contribuer au site
          </Link>
        </div>
      </section>
    </main>
  )
}
