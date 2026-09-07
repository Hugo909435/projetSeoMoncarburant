# Brief : PILLAR, Voiture électrique ou thermique, quel budget carburant/énergie réel en 2026

**Priorité d'exécution : 2 (le hub doit exister avant que les spokes ne puissent y linker)**
**Rôle : pillar (nouveau)**

## Métadonnées

- **Titre (H1) :** Voiture électrique ou thermique : quel budget carburant/énergie réel en 2026
- **metaTitle (≤60 car.) :** `Électrique ou thermique : le vrai budget carburant 2026` (56 car.)
- **metaDescription (≤160 car.) :** `Coût au km, aides à l'achat, ZFE : le guide complet pour comparer le budget réel d'une voiture électrique et d'une thermique en 2026, chiffres à l'appui.` (157 car.)
- **Slug :** `/piliers/voiture-electrique-ou-thermique-budget/`
- **Template :** ultimate-guide
- **Word count cible :** 3500 mots

## Mots-clés

- **Primaire :** voiture électrique ou essence
- **Secondaires :** électrique vs thermique coût, budget voiture électrique 2026, quel carburant choisir 2026

## Concurrence identifiée

Sipa Automobiles, go-electra.com, iautos.fr, monkitenergie.fr, Bornetik IDF. Le marché est occupé par des sites auto généralistes qui traitent le sujet une fois puis passent à autre chose. **Différenciation :** mon-carburant.com apporte des données de prix carburant en temps réel (comparateur) pour chiffrer précisément le "coût thermique" du comparatif, ce qu'aucun concurrent généraliste ne fait avec la même fraîcheur de données.

## Structure (H2/H3)

1. **Introduction : la question que tout le monde se pose avant d'acheter**
2. **Le coût à l'usage, poste par poste**
   - Carburant vs électricité au 100 km (renvoi vers spoke dédié)
   - Recharge à domicile vs plein d'essence (renvoi spoke)
   - Ce qui change en hiver (renvoi spoke)
3. **Les aides à l'achat en 2026**
   - Bonus écologique (renvoi spoke)
   - Prime à la conversion, statut réel en 2026 (renvoi spoke)
4. **La réglementation qui accélère (ou pas) la bascule**
   - ZFE et Crit'Air (renvoi spoke)
   - Faut-il anticiper l'interdiction du thermique (renvoi spoke)
5. **Entretien et fiabilité comparés** (section propre au pillar, non dupliquée dans un spoke : citer le chiffre ADEME "budget entretien électrique 30% inférieur")
6. **Assurance : l'angle mort souvent oublié** (électrique 9-16% plus cher à assurer, source recherche)
7. **Notre verdict chiffré selon les profils** (urbain/quotidien vs longue distance/rural)
8. Table des matières + FAQ (schema Article + BreadcrumbList + ItemList listant les 7 spokes)

## Liens internes obligatoires (sortants, vers CHAQUE spoke)

| Spoke | Ancre suggérée |
|---|---|
| Coût au 100 km électrique vs essence vs diesel | "coût au 100 km électrique vs essence" |
| Recharge domicile vs plein d'essence | "recharge à domicile vs plein d'essence" |
| Autonomie hiver | "autonomie en hiver" |
| Bonus écologique 2026 | "bonus écologique 2026" |
| Prime à la conversion 2026 | "prime à la conversion" |
| ZFE et Crit'Air 2026 | "ZFE et Crit'Air 2026" |
| Passer à l'électrique avant l'interdiction | "passer à l'électrique avant l'interdiction" |

## Points clés à couvrir (chiffres de session, à revérifier à date de rédaction)

- Coût énergie : ~12€/100km essence (6L/100 à 2€/L) vs 4-5€/100km électrique (17kWh/100 à 0,25€/kWh domicile)
- Usage urbain/péri-urbain avec recharge domicile : 2-3€/100km électrique vs 7-9€/100km essence
- Assurance : électrique 793-818€/an en moyenne vs 684-753€ essence (+9 à 16%)
- Entretien : -30% pour l'électrique (ADEME)
- CO2 cycle de vie : ~12t électrique vs ~24t essence

## Rappel règles CLAUDE.md

Aucun tiret cadratin/demi-cadratin : remplacer par virgules, parenthèses ou deux-points. Plages de chiffres en trait d'union simple ("2,10-2,40 €/L"). Vérifier metaTitle (60 car. max) et metaDescription (160 car. max) avant commit. Si des `<AdUnit />` sont insérés, jamais à l'intérieur d'un `<table>`.
