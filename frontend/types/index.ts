export interface StrapiMedia {
  id: number
  attributes: {
    url: string
    alternativeText?: string | null
    width?: number
    height?: number
    formats?: {
      thumbnail?: { url: string; width: number; height: number }
      small?: { url: string; width: number; height: number }
      medium?: { url: string; width: number; height: number }
      large?: { url: string; width: number; height: number }
    }
  }
}

export interface StrapiMediaRelation {
  data: StrapiMedia | null
}

export interface StrapiResponse<T> {
  data: T
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiSingleResponse<T> {
  data: T
  meta: Record<string, unknown>
}

export interface Article {
  id: number
  attributes: {
    title: string
    slug: string
    excerpt?: string | null
    content?: string | null
    coverImage?: StrapiMediaRelation
    publishedAtCustom?: string | null
    publishedAt: string
    createdAt: string
    updatedAt: string
    category?: { data: Category | null }
    author?: { data: Author | null }
    seoTitle?: string | null
    seoDescription?: string | null
    canonicalUrl?: string | null
    isFeatured?: boolean
    readingTime?: number | null
  }
}

export interface Category {
  id: number
  attributes: {
    name: string
    slug: string
    description?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    articles?: { data: Article[] }
    createdAt: string
    updatedAt: string
  }
}

export interface Author {
  id: number
  attributes: {
    name: string
    slug?: string | null
    bio?: string | null
    avatar?: StrapiMediaRelation
    createdAt: string
    updatedAt: string
  }
}

export interface StaticPage {
  id: number
  attributes: {
    title: string
    slug: string
    content?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
  }
}

export interface SiteSetting {
  id: number
  attributes: {
    siteName?: string | null
    siteDescription?: string | null
    logo?: StrapiMediaRelation
    favicon?: StrapiMediaRelation
    contactEmail?: string | null
    primaryColor?: string | null
    defaultSeoTitle?: string | null
    defaultSeoDescription?: string | null
    socialImage?: StrapiMediaRelation
  }
}
