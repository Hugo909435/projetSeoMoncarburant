import type { MetadataRoute } from 'next'
import { getArticles, getCategories } from '@/lib/strapi'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/ecrire-pour-nous`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/politique-confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  try {
    const [articlesRes, categoriesRes] = await Promise.all([
      getArticles({ pageSize: 500 }),
      getCategories(),
    ])

    const articleRoutes: MetadataRoute.Sitemap = articlesRes.data.map((article) => ({
      url: `${SITE_URL}/articles/${article.attributes.slug}`,
      lastModified: new Date(article.attributes.publishedAtCustom || article.attributes.publishedAt),
      changeFrequency: 'weekly',
      priority: article.attributes.isFeatured ? 0.8 : 0.7,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = categoriesRes.data.map((category) => ({
      url: `${SITE_URL}/categories/${category.attributes.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...articleRoutes, ...categoryRoutes]
  } catch {
    return staticRoutes
  }
}
