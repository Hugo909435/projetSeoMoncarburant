---
name: article-mensuel-prix-coutant
description: "Rédige le point mensuel sur les opérations carburant à prix coûtant (Leclerc, Intermarché, Carrefour, Système U, TotalEnergies) pour un mois donné. Utiliser quand l'utilisateur demande l'article prix coûtant du mois, le récap mensuel des opérations carburant, ou dit par exemple \"fais l'article prix coûtant de septembre\"."
---

# Article mensuel : carburant à prix coûtant

Série publiée une fois par mois sur mon-carburant.com. Chaque édition fait le
point sur les opérations à prix coûtant du mois en cours, les prix relevés et
les fenêtres à venir.

Article de référence à copier comme modèle :
`src/content/blog/carburant-prix-coutant-aout-2026.md`

## 1. Convention de nommage

| Élément | Format | Exemple (septembre 2026) |
|---------|--------|---------------------------|
| Fichier | `src/content/blog/carburant-prix-coutant-<mois>-<année>.md` | `carburant-prix-coutant-septembre-2026.md` |
| `slug` | identique au nom de fichier sans extension | `carburant-prix-coutant-septembre-2026` |
| `featuredImage` | `/images/articles/<slug>.webp` | `/images/articles/carburant-prix-coutant-septembre-2026.webp` |

Mois sans accent ni cédille dans le slug : `janvier`, `fevrier`, `mars`,
`avril`, `mai`, `juin`, `juillet`, `aout`, `septembre`, `octobre`, `novembre`,
`decembre`.

L'image doit exister dans `public/images/articles/`. À défaut, copier une image
générique de station-service existante sous le nouveau nom, et signaler à
l'utilisateur qu'il faut la remplacer.

## 2. Recherche à faire avant de rédiger

Toujours vérifier les faits du mois, ne jamais recycler ceux du mois précédent :

1. **Opérations du mois**, enseigne par enseigne : Leclerc, Intermarché / Netto,
   Carrefour, Système U, Auchan. Chercher `"prix coûtant" carburant <mois> <année>`.
   Noter dates exactes, nombre de stations, carburants inclus et exclus.
2. **Prix moyens nationaux** à la date de publication : gazole B7, SP95-E5,
   SP95-E10, SP98, GPL-c, E85, plus l'évolution sur 7 jours. Source de
   référence : `prix-carburants.gouv.fr` (relais : prix-carburant.eu).
3. **Dispositifs de plafonnement en cours** (TotalEnergies notamment) : niveau
   du plafond, périmètre, dates de validité.
4. **Fenêtres à venir** : week-ends de grands départs, rentrée, Toussaint,
   fêtes de fin d'année.

Si aucune opération n'a eu lieu dans le mois, le dire franchement et expliquer
pourquoi (contexte de prix, calendrier habituel des enseignes). Un mois creux
reste un article utile.

## 3. Plan type

1. Intro : ce qui caractérise le mois en une ou deux phrases.
2. L'opération (ou les opérations) du mois : qui, quand, combien de stations.
3. Tableau des prix moyens nationaux à la date de publication, avec évolution
   hebdomadaire et note de source en italique sous le tableau.
4. Les dispositifs de plafonnement en cours (TotalEnergies).
5. Les enseignes silencieuses ce mois-ci, et pourquoi.
6. La nuance sur l'économie réelle : l'écart structurel grande surface contre
   moyenne nationale ne doit pas être confondu avec l'effet propre de
   l'opération (marge distributeur, 1 à 3 c/L, soit 0,50 à 1,50 € pour 50 L).
   Les taxes, environ 60 % du prix, ne bougent pas.
7. Les fenêtres à surveiller d'ici le mois suivant.
8. Comment ne pas rater la prochaine.
9. Note de bas de page en italique : date de publication, source des prix,
   mention que l'article sera mis à jour si une opération est annoncée.

## 4. Frontmatter

Reprendre celui de l'article de référence. Champs à adapter chaque mois :
`title`, `metaTitle`, `metaDescription`, `slug`, `excerpt`, `publishedAt`,
`tags` (remplacer le tag de mois), `featuredImage`, `imageAlt`, `faq`.

Champs stables pour la série : `author: "hugo-beignon"`,
`category: "economies"`, `pillar: "reduire-facture-carburant"`,
`ctaTitle` et `ctaDescription` du comparateur.

`relatedArticles` : pointer vers le calendrier des enseignes, l'édition du mois
précédent, et deux ou trois articles d'enseigne pertinents.

La FAQ compte 5 questions, dont ces trois récurrentes, reformulées avec les
chiffres du mois :

- Quelles opérations ont eu lieu en `<mois> <année>` ?
- Combien coûte le carburant en `<mois> <année>` ?
- Combien économise-t-on vraiment avec une opération à prix coûtant ?

## 5. Maillage interne à mettre à jour

À chaque nouvelle édition :

1. Dans `src/content/blog/prix-coutant-carburant-calendrier-leclerc-intermarche-carrefour.md`,
   remplacer le lien du paragraphe « point mensuel » par la nouvelle édition, et
   mettre à jour `relatedArticles`.
2. Dans l'édition du mois précédent, ajouter le nouveau slug en tête de
   `relatedArticles`.

## 6. Vérifications obligatoires avant commit

```bash
F=src/content/blog/carburant-prix-coutant-<mois>-<annee>.md

# Aucun tiret long (règle CLAUDE.md)
grep -n $'—\|–' "$F" && echo "ERREUR tirets longs" || echo "OK"

# Limites du schéma Astro
for k in title metaTitle metaDescription excerpt; do
  val=$(grep -m1 "^$k:" "$F" | sed "s/^$k: *\"//;s/\" *$//")
  echo "$k = ${#val}"
done
# Limites : title 70, metaTitle 60, metaDescription 160, excerpt 200

# L'image existe
ls public/images/articles/carburant-prix-coutant-<mois>-<annee>.webp

# Le build passe
npx astro build
```
