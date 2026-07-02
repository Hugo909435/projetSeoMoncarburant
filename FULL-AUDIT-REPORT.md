# Audit SEO mon-carburant.com (2026-07-02)

Objectif : évaluer la viabilité du site pour la vente de liens d'articles et diagnostiquer la non-indexation des pages.

## Score de santé SEO : 62/100

| Catégorie | Note | Commentaire |
|---|---|---|
| SEO technique | 90/100 | Quasi irréprochable |
| Contenu | 70/100 | Blog correct, pages programmatiques templatisées |
| On-page | 85/100 | Titles, canonicals, meta robots corrects |
| Schema | 80/100 | JSON-LD présent via composant SEO |
| Performance | 90/100 | TTFB 0,27s, statique, HTML compressé |
| **Autorité / backlinks** | **5/100** | Aucun backlink détecté, domaine de 10 semaines |
| **Indexation effective** | **10/100** | Une poignée de pages indexées sur 318** |

## 1. Pourquoi les pages ne s'indexent pas

### Ce qui est HORS DE CAUSE (vérifié)

- robots.txt : `Allow: /`, seul `/data/` bloqué (bon choix). OK
- Sitemap : index + sitemap-0.xml, 318 URLs, déclaré dans robots.txt. OK
- Meta robots : `index, follow` sur les pages testées. OK
- Canonicals : auto-référencés, corrects. OK
- Certificat TLS : Let's Encrypt valide (expire 21/09/2026). OK
- Performance : TTFB 267 ms, site statique Astro. OK
- Rendu : HTML complet côté serveur, pas de dépendance JS pour le contenu. OK

Le problème n'est PAS technique.

### Les vraies causes

1. **Domaine créé le 24 avril 2026** (10 semaines). Google met 3 à 6 mois minimum
   pour indexer largement un site neuf sans autorité.
2. **Zéro backlink détecté.** Aucun site externe ne cite mon-carburant.com.
   Sans lien entrant, Google n'a aucune raison d'allouer du budget de crawl
   ni de faire confiance au domaine.
3. **87 % de pages programmatiques** : 140 villes + 96 départements + 24 enseignes
   + 13 régions sur 318 URLs. Pour un domaine sans autorité, Google classe ces
   pages templatisées en « Détectée, actuellement non indexée » ou
   « Explorée, actuellement non indexée ». C'est le comportement normal de
   Google face au SEO programmatique sur domaine neuf.
4. **Niche très concurrentielle** avec une source officielle qui domine
   (prix-carburants.gouv.fr) et des acteurs installés (mon-essence.com,
   Essence&CO, Waze). Google est d'autant plus sélectif.
5. **Sitemap : lastmod identique sur les 318 URLs** à chaque build quotidien.
   Quand tout le site prétend changer chaque jour, Google apprend à ignorer le
   lastmod. Les articles de blog devraient porter leur vraie date.

### Constat d'indexation (recherche site:)

Pages retrouvées dans Google : accueil, /prix-carburants/, 1 page département
(Ain), 1 article de blog (Leclerc prix coûtant). Soit environ 4-5 pages sur 318.

## 2. Vente de liens d'articles : es-tu sur la bonne voie ?

### Verdict : la base est bonne, mais le site n'est pas encore vendable, et le modèle comporte un risque structurel.

Ce qu'un acheteur de liens regarde : DR/TF (Ahrefs, Majestic), trafic organique
estimé, nombre de pages indexées, thématique. Aujourd'hui : DR proche de 0,
trafic proche de 0, moins de 10 pages indexées. Valeur marchande actuelle : nulle.
Aucune plateforme (Getfluence, Linkuma, Ereferer, RocketLinks) n'acceptera le
site avant 6 à 12 mois de construction d'autorité.

### Points forts pour ce modèle

- Vraie utilité (données officielles quotidiennes) : ce n'est pas un site
  « coquille vide », ce qui le distingue de 90 % des sites à liens.
- Thématique large et monétisable : carburant, auto, pouvoir d'achat, mobilité.
  Beaucoup d'annonceurs potentiels (assurance, entretien auto, VE, finance).
- Base technique propre : un acheteur ou une plateforme n'y verra pas de red flag.
- Blog éditorial actif (23 articles) avec un auteur identifié (E-E-A-T).

### Points faibles et risques

- Sans backlinks ni trafic, pas de valeur à vendre. La priorité absolue est
  l'acquisition de liens ENTRANTS avant de penser à en vendre.
- La vente de liens dofollow viole les règles anti-spam de Google (link schemes).
  Risque : dévaluation silencieuse des liens sortants, voire action manuelle qui
  détruirait l'actif. Les sites qui durent limitent le volume (1-2 articles
  sponsorisés/mois), gardent 80 %+ de contenu propre et évitent les ancres
  sur-optimisées.
- Le modèle est un paradoxe : il faut que Google fasse confiance au site pour
  que les liens aient de la valeur, et vendre des liens érode cette confiance.

## 3. Détails techniques relevés

- `astro.config.mjs` : exclusion du sitemap des villes/départements < 3 stations
  avec noindex côté page. Très bonne pratique anti « index bloat ». À conserver.
- changefreq/priority dans le sitemap : ignorés par Google, inoffensifs.
- Redirections www vers apex et http vers https : correctes (301).
- Hreflang fr-FR + x-default auto-référencés : inutile sur un site monolingue
  mais sans danger.
