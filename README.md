# SEO Site Template

Template de site éditorial SEO — duplicable pour n'importe quelle niche.

**Stack :** Next.js 15 · Strapi 4 · PostgreSQL 16 · TypeScript · Tailwind CSS

---

## Objectif

Publier des articles éditoriaux de qualité, travailler le SEO organique et vendre des liens via des plateformes comme Getfluence. Le design est volontairement simple et sérieux pour maximiser la crédibilité éditoriale.

---

## Installation rapide

### 1. Lancer PostgreSQL

```bash
docker compose up -d
```

PostgreSQL sera disponible sur `localhost:5432`.

### 2. Configurer et lancer Strapi

```bash
cd backend
cp .env.example .env
# Éditer .env : remplir APP_KEYS, ADMIN_JWT_SECRET, API_TOKEN_SALT, etc.
npm install
npm run develop
```

Strapi démarre sur http://localhost:1337/admin

**Premier démarrage :** Les données de test sont créées automatiquement (6 articles, 3 catégories, 1 auteur, pages statiques, site settings).

### 3. Configurer et lancer Next.js

```bash
cd frontend
cp .env.example .env.local
# Éditer .env.local : ajouter STRAPI_API_TOKEN
npm install
npm run dev
```

Le site est disponible sur http://localhost:3000

---

## Configuration des variables d'environnement

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `APP_KEYS` | Clés aléatoires séparées par virgule (ex: `openssl rand -base64 32`) |
| `API_TOKEN_SALT` | Salt pour les tokens API |
| `ADMIN_JWT_SECRET` | Secret JWT pour l'admin |
| `TRANSFER_TOKEN_SALT` | Salt pour les transfers |
| `JWT_SECRET` | Secret JWT utilisateurs |
| `DATABASE_HOST` | Hôte PostgreSQL (default: `localhost`) |
| `DATABASE_PORT` | Port PostgreSQL (default: `5432`) |
| `DATABASE_NAME` | Nom de la base (default: `seo_site_template`) |
| `DATABASE_USERNAME` | Utilisateur PostgreSQL |
| `DATABASE_PASSWORD` | Mot de passe PostgreSQL |
| `FRONTEND_URL` | URL du frontend pour CORS |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (ex: `https://monsite.fr`) |
| `NEXT_PUBLIC_STRAPI_URL` | URL de Strapi (ex: `https://api.monsite.fr`) |
| `STRAPI_API_TOKEN` | Token API Strapi (lecture seule) |

---

## Créer un API Token Strapi

1. Aller dans **Settings → API Tokens → Create new API Token**
2. Nom : `Frontend`
3. Token type : **Read-only**
4. Cliquer "Save" et copier le token
5. Coller dans `frontend/.env.local` : `STRAPI_API_TOKEN=ton_token_ici`

---

## Configurer les permissions publiques Strapi

Si tu préfères ne pas utiliser de token (accès public) :

1. **Settings → Users & Permissions Plugin → Roles → Public**
2. Activer `find` et `findOne` pour :
   - `Article`
   - `Category`
   - `Author`
   - `Static-page`
   - `Site-setting`
3. Sauvegarder

⚠️ Avec cette configuration, l'API est accessible sans authentification. Utiliser un token est recommandé.

---

## Modifier le nom du site

1. Aller dans **Content Manager → Site Setting** dans l'admin Strapi
2. Modifier `siteName`, `siteDescription`, `contactEmail`
3. Sauvegarder

Le header, footer et les métadonnées SEO se mettent à jour automatiquement.

---

## Ajouter un premier article

1. **Content Manager → Article → Create new entry**
2. Remplir :
   - `title` : le titre de l'article
   - `slug` : généré automatiquement (modifier si besoin)
   - `excerpt` : accroche courte (150-200 mots) — apparaît dans les cards
   - `content` : corps de l'article en rich text HTML
   - `coverImage` : image de couverture (recommandé : 1200×630px)
   - `category` : relier à une catégorie existante
   - `author` : relier à un auteur
   - `publishedAtCustom` : date d'affichage souhaitée
   - `seoTitle` : titre SEO (60 car. max)
   - `seoDescription` : meta description (155 car. max)
   - `readingTime` : temps de lecture en minutes (optionnel)
