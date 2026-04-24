import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/strapi'

export const metadata: Metadata = {
  title: 'Catégories',
  description: 'Explorez nos articles par thématique.',
}

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>>['data'] = []

  try {
    const { data } = await getCategories()
    categories = data
  } catch {
    // Strapi indisponible
  }

  return (
    <main className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catégories</h1>
          <p className="text-gray-500">Explorez nos contenus par thématique.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Aucune catégorie disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.attributes.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 mb-2">
                  {category.attributes.name}
                </h2>
                {category.attributes.description && (
                  <p className="text-gray-500 text-sm line-clamp-3">
                    {category.attributes.description}
                  </p>
                )}
                <span className="inline-block mt-4 text-sm font-medium text-gray-900 underline underline-offset-4">
                  Voir les articles →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
