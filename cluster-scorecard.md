# Cluster Scorecard : voiture électrique ou essence budget carburant

## Résumé

- Posts : 2/8 rédigés (25 %), plus 1 en attente. "Quel jour faire le plein
  pour payer moins cher ?" et le pillar "Voiture électrique ou thermique"
  rédigés et publiés le 07/09/2026, `astro build` vérifié avec succès à
  chaque étape. Images sourcées sur Wikimedia Commons (créditées dans chaque
  article). Le pillar renvoie déjà vers le spoke existant (cout-100km) ; les
  6 spokes pas encore écrits sont référencés via des marqueurs
  `<!-- cluster-link:ID -->` à remplacer par de vrais liens au fil de leur
  rédaction. Le 2e quick-win ("applications essence moins chère") est
  reporté au lancement de l'application maison, cf. [[project_own_app_launch]].
- Contenu existant à absorber : 1 (`essence-vs-electrique-cout-100-km-2026`)
- Liens internes planifiés : 28 (densité 3,5/post sur le nouveau pillar)

## Vérification des quality gates (au niveau du plan, avant rédaction)

| Gate | Résultat | Détail |
|---|---|---|
| Chaque spoke lie le pillar | PASS | 7/7 spokes → pillar |
| Le pillar lie chaque spoke | PASS | 7/7 |
| Minimum 3 liens entrants par post | PASS (nouveau pillar) / WARN (quick-wins) | Voir ci-dessous |
| Aucun mot-clé principal dupliqué | PASS | 9 mots-clés primaires distincts, vérifiés |
| Aucune page orpheline | PASS | Toutes atteignables en 2 clics depuis le pillar |
| Word count cible défini | PASS | 1200 à 3500 mots selon le rôle |

### Détail "minimum 3 liens entrants"

Nouveau pillar (8 nœuds) : chaque spoke reçoit exactement 3 liens entrants après
correction de la matrice initiale (pillar + 1-2 liens de fratrie + 0-1 lien
cross-cluster). Le pillar reçoit 7 liens entrants (un par spoke).

**WARN, quick-win du pillar existant :** "meilleur jour pour faire le plein"
n'a qu'un seul lien entrant prévu (le pillar existant) puisque son spoke
jumeau "applications essence" est en attente. Un marqueur
`<!-- cluster-link:quickwin-00 -->` est prévu dans le brief pour insérer le
lien croisé une fois l'article "applications" publié. Remédiation immédiate :
ajouter aussi un lien depuis au moins un article déjà publié du pillar
existant (`indemnite-carburant-2026`, `e85-superethanol-vaut-il-le-coup` ou
`entretien-baisser-consommation`, déjà cités dans `relatedArticles` du pillar)
pour atteindre 2 liens entrants en attendant.

## Cannibalisation

Aucune. Le seul recouvrement identifié (contenu existant `essence-vs-electrique-cout-100-km-2026`
sur le mot-clé "coût 100 km électrique essence diesel") est traité comme absorption/upgrade
et non comme un nouvel article, cf. brief `03-cout-100km-electrique-essence-diesel.md`.

## Content Gaps

10 posts actifs planifiés, 4 rédigés (2 publiés + 2 en `draft: true` en
attente de lien affilié) = 6 gaps restants, plus 1 post en attente (hors
calcul de couverture tant qu'il n'est pas réactivé). Ordre de priorité dans
`cluster-plan.md`.

## Cluster D, Assurance et entretien (ajouté le 07/09/2026)

Axe monétisation affiliation, distinct des clusters A/B/C qui restent
purement éditoriaux. 2 spokes rédigés le 07/09/2026 à partir des briefs
`10-assurance-auto-electrique-vs-thermique-prix.md` et
`11-entretien-voiture-electrique-cout-reel.md`, `astro build` vérifié avec
succès (717 pages). Images sourcées sur Wikimedia Commons (créditées dans
chaque article : SEAT Ibiza interior par Joseluismalaga, CC BY-SA 3.0 ;
mécanicien testant une batterie par Nenad Stojković, CC BY 2.0).

**Publiés en `draft: true`** : chaque article contient un encart CTA affilié
avec un placeholder (`<!-- affiliate-link:assurance-comparateur -->` et
`<!-- affiliate-link:entretien-comparateur -->`) en attendant la validation
des programmes Awin/Effiliation (assurance) et Kwanko (entretien), inscrits
le 07/09/2026. **Ne pas passer `draft: false` avant d'avoir remplacé le
placeholder par le vrai lien de tracking.** Les marqueurs
`<!-- cluster-link:cluster-3-post-0 -->` et `<!-- cluster-link:cluster-3-post-1 -->`
sont déjà en place dans le pillar (sections Assurance et Entretien), à
remplacer par de vrais liens dès la publication.

## Prochaines étapes

1. Traiter le WARN de liens entrants sur le quick-win actif (ajout d'un lien depuis un article existant du pillar).
2. Rédiger dans l'ordre de priorité indiqué (quick-win → pillar → cluster A → B → C → D).
3. Après rédaction de chaque post, appliquer l'injection de liens retour (`<!-- cluster-link:ID -->` remplacé par un lien contextuel) vers les posts déjà publiés qui doivent pointer vers lui.
4. Revérifier metaTitle/metaDescription (60/160 car.) et l'absence de tirets longs avant chaque commit, conformément à CLAUDE.md.
5. Réactiver le brief `00-meilleures-applications-essence-moins-chere.md` au lancement de l'application maison.
6. Avant de rédiger les briefs 10 et 11, valider l'inscription aux programmes d'affiliation visés (Awin, Effiliation, Kwanko) et remplacer les placeholders `<!-- affiliate-link:... -->` par les vrais liens de tracking.
