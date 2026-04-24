import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/types'
import { getStrapiMediaUrl } from '@/lib/strapi'
import { formatDate } from '@/lib/utils'

interface Props {
  article: Article
}

export default function ArticleCard({ article }: Props) {
  const { title, slug, excerpt, coverImage, category, publishedAtCustom, publishedAt, readingTime } =
    article.attributes

  const imageUrl = coverImage?.data?.attributes?.url
    ? getStrapiMediaUrl(coverImage.data.attributes.url)
    : null
  const imageAlt = coverImage?.data?.attributes?.alternativeText || title
  const date = publishedAtCustom || publishedAt

  return (
    <article className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-sm transition-all flex flex-col">
      {/* Image */}
      <Link href={`/articles/${slug}`} className="block aspect-video relative bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-300 text-4xl">✦</span>
          </div>
        )}
      </Link>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        {/* Catégorie */}
        {category?.data && (
          <Link
            href={`/categories/${category.data.attributes.slug}`}
            className="text-xs font-semibold text-gray-400 uppercase tracking-widest hover:text-gray-700 transition-colors mb-2 block"
          >
            {category.data.attributes.name}
          </Link>
        )}

        {/* Titre */}
        <Link href={`/articles/${slug}`}>
          <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {title}
          </h2>
        </Link>

        {/* Extrait */}
        {excerpt && (
          <p className="text-sm text-gray-500 line-clamp-3 flex-1">{excerpt}</p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {date && (
            <time dateTime={date} className="text-xs text-gray-400">
              {formatDate(date)}
            </time>
          )}
          {readingTime && (
            <span className="text-xs text-gray-400">{readingTime} min</span>
          )}
        </div>
      </div>
    </article>
  )
}
