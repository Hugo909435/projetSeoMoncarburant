import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticles, getCategories } from '@/lib/strapi'
import ArticleCard from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Tous nos articles : analyses, décryptages et expertises.',
}

const PAGE_SIZE = 12

interface Props {
  searchParams: Promise<{ page?: string; categorie?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const categorySlug = params.categorie

  const [articlesResult, categoriesResult] = await Promise.allSettled([
    getArticles({ page, pageSize: PAGE_SIZE, categorySlug }),
    getCategories(),
  ])

  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value.data : []
  const pagination =
    articlesResult.status === 'fulfilled' ? articlesResult.value.meta.pagination : undefined
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : []

  return (
    <main className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
          <p className="text-gray-500">
            {pagination?.total
              ? `${pagination.total} article${pagination.total > 1 ? 's' : ''} publié${pagination.total > 1 ? 's' : ''}`
              : 'Toutes nos analyses et décryptages'}
          </p>
        </div>

        {/* Filtres catégories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/articles"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !categorySlug
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-600 hover:border-gray-600'
              }`}
            >
              Tous
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/articles?categorie=${cat.attributes.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  categorySlug === cat.attributes.slug
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:border-gray-600'
                }`}
              >
                {cat.attributes.name}
              </Link>
            ))}
          </div>
        )}

        {/* Grille articles */}
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Aucun article trouvé.</p>
            {categorySlug && (
              <Link href="/articles" className="text-sm mt-3 block text-gray-600 underline">
                Voir tous les articles
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pageCount > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            {page > 1 && (
              <Link
                href={`/articles?page=${page - 1}${categorySlug ? `&categorie=${categorySlug}` : ''}`}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </Link>
            )}
            <span className="text-sm text-gray-500">
              Page {page} sur {pagination.pageCount}
            </span>
            {page < pagination.pageCount && (
              <Link
                href={`/articles?page=${page + 1}${categorySlug ? `&categorie=${categorySlug}` : ''}`}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Suivant →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
