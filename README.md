# Mon Carburant

Média éditorial indépendant spécialisé dans le carburant, l'économie d'essence et l'automobile.

**Stack** : Astro v5 · Tailwind CSS v4 · TypeScript strict · Content Collections · MDX

## Commandes principales

```bash
npm install          # Installer les dépendances
npm run dev          # Démarrer le serveur de développement (http://localhost:4321)
npm run build        # Construire le site statique dans /dist
npm run preview      # Prévisualiser le build
npm run deploy       # Build + zipper /dist pour Hostinger
```

## Structure du projet

```
src/
├── content.config.ts          # Schémas Zod des collections (blog, piliers, authors)
├── content/
│   ├── blog/                  # Articles satellites (.mdx)
│   ├── piliers/               # Articles piliers (.mdx)
│   └── authors/               # Auteurs (.json)
├── styles/
│   └── global.css             # CSS global + Tailwind v4 + variables de marque
├── layouts/
│   └── BaseLayout.astro       # Enveloppe HTML commune à toutes les pages
├── components/
│   ├── SEO.astro              # Balises meta, OG, Twitter Card, JSON-LD
│   ├── Header.astro           # Navigation principale
│   ├── Footer.astro           # Pied de page 4 colonnes
│   ├── ArticleCard.astro      # Carte d'article pour les listings
│   ├── ArticleLayout.astro    # Layout complet des articles satellites
│   ├── PillarLayout.astro     # Layout complet des articles piliers
│   ├── Breadcrumb.astro       # Fil d'Ariane + JSON-LD BreadcrumbList
│   ├── TableOfContents.astro  # Sommaire auto-généré depuis les headings
│   ├── AuthorBox.astro        # Encart auteur en fin d'article
│   ├── RelatedArticles.astro  # 3 articles liés
│   ├── FAQ.astro              # Accordion FAQ + JSON-LD FAQPage
│   ├── Newsletter.astro       # Bloc inscription newsletter (UI)
│   └── ShareButtons.astro     # Partage natif + copier lien
└── pages/
    ├── index.astro                    # Accueil
    ├── blog/
    │   ├── index.astro               # Listing articles
    │   └── [slug].astro              # Article individuel
    ├── piliers/
    │   └── [slug].astro              # Article pilier
    ├── categorie/
    │   └── [category].astro          # Listing par catégorie
    ├── auteur/
    │   └── [slug].astro              # Page auteur
    ├── a-propos.astro
    ├── contact.astro
    ├── mentions-legales.astro
    ├── politique-confidentialite.astro
    ├── 404.astro
    └── rss.xml.ts                    # Flux RSS

public/
├── robots.txt
├── favicon.svg
└── images/
    ├── articles/              # Images des articles (à ajouter manuellement)
    └── authors/               # Photos des auteurs
```

## Ajouter un article

1. Créer un fichier `.mdx` dans `src/content/blog/` :

```mdx
---
title: "Mon titre (max 70 caractères)"
metaTitle: "Mon titre SEO (max 60 caractères)"
metaDescription: "Description SEO (max 160 caractères)"
slug: "mon-slug-kebab-case"
excerpt: "Résumé affiché dans les listings (max 200 caractères)"
publishedAt: 2026-01-15
author: "thomas-martin"
category: "economies"  # economies | carburants | fiscalite | entretien
tags: ["tag1", "tag2"]
featuredImage: "/images/articles/mon-image.jpg"
imageAlt: "Description de l'image pour l'accessibilité"
readingTime: 5
draft: false
faq:
  - question: "Question fréquente ?"
    answer: "Réponse complète."
---

## Mon premier H2

Contenu en Markdown/MDX...
```

2. Ajouter l'image dans `public/images/articles/` (recommandé : 1200×630px, WebP ou JPG)

## Ajouter un article pilier

1. Créer un fichier `.mdx` dans `src/content/piliers/`
2. Champs supplémentaires au frontmatter :

```yaml
relatedArticles:
  - "slug-article-satellite-1"
  - "slug-article-satellite-2"
ctaTitle: "Titre du CTA en fin d'article"
ctaDescription: "Description du CTA"
```

3. Sur les articles satellites correspondants, ajouter le champ `pillar: "slug-du-pilier"`

## Ajouter un auteur

Créer `src/content/authors/prenom-nom.json` :

```json
{
  "name": "Prénom Nom",
  "slug": "prenom-nom",
  "bio": "Biographie de l'auteur...",
  "photo": "/images/authors/prenom-nom.webp",
  "expertise": ["Domaine 1", "Domaine 2"],
  "linkedin": "https://linkedin.com/in/prenom-nom"
}
```

## Déploiement sur Hostinger

1. Construire le site : `npm run build`
2. Zipper le contenu du dossier `/dist` (pas le dossier lui-même, son contenu)
3. Sur Hostinger > File Manager, uploader le zip à la racine du domaine
4. Extraire le zip
5. Configurer la page d'erreur 404 dans Hostinger sur `404/index.html`

> **Note** : Configurer `mon-carburant.com` comme domaine dans Hostinger avant le build pour que le sitemap et les URLs canoniques soient corrects.

## SEO — Checklist technique

- [x] Sitemap automatique (`/sitemap-index.xml`) via `@astrojs/sitemap`
- [x] `robots.txt` pointant vers le sitemap
- [x] URL canonique sur chaque page
- [x] Schema.org JSON-LD : WebSite, Organization, Article, BreadcrumbList, FAQPage, Person
- [x] Open Graph + Twitter Card complets
- [x] `lang="fr"` sur `<html>`
- [x] `hreflang fr-FR` sur chaque page
- [x] Flux RSS `/rss.xml`
- [x] Page 404 custom
- [x] Images avec `loading="lazy"` (sauf featured image)
- [x] Polices auto-hébergées via @fontsource

## Pages légales — Placeholders à compléter

Chercher `[À COMPLÉTER]` dans :
- `src/pages/mentions-legales.astro` : éditeur, SIRET, directeur de publication
- `src/pages/politique-confidentialite.astro` : responsable de traitement, DPO

## Personnalisation de la marque

Les couleurs et polices sont définies comme variables CSS dans `src/styles/global.css` (bloc `:root` et `@theme`).
Modifier les valeurs pour rebrand complet sans toucher aux composants.
