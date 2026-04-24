import type { Article } from '@/types'
import ArticleCard from './ArticleCard'

interface Props {
  articles: Article[]
}

export default function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section className="bg-gray-50 border-t border-gray-200 mt-16 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">À lire aussi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