3. Cliquer **Publish** pour publier

---

## Dupliquer pour une autre niche

1. Copier le dossier racine : `cp -r seo-site-template mon-site-cuisine`
2. Modifier dans `backend/.env` : `DATABASE_NAME=mon_site_cuisine`
3. Modifier dans `frontend/.env.local` :
   - `NEXT_PUBLIC_SITE_URL=https://mon-site-cuisine.fr`
   - `NEXT_PUBLIC_STRAPI_URL=https://api.mon-site-cuisine.fr`
4. Relancer la base : `docker compose up -d` (nouveau volume)
5. Relancer Strapi : le seed créera un Site Setting vierge que tu pourras personnaliser
6. Adapter le contenu de seed dans `backend/src/index.ts` si besoin

---

## Déploiement conseillé

### Frontend → Vercel

```bash
# Depuis Vercel Dashboard
# 1. New Project → Import depuis GitHub
# 2. Root Directory : frontend
# 3. Variables d'environnement à ajouter :
#    NEXT_PUBLIC_SITE_URL=https://monsite.fr
#    NEXT_PUBLIC_STRAPI_URL=https://api.monsite.fr
#    STRAPI_API_TOKEN=ton_token_secret
# 4. Deploy
```

### Backend Strapi → Railway ou Render

**Railway :**
1. New Project → Deploy from GitHub → sélectionner le repo, dossier `/backend`
2. Ajouter les variables d'environnement
3. Railway fournit PostgreSQL via un plugin ou utiliser Supabase

**Render :**
1. New Web Service → connecter GitHub → Root Directory : `backend`
2. Build command : `npm install && npm run build`
3. Start command : `npm run start`
4. Ajouter les variables d'environnement

### PostgreSQL → Supabase ou Railway

- **Supabase** (gratuit) : créer un projet, récupérer la connection string
- **Railway** : ajouter le plugin PostgreSQL, récupérer les variables automatiquement

### Stockage images → Local d'abord, S3 ensuite

Par défaut, les images sont stockées localement dans `backend/public/uploads/`. Pour la production, configurer Strapi pour utiliser AWS S3 ou Cloudflare R2 via `@strapi/provider-upload-aws-s3`.

---

## Checklist avant déploiement

- [ ] Variables d'environnement remplies avec des valeurs sécurisées
- [ ] `APP_KEYS`, `ADMIN_JWT_SECRET`, etc. générés avec `openssl rand -base64 32`
- [ ] `NEXT_PUBLIC_SITE_URL` pointe vers l'URL de production
- [ ] API Token Strapi créé et configuré dans le frontend
- [ ] Permissions Strapi vérifiées (Public ou Token)
- [ ] Site Setting configuré (nom, description, email)
- [ ] Articles et catégories créés
- [ ] Images des articles uploadées
- [ ] `robots.txt` et `sitemap.xml` accessibles en production
- [ ] Vérifier les meta descriptions sur les pages principales
- [ ] Tester sur mobile (responsive)
- [ ] Vérifier les temps de chargement (Next.js + next/image)

---

## Structure du projet

```
seo-site-template/
├── frontend/               # Next.js 15 — App Router
│   ├── app/               # Pages et routes
│   ├── components/        # Composants réutilisables
│   ├── lib/               # Fonctions API et utilitaires
│   ├── types/             # Types TypeScript
│   └── .env.example
│
├── backend/               # Strapi 4 — API headless
│   ├── config/            # Configuration Strapi
│   ├── src/
│   │   ├── api/           # Content types (article, category, etc.)
│   │   └── index.ts       # Bootstrap + seed automatique
│   └── .env.example
│
├── docker-compose.yml     # PostgreSQL uniquement
└── README.md
```
