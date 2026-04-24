import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getArticles, getCategories } from '@/lib/strapi'
import ArticleCard from '@/components/ArticleCard'
import Breadcrumb from '@/components/Breadcrumb'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const { data } = await getCategories()
    return data.map((cat) => ({ slug: cat.attributes.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { data } = await getCategoryBySlug(slug)
    const category = data[0]
    if (!category) return {}

    return {
      title: category.attributes.seoTitle || category.attributes.name,
      description: category.attributes.seoDescription || category.attributes.description || undefined,
    }
  } catch {
    return {}
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const [categoryResult, articlesResult] = await Promise.allSettled([
    getCategoryBySlug(slug),
    getArticles({ categorySlug: slug, pageSize: 50 }),
  ])

  if (categoryResult.status === 'rejected') notFound()

  const category = categoryResult.value.data[0]
  if (!category) notFound()

  const articles = articlesResult.status === 'fulfilled' ? articlesResult.value.data : []

  return (
    <main className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Catégories', href: '/categories' },
            { label: category.attributes.name },
          ]}
        />

        <header className="mt-6 mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category.attributes.name}
          </h1>
          {category.attributes.description && (
            <p className="text-gray-500 max-w-2xl">{category.attributes.description}</p>
          )}
          {articles.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {articles.length} article{articles.length > 1 ? 's' : ''}
            </p>
          )}
        </header>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Aucun article dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
