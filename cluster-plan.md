# Plan de diversification, mon-carburant.com

Objectif : sortir de la dépendance au "prix coûtant" (trafic cyclique lié à l'actu)
en développant un axe évergreen à fort volume. Contexte complet et carte interactive :
voir l'artifact "Hors Prix Coûtant" publié en session.

## 1. Renforcer le pillar existant "reduire-facture-carburant"

- **Faut-il une application pour trouver l'essence la moins chère ?** (explainer, 1300 mots). **🛑 EN ATTENTE**, publication reportée au lancement de l'application maison, cf. `cluster-briefs/00-...md`
- **Quel jour faire le plein pour payer moins cher ?** (how-to, 1200 mots), à rédiger en premier

## 2. Nouveau pillar : "Voiture électrique ou thermique : quel budget carburant/énergie réel en 2026"

### Cluster A, Coût à l'usage
1. Coût au 100 km : électrique vs essence vs diesel en 2026 *(existant, à upgrader, pas dupliquer)*
2. Recharge à domicile vs plein d'essence : combien ça coûte vraiment
3. Autonomie voiture électrique en hiver : ce qui change pour le budget

### Cluster B, Aides et fiscalité
1. Bonus écologique 2026 : montants et conditions
2. Prime à la conversion en 2026 : ce qui reste vraiment disponible

### Cluster C, Réglementation et transition
1. ZFE et Crit'Air 2026 : quelles voitures essence/diesel sont concernées
2. Faut-il passer à l'électrique avant l'interdiction du thermique ?

### Cluster D, Assurance et entretien (axe monétisation affiliation)
1. Assurance auto électrique vs thermique : quelle différence de prix
2. Entretien voiture électrique : ce que ça coûte vraiment

## Statut d'exécution

Briefs de contenu détaillés générés dans `cluster-briefs/` (claude-blog non installé,
génération de briefs au lieu de la rédaction automatique). Ordre de priorité :

1. Meilleur jour pour faire le plein *(quick-win)*
2. Pillar électrique vs thermique *(doit exister avant les spokes)*
3. Coût au 100 km *(existant à upgrader)*
4. Recharge domicile vs plein d'essence
5. Autonomie hiver
6. Bonus écologique 2026
7. Prime à la conversion 2026
8. ZFE et Crit'Air 2026
9. Passer à l'électrique avant l'interdiction
10. Assurance auto électrique vs thermique *(axe monétisation affiliation)*
11. Entretien voiture électrique *(axe monétisation affiliation)*

**En attente (hors ordre) :** Faut-il une application pour trouver l'essence la
moins chère, reporté au lancement de l'application maison.

**Cluster D** ajouté le 07/09/2026 en complément de l'objectif de monétisation
(1000 €/mois de revenus), en ciblant l'affiliation assurance/entretien plutôt
que l'AdSense seul, qui plafonne à faible trafic. Programmes visés : LeLynx/
LesFurets/Hyperassur (assurance), idGarages/Vroomly (entretien). Les liens
affiliés restent hors des tableaux comparatifs (même règle que `<AdUnit />`)
et doivent être identifiés comme liens partenaires au clic.

Détail machine-readable : `cluster-plan.json`. Scorecard structurel : `cluster-scorecard.md`.
