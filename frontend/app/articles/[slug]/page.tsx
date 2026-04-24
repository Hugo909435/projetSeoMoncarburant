import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles, getStrapiMediaUrl } from '@/lib/strapi'
import Breadcrumb from '@/components/Breadcrumb'
import AuthorBlock from '@/components/AuthorBlock'
import RelatedArticles from '@/components/RelatedArticles'
import { formatDate } from '@/lib/utils'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const { data } = await getArticles({ pageSize: 200 })
    return data.map((article) => ({ slug: article.attributes.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { data } = await getArticleBySlug(slug)
    const article = data[0]
    if (!article) return {}

    const { title, seoTitle, seoDescription, excerpt, coverImage, canonicalUrl } =
      article.attributes
    const imageUrl = coverImage?.data?.attributes?.url
      ? getStrapiMediaUrl(coverImage.data.attributes.url)
      : undefined

    return {
      title: seoTitle || title,
      description: seoDescription || excerpt || undefined,
      ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
      openGraph: {
        title: seoTitle || title,
        description: seoDescription || excerpt || undefined,
        type: 'article',
        ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle || title,
        description: seoDescription || excerpt || undefined,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  const [articleResult, relatedResult] = await Promise.allSettled([
    getArticleBySlug(slug),
    getArticles({ pageSize: 4 }),
  ])

  if (articleResult.status === 'rejected') notFound()

  const article = articleResult.value.data[0]
  if (!article) notFound()

  const { title, content, coverImage, publishedAtCustom, publishedAt, category, author, readingTime } =
    article.attributes

  const imageUrl = coverImage?.data?.attributes?.url
    ? getStrapiMediaUrl(coverImage.data.attributes.url)
    : null
  const imageAlt = coverImage?.data?.attributes?.alternativeText || title
  const date = publishedAtCustom || publishedAt

  const relatedArticles =
    relatedResult.status === 'fulfilled'
      ? relatedResult.value.data.filter((a) => a.id !== article.id).slice(0, 3)
      : []

  return (
    <main>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Fil d'Ariane */}
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Articles', href: '/articles' },
            ...(category?.data
              ? [
                  {
                    label: category.data.attributes.name,
                    href: `/categories/${category.data.attributes.slug}`,
                  },
                ]
              : []),
            { label: title },
          ]}
        />

        {/* Header article */}
        <header className="mt-6 mb-8">
          {category?.data && (
            <Link
              href={`/categories/${category.data.attributes.slug}`}
              className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-800 mb-3"
            >
              {category.data.attributes.name}
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {author?.data && (
              <span>
                Par{' '}
                <span className="font-medium text-gray-700">{author.data.attributes.name}</span>
              </span>
            )}
            {date && (
              <time dateTime={date}>{formatDate(date)}</time>
            )}
            {readingTime && <span>{readingTime} min de lecture</span>}
          </div>
        </header>

        {/* Image principale */}
        {imageUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Contenu */}
        {content ? (
          <div
            className="prose prose-gray prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-gray-400 italic">Contenu non disponible.</p>
        )}

        {/* Auteur */}
        {author?.data && (
          <div className="mt-12 pt-10 border-t border-gray-200">
            <AuthorBlock author={author.data} />
          </div>
        )}
      </div>

      {/* Articles liés */}
      {relatedArticles.length > 0 && <RelatedArticles articles={relatedArticles} />}
    </main>
  )
}
