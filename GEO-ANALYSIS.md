# Audit GEO (Generative Engine Optimization) — mon-carburant.com

Date : 2026-07-01
Périmètre : site en production (mon-carburant.com), build Astro `output: 'static'`, 21 articles de blog, 4 piliers de silo, 1 auteur.

> Note de méthode (source primaire Google) : l'optimisation pour la recherche IA reste du SEO. Ce rapport applique les fondamentaux SEO aux surfaces IA (AI Overviews, ChatGPT, Perplexity, Bing Copilot), sans traiter le GEO comme une discipline séparée.

---

## 1. GEO Readiness Score : 78/100

| Critère (pondération) | Score |
|---|---|
| Citabilité des passages (25%) | 21/25 |
| Structure / lisibilité (20%) | 18/20 |
| Contenu multimodal (15%) | 7/15 |
| Autorité & signaux de marque (20%) | 11/20 |
| Accessibilité technique (20%) | 20/20 |

---

## 2. Répartition par plateforme

- **Google AI Overviews** : bon potentiel. Contenu structuré, sourcé (DGEC, data.economie.gouv.fr), balayant les patterns "SEO classique + passages citables" que Google privilégie (92% des citations AIO viennent du top-10).
- **ChatGPT** : point faible. ChatGPT cite majoritairement Wikipédia (47,9%) et Reddit (11,3%) : le site n'a aucune présence sur ces deux plateformes.
- **Perplexity** : point faible. Perplexity s'appuie sur Reddit (46,7%) et Wikipédia : mêmes lacunes.
- **Bing Copilot** : neutre à correct. Dépend de l'indexation Bing (non vérifiable depuis ce dépôt) ; le SEO on-page classique du site (schema, sitemap, robots) est déjà solide.

---

## 3. Accès des crawlers IA (robots.txt)

```
User-agent: *
Allow: /
Disallow: /data/
Sitemap: https://mon-carburant.com/sitemap-index.xml
```

Vérifié en local **et en production** (contenu identique).

- Règle générique `Allow: /` sans exclusion de user-agent : **GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, CCBot, anthropic-ai, Bytespider, cohere-ai sont tous autorisés.**
- Seul `/data/` (JSON bruts) est bloqué, ce qui est un choix de budget de crawl pertinent et n'affecte pas le contenu éditorial.
- Aucune action requise ici : c'est la configuration recommandée.

**Point de rédaction (hors GEO, mais règle du dépôt)** : le commentaire ligne 4 de `public/robots.txt` contient un tiret cadratin `—`, ce qui viole la règle "non négociable" du CLAUDE.md du projet ("jamais de tirets longs"). À corriger.

---

## 4. Statut llms.txt

`/llms.txt` **présent** à la racine, contenu de bonne qualité :
- Description claire du site, source de données citée (data.economie.gouv.fr, Licence Ouverte 2.0), fréquence de mise à jour.
- Pages principales listées avec description.
- Section "Auteur" avec attribution nominative.
- Mention explicite d'autorisation de citation IA avec attribution.

Rappel (voir `references/llmstxt-evidence.md`) : `/llms.txt` n'est actuellement **pas un levier de citation** pour les moteurs IA majeurs (aucun signal confirmé chez OpenAI/Google/Perplexity à ce jour). Sa présence est une bonne pratique de gouvernance de contenu, mais ne doit pas être surestimée dans la feuille de route ni substituée aux fondamentaux SEO ci-dessous.

---

## 5. Analyse des signaux de marque

