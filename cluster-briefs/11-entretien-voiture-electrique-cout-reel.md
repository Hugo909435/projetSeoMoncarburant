# Brief : Entretien voiture électrique, le coût réel

**Priorité d'exécution : 11**
**Rôle : spoke, Cluster D "Assurance et entretien" (nouveau, axe monétisation affiliation)**

## Métadonnées

- **Titre (H1) :** Entretien voiture électrique : combien ça coûte vraiment en 2026 ?
- **metaTitle (≤60 car.) :** `Entretien voiture électrique : le coût réel en 2026` (51 car.)
- **metaDescription (≤160 car.) :** `Entretien voiture électrique en 2026 : ce qui disparaît, ce qui reste, le coût de la batterie hors garantie et le comparatif avec l'essence.` (140 car.)
- **Slug :** `/blog/entretien-voiture-electrique-cout-reel/`
- **Template :** explainer
- **Word count cible :** 1400 mots

## Mots-clés

- **Primaire :** entretien voiture électrique coût
- **Secondaires :** entretien électrique vs thermique, révision voiture électrique prix, coût batterie remplacement

## Concurrence identifiée

Sipa Automobiles, go-electra, iautos couvrent déjà l'angle général électrique vs thermique mais peu de contenu dédié spécifiquement au poste "entretien" avec chiffres à jour. **Différenciation :** angle chiffré et concret (ce qui disparaît vs ce qui reste), plus rattachement au pillar coût total.

## Structure (H2/H3)

1. **Ce qui disparaît avec l'électrique** (vidange, courroie de distribution, embrayage, filtre à carburant, pot d'échappement)
2. **Ce qui reste, et parfois coûte plus** (pneus, usure liée au poids et au couple immédiat, liquide de refroidissement batterie)
3. **Le frein régénératif change la donne** (plaquettes de frein qui durent plus longtemps, économie chiffrée)
4. **Comparatif chiffré du coût d'entretien annuel** (tableau : électrique vs essence vs diesel sur 15 000 km/an)
5. **Le coût caché : la batterie** (durée de garantie constructeur type 8 ans/160 000 km, prix de remplacement hors garantie, probabilité réelle du scénario)
6. **Trouver un entretien moins cher** (CTA comparateur de garages affilié, hors tableau)
7. **Ce que ça change sur le budget total** (renvoi vers le pillar)

## Liens internes obligatoires

- → Pillar `/piliers/voiture-electrique-ou-thermique-budget/` (ancre : "budget carburant électrique vs thermique")
- → `/blog/assurance-auto-electrique-vs-thermique-prix/` (ancre : "l'assurance coûte aussi différemment")
- Cross-cluster (0-1 lien) → `/blog/essence-vs-electrique-cout-100-km-2026/` (ancre : "coût au 100 km")

## Intégration affiliation (nouveau, spécifique à ce cluster)

- **Programme visé :** idGarages (Kwanko) ou Vroomly, rémunération au rendez-vous pris (CPA).
- **Emplacement du CTA :** encart après la section 6 ("Trouver un entretien moins cher"), jamais dans le tableau comparatif de la section 4. Bloc distinct entre deux `<section>`, même règle que `<AdUnit />`.
- **Mention obligatoire :** identifier le lien comme partenaire/commercial au moment du clic, même exigence de transparence que sur le spoke assurance.
- **Placeholder en attendant la validation du programme :** `<!-- affiliate-link:entretien-comparateur -->`.

## Points de vigilance

- Le prix de remplacement de la batterie doit être présenté comme un scénario rare sous garantie, pas comme un risque alarmiste, éviter tout ton anxiogène qui nuirait à la crédibilité de l'article.
- Ne pas dupliquer le contenu déjà couvert dans le cluster A "Coût à l'usage" (qui traite l'énergie, pas l'entretien mécanique).
- Dater les montants de garantie constructeur dans le frontmatter (`updatedAt`), ces politiques évoluent.

## Rappel règles CLAUDE.md

Aucun tiret cadratin/demi-cadratin. Chiffres et plages en euros avec trait d'union simple. Vérifier metaTitle/metaDescription. `<AdUnit />` et l'encart affilié jamais dans le tableau comparatif.
