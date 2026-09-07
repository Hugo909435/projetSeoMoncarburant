# Brief : Assurance auto électrique vs thermique, quelle différence de prix

**Priorité d'exécution : 10**
**Rôle : spoke, Cluster D "Assurance et entretien" (nouveau, axe monétisation affiliation)**

## Métadonnées

- **Titre (H1) :** Assurance auto électrique ou thermique : quelle différence de prix en 2026 ?
- **metaTitle (≤60 car.) :** `Assurance auto électrique vs thermique : prix 2026` (50 car.)
- **metaDescription (≤160 car.) :** `Assurance électrique ou thermique, qui coûte le plus cher en 2026 ? Écarts de prix, facteurs qui jouent et astuce pour payer moins cher.` (136 car.)
- **Slug :** `/blog/assurance-auto-electrique-vs-thermique-prix/`
- **Template :** comparison
- **Word count cible :** 1400 mots

## Mots-clés

- **Primaire :** assurance auto électrique vs thermique
- **Secondaires :** prix assurance voiture électrique, assurance auto électrique plus chère, différence assurance électrique essence

## Concurrence identifiée

Contenus de blog LeLynx, LesFurets, Assurland, Hyperassur : bien positionnés mais souvent en angle pur "fiche produit assurance", sans lien avec le coût carburant/énergie global. **Différenciation :** rattacher explicitement l'écart de prime au budget total de possession déjà traité par le pillar (carburant/énergie + assurance + entretien), angle que ces comparateurs ne couvrent pas.

## Structure (H2/H3)

1. **Pourquoi l'assurance électrique n'a pas le même tarif** (coût de réparation des pièces, batterie, pare-chocs, main-d'œuvre spécialisée)
2. **Comparatif chiffré** (tableau : prime moyenne annuelle citadine/berline/SUV, électrique vs essence vs diesel)
3. **Les facteurs qui font vraiment varier le prix** (puissance fiscale, bonus-malus, zone géographique, valeur à neuf, formule tiers/tous risques)
4. **Comment réduire sa prime** (comparer plusieurs devis, ajuster la franchise, options utiles vs superflues pour un véhicule électrique)
5. **Comparer son assurance auto** (CTA comparateur affilié, hors tableau, cf. section dédiée ci-dessous)
6. **Ce que ça change sur le budget total** (renvoi vers le pillar coût de possession)

## Liens internes obligatoires

- → Pillar `/piliers/voiture-electrique-ou-thermique-budget/` (ancre : "budget carburant électrique vs thermique")
- → `/blog/essence-vs-electrique-cout-100-km-2026/` (ancre : "coût au 100 km électrique vs essence")
- Cross-cluster (0-1 lien) → `/blog/entretien-voiture-electrique-cout-reel/` (ancre : "coût d'entretien réel")

## Intégration affiliation (nouveau, spécifique à ce cluster)

- **Programme visé :** LeLynx ou LesFurets (réseau Awin), Hyperassur ou Assurland (Effiliation) en solution de repli si non validés à temps.
- **Emplacement du CTA :** encart après la section 4 ("Comment réduire sa prime"), jamais dans le tableau comparatif de la section 2. Format : bloc distinct entre deux `<section>`, même règle de placement que `<AdUnit />`.
- **Mention obligatoire :** le lien affilié doit être identifié comme lien commercial/partenaire dans le texte au moment du clic (ex. "lien partenaire" à côté du bouton), exigence de transparence à respecter avant publication, indépendamment des règles CLAUDE.md existantes.
- **Ne pas publier le lien affilié tant que le programme n'est pas validé** : rédiger l'article avec un placeholder `<!-- affiliate-link:assurance-comparateur -->` à remplacer une fois l'inscription Awin/Effiliation confirmée.

## Points de vigilance

- Chiffres de primes moyennes à indiquer comme des ordres de grandeur ("en moyenne", "selon les profils"), jamais comme un prix garanti, l'assurance dépend du profil conducteur.
- Ne pas confondre avec le spoke entretien (cluster distinct, sujet différent).
- Dater la mise à jour des tarifs dans le frontmatter (`updatedAt`), les primes évoluent.

## Rappel règles CLAUDE.md

Aucun tiret cadratin/demi-cadratin. Chiffres et plages en euros avec trait d'union simple (ex. "800-1200 €/an"). Vérifier metaTitle/metaDescription. `<AdUnit />` et l'encart affilié jamais dans le tableau comparatif.