| Signal | Statut |
|---|---|
| Wikipédia | Absent |
| Reddit | Absent |
| YouTube | Absent |
| LinkedIn (organisation) | Absent (`sameAs` du schema `Organization` ne référence qu'Instagram et X) |
| LinkedIn (auteur) | Présent (`hugo-beignon-3ab500366`) |
| Site personnel auteur | Présent (hugo.beignon.com) |

C'est le point le plus faible de l'audit. Rappel du contexte (étude Ahrefs, 75 000 marques) : **les mentions de marque corrèlent 3x plus fortement avec la visibilité IA que les backlinks**, et YouTube/Reddit sont les signaux les plus forts, loin devant le Domain Rating. Un site jeune (fondation 2026 selon le schema `Organization`) n'a mécaniquement aucune de ces traces encore : c'est normal à ce stade, mais c'est le premier levier à activer pour progresser sur ChatGPT/Perplexity (voir section 8).

---

## 6. Citabilité au niveau des passages

Échantillon vérifié (`compatibilite-sp95-e10.md`) représentatif des 21 articles :
- Réponse directe dès le premier paragraphe (chiffre clé + méthode de vérification en une phrase), bien en dessous de la limite des 60 premiers mots.
- Statistiques sourcées et attribuées : "**94% du parc essence français** selon les données de la DGEC (2026)".
- Blocs autonomes exploitables hors contexte (chaque section H2/H3 répond à une seule question).
- Tableau comparatif structuré (constructeur / année de compatibilité).
- FAQ en fin d'article avec réponses courtes et factuelles (2-3 phrases), bien calibrées pour l'extraction.

Les 21 articles de blog incluent tous une section FAQ (`faq:` dans le frontmatter), et 5 incluent des étapes structurées (`howToSteps:`). C'est un très bon niveau de préparation à l'extraction par les moteurs IA.

Point d'attention structurel : le schéma Zod (`articleSchema` dans `src/content.config.ts`) n'impose pas de longueur minimale/maximale sur `faq[].answer` ni sur les paragraphes du corps. Rien ne garantit dans le temps que les futurs articles respectent la fourchette optimale de 134-167 mots par bloc de réponse ; c'est aujourd'hui tenu par la discipline éditoriale, pas par le schéma.

---

## 7. Rendu côté serveur (accessibilité technique)

- `astro.config.mjs` : `output: 'static'`. Le site est **entièrement pré-rendu en HTML statique**, aucune directive `client:load`/`client:visible`/`client:idle` trouvée dans les composants ou pages.
- Conséquence directe : **aucune dépendance JavaScript pour le contenu éditorial**. Les crawlers IA (qui n'exécutent pas JS) reçoivent l'intégralité du contenu, du schema JSON-LD et des métadonnées dès la première requête HTTP.
- Score maximal sur ce critère : rien à corriger.

---

## 8. Schema.org / données structurées

Implémentation centralisée via le composant `SEO.astro`, bien architecturée :

- **Page d'accueil** (`src/pages/index.astro`) : `WebSite` (avec `SearchAction`), `Organization` (avec `logo`, `sameAs`), `WebApplication` (avec `Offer` prix 0€). Bonne base d'entité pour les moteurs IA.
- **Articles** (`ArticleLayout.astro`) : schema `Article` complet (headline, description, image, dates de publication/modification, `author` en `Person` lié à `/auteur/{slug}/`, `publisher` en `Organization`).
- **HowTo** : généré automatiquement quand `howToSteps` est renseigné (5 articles).
- **FAQPage** : généré automatiquement dans `FAQ.astro` pour les 21 articles qui ont une section FAQ.
- **Person** : page auteur dédiée (`src/pages/auteur/[slug].astro`) avec `personSchema`.

**Nuance importante sur FAQPage** : depuis 2023, Google a restreint l'éligibilité aux rich results FAQPage aux sites gouvernementaux/santé officiels. Pour un site commercial comme celui-ci, ce schema **ne produira pas de rich snippet dans les SERP Google**, mais reste utile comme signal de structure exploitable par les moteurs IA génératifs (qui ne sont pas soumis à la même politique d'éligibilité que les rich results classiques). Ce n'est donc pas une erreur à corriger, juste une attente à calibrer : ne pas compter dessus pour les rich results Google traditionnels.

---

## 9. Contenu multimodal (point faible, 7/15)

- Chaque article a une image mise en avant (`featuredImage`) avec `alt` obligatoire (`imageAlt` requis par le schéma Zod) : bon socle.
- Aucune vidéo, infographie ou élément interactif détecté dans les articles ou les pages piliers.
- Le comparateur de prix (`HeroMap`, `outils/`) constitue un élément interactif fort (carte, données en temps réel), mais ce potentiel n'est pas répliqué dans les articles de blog eux-mêmes (pas de mini-calculateur ni de graphique intégré dans le contenu éditorial).

---

## 10. Top 5 changements à plus fort impact

1. **Combler l'absence de présence externe de marque** (section 5) : créer une page Reddit/communauté ou participer activement dans des subreddits pertinents (r/france, r/automobile...), et envisager une chaîne YouTube ou des mentions vidéo, pour capter les 46,7% (Reddit) et 47,9% (Wikipédia) de sources citées par ChatGPT/Perplexity.
2. **Ajouter LinkedIn organisation à `sameAs`** dans `organizationSchema` (`src/pages/index.astro:94-97`) si une page LinkedIn existe ou est créée : gain rapide, faible effort.
3. **Corriger le tiret cadratin dans `public/robots.txt` ligne 4** pour respecter la règle non négociable du dépôt.
4. **Intégrer un élément multimodal par article pilier** (graphique de prix, mini-tableau interactif, ou lien vidéo) pour capter le gain de +156% de taux de sélection associé au contenu multimodal.
5. **Ne pas construire de roadmap autour de `/llms.txt`** au-delà de sa présence actuelle : le fichier existe déjà et est de bonne qualité, mais aucune preuve de source primaire ne montre qu'il influence les citations. Réaffecter l'effort prévu "llms.txt" vers la présence de marque (point 1).

---

## 11. Recommandations schema

- `organizationSchema` (index.astro) : ajouter `sameAs` LinkedIn organisation dès sa création.
- Envisager un schema `Person` enrichi pour Hugo Beignon incluant `sameAs` (LinkedIn déjà présent en frontmatter auteur, mais pas propagé dans `personSchema` de `src/pages/auteur/[slug].astro`) : à vérifier/étendre pour renforcer l'entité auteur auprès des moteurs IA.
- Pas de changement requis sur `Article`, `HowTo`, `WebSite`, `WebApplication` : implémentation déjà conforme aux standards.

---

## 12. Reformulation de contenu

Aucune réécriture nécessaire sur l'échantillon vérifié : les articles respectent déjà le pattern réponse directe + définition + données chiffrées sourcées + FAQ courte. Point de vigilance pour les futurs articles : conserver la discipline actuelle (blocs de 134-167 mots, statistique sourcée par paragraphe) qui n'est pour l'instant garantie par aucune contrainte de schéma, uniquement par la pratique éditoriale.
