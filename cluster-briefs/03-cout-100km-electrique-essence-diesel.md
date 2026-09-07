# Brief : Coût au 100 km, électrique vs essence vs diesel en 2026

**Priorité d'exécution : 3 (spoke le plus proche du cœur de trafic existant)**
**Rôle : spoke, Cluster A "Coût à l'usage". ⚠️ Article existant à mettre à niveau, pas à dupliquer.**

## Action requise

L'article `src/content/blog/essence-vs-electrique-cout-100-km-2026.md` existe déjà. **Ne pas créer de nouvel article.** Reprendre celui-ci, l'enrichir avec les chiffres ci-dessous, et y ajouter les liens internes vers le nouveau pillar et les spokes soeurs (actuellement l'article est isolé, sans rattachement à une architecture de cluster : impressions actuelles proches de 0 clic sur la période observée en GSC).

## Métadonnées (à revoir sur l'article existant)

- Vérifier le metaTitle et metaDescription actuels avec le script de comptage (limites 60/160 car.)
- **Slug conservé :** `/blog/essence-vs-electrique-cout-100-km-2026/`

## Mots-clés

- **Primaire :** coût 100 km électrique essence diesel
- **Secondaires :** prix km électrique vs essence, combien coûte 100km voiture électrique

## Mise à jour du contenu

- Ajouter un tableau comparatif clair : coût énergie/100km pour essence, diesel, électrique (domicile) et électrique (borne rapide payante). **Hors tableau : pas d'`<AdUnit />` dedans.**
- Intégrer les chiffres 2026 : ~12€/100km essence (6L/100 à 2€/L), 4-5€/100km électrique domicile (17kWh/100 à 0,25€/kWh), usage urbain 2-3€/100km électrique vs 7-9€/100km essence
- Ajouter la section "Ce que ça change sur une année type" (15 000 km/an)

## Liens internes à ajouter

- → Pillar `/piliers/voiture-electrique-ou-thermique-budget/` (ancre : "budget carburant électrique vs thermique")
- → `/blog/recharge-domicile-vs-plein-essence-cout/` (ancre : "coût de la recharge à domicile")
- → `/blog/autonomie-voiture-electrique-hiver-budget/` (ancre : "l'hiver change la donne")
- ← reçoit un lien retour du pillar et des spokes soeurs (à insérer une fois ces pages écrites)

## Rappel règles CLAUDE.md

Aucun tiret cadratin/demi-cadratin. metaTitle/metaDescription à re-vérifier après modification. `<AdUnit />` jamais dans le tableau comparatif.
