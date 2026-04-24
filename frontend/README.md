# Frontend — Next.js

Site éditorial SEO basé sur Next.js 15, TypeScript et Tailwind CSS.

## Prérequis

- Node.js 18.x ou 20.x
- npm >= 8
- Strapi backend en cours d'exécution (ou token valide)

## Installation

```bash
cd frontend
npm install
```

## Configuration

```bash
cp .env.example .env.local
```

Remplir :

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=coller_le_token_strapi_ici
```

## Lancement

```bash
npm run dev
```

Le site sera disponible sur http://localhost:3000

## Build production

```bash
npm run build
npm run start
```

## Structure

```
app/
  page.tsx                          → Accueil
  articles/page.tsx                 → Liste des articles
  articles/[slug]/page.tsx          → Article détail
  categories/page.tsx               → Liste des catégories
  categories/[slug]/page.tsx        → Catégorie détail
  contact/page.tsx                  → Contact
  ecrire-pour-nous/page.tsx         → Écrire pour nous
  mentions-legales/page.tsx         → Mentions légales
  politique-confidentialite/page.tsx→ Politique de confidentialité
  sitemap.ts                        → Sitemap dynamique
  robots.ts                         → robots.txt
components/
  Header.tsx                        → Header (Server Component)
  Footer.tsx                        → Footer (Server Component)
  MobileMenu.tsx                    → Menu mobile (Client Component)
  ArticleCard.tsx                   → Card article
  Breadcrumb.tsx                    → Fil d'Ariane
  AuthorBlock.tsx                   → Bloc auteur
  RelatedArticles.tsx               → Articles liés
lib/
  strapi.ts                         → Fonctions API Strapi
  utils.ts                          → Utilitaires (formatDate, etc.)
types/
  index.ts                          → Types TypeScript
```

## SEO

- Metadata dynamique via `generateMetadata` sur chaque page
- Sitemap XML automatique : `/sitemap.xml`
- robots.txt automatique : `/robots.txt`
- Open Graph et Twitter Card sur articles et catégories
- Structure HTML sémantique (article, header, nav, main, footer)
- Fil d'Ariane sur les pages intérieures
- ISR (revalidation automatique toutes les heures) sur les pages articles

## Déploiement Vercel

1. Importer le repo sur Vercel
2. Définir le répertoire racine : `frontend`
3. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_SITE_URL` → URL de production
   - `NEXT_PUBLIC_STRAPI_URL` → URL de ton Strapi déployé
   - `STRAPI_API_TOKEN` → Token API Strapi (secret)
