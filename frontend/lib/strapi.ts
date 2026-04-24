import type {
  Article,
  Category,
  Author,
  StaticPage,
  SiteSetting,
  StrapiResponse,
  StrapiSingleResponse,
} from '@/types'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || ''

async function fetchStrapi<T>(
  path: string,
  options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<T> {
  const { next, ...fetchOptions } = options
  const url = `${STRAPI_URL}/api${path}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
    },
    next: next ?? { revalidate: 60 },
    ...fetchOptions,
  })

  if (!res.ok) {
    throw new Error(`Strapi error ${res.status} on ${path}`)
  }

  return res.json() as Promise<T>
}

export async function getArticles(params: {
  page?: number
  pageSize?: number
  categorySlug?: string
} = {}): Promise<StrapiResponse<Article[]>> {
  const qs = new URLSearchParams()
  qs.set('populate', 'coverImage,category,author')
  qs.set('sort', 'publishedAtCustom:desc')
  qs.set('pagination[page]', String(params.page ?? 1))
  qs.set('pagination[pageSize]', String(params.pageSize ?? 12))
  if (params.categorySlug) {
    qs.set('filters[category][slug][$eq]', params.categorySlug)
  }

  return fetchStrapi<StrapiResponse<Article[]>>(`/articles?${qs}`)
}

export async function getArticleBySlug(slug: string): Promise<StrapiResponse<Article[]>> {
  const qs = new URLSearchParams()
  qs.set('filters[slug][$eq]', slug)
  qs.set('populate', 'coverImage,category,author.avatar')

  return fetchStrapi<StrapiResponse<Article[]>>(`/articles?${qs}`, {
    next: { revalidate: 3600 },
  })
}

export async function getCategories(): Promise<StrapiResponse<Category[]>> {
  return fetchStrapi<StrapiResponse<Category[]>>('/categories?sort=name:asc')
}

export async function getCategoryBySlug(slug: string): Promise<StrapiResponse<Category[]>> {
  const qs = new URLSearchParams()
  qs.set('filters[slug][$eq]', slug)

  return fetchStrapi<StrapiResponse<Category[]>>(`/categories?${qs}`)
}

export async function getSiteSettings(): Promise<StrapiSingleResponse<SiteSetting>> {
  return fetchStrapi<StrapiSingleResponse<SiteSetting>>('/site-setting?populate=logo,favicon,socialImage', {
    next: { revalidate: 300 },
  })
}

export async function getStaticPageBySlug(slug: string): Promise<StrapiResponse<StaticPage[]>> {
  const qs = new URLSearchParams()
  qs.set('filters[slug][$eq]', slug)

  return fetchStrapi<StrapiResponse<StaticPage[]>>(`/static-pages?${qs}`, {
    next: { revalidate: 3600 },
  })
}

export function getStrapiMediaUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${STRAPI_URL}${url}`
}
