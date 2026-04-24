import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSiteSettings } from '@/lib/strapi'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await getSiteSettings()
    const siteName = data?.attributes?.siteName || 'Mon Site Éditorial'
    const siteDescription =
      data?.attributes?.defaultSeoDescription ||
      data?.attributes?.siteDescription ||
      'Votre référence éditoriale.'

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description: siteDescription,
      metadataBase: new URL(SITE_URL),
      openGraph: {
        siteName,
        type: 'website',
        locale: 'fr_FR',
      },
      twitter: {
        card: 'summary_large_image',
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch {
    return {
      title: {
        default: 'Mon Site Éditorial',
        template: '%s | Mon Site Éditorial',
      },
      description: 'Votre référence éditoriale.',
      metadataBase: new URL(SITE_URL),
    }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="antialiased flex flex-col min-h-screen bg-white text-gray-900">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
