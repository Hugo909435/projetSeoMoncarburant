# Backend — Strapi

API headless CMS basée sur Strapi v4 avec PostgreSQL.

## Prérequis

- Node.js 18.x ou 20.x
- npm >= 6
- PostgreSQL 14+ (via Docker ou natif)

## Installation

```bash
cd backend
npm install
```

## Configuration

Copier et remplir le fichier d'environnement :

```bash
cp .env.example .env
```

Remplir les variables obligatoires :

```
APP_KEYS=uneClé1,uneClé2            # Générer avec : openssl rand -base64 32
API_TOKEN_SALT=uneSalt               # Générer avec : openssl rand -base64 32
ADMIN_JWT_SECRET=unSecret            # Générer avec : openssl rand -base64 32
TRANSFER_TOKEN_SALT=uneSalt          # Générer avec : openssl rand -base64 32
JWT_SECRET=unSecret                  # Générer avec : openssl rand -base64 32
```

## Lancement

```bash
npm run develop
```

Strapi sera disponible sur http://localhost:1337/admin

## Données de test

Au premier démarrage, le bootstrap crée automatiquement :
- 3 catégories (Économie, Technologie, Société)
- 1 auteur (Marie Dupont)
- 6 articles publiés
- 4 pages statiques (contact, écrire-pour-nous, mentions-légales, politique-confidentialité)
- 1 Site Setting avec le nom "Le Média Expert"

## Créer un API Token

1. Aller dans Settings > API Tokens
2. Cliquer "Create new API Token"
3. Nom : "Frontend token"
4. Type : Read-only
5. Copier le token dans `frontend/.env.local` → `STRAPI_API_TOKEN=...`

## Configurer les permissions publiques

Si tu n'utilises pas de token, activer les permissions publiques :

1. Settings > Users & Permissions Plugin > Roles > Public
2. Activer `find` et `findOne` pour :
   - Article
   - Category
   - Author
   - Static-page
   - Site-setting

## Changer le nom du site

1. Dans l'admin Strapi → Content Manager → Site Setting
2. Modifier `siteName`
3. Sauvegarder

## Déploiement

Voir le README racine pour les instructions de déploiement.
