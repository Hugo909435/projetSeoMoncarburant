# Déploiement des pages station

Note de référence pour la mise en ligne progressive des fiches station-service
de mon-carburant.com.

Dernière mise à jour du document : 4 août 2026.
Cadence en vigueur : montée en charge 100 puis 250, 500 et 800 (24 vagues).

---

## 1. En une minute

Le site connaît 9 803 stations-service. Chacune a désormais sa page détaillée
(prix des six carburants, comparaison avec la commune, le département et la
France, répartition par enseigne, carte, horaires, services, stations proches,
texte court, FAQ, données structurées).

Ces pages ne sont **pas** publiées d'un coup. Elles sortent par vagues, une
**toutes les deux semaines**, à partir du **lundi 10 août 2026**. La taille des
vagues monte progressivement : **100 pages** pendant les trois premiers mois,
puis 250, 500 et 800 une fois l'indexation vérifiée. **24 vagues au total, la
dernière le 28 juin 2027.**

Le mécanisme est automatique. Le site est déjà reconstruit tous les jours pour
rafraîchir les prix : le jour où une vague arrive à échéance, ce rebuild
quotidien génère les nouvelles pages et les déploie. **Il n'y a rien à faire à
chaque vague.**

---

## 2. Pourquoi par vagues

Publier 9 800 pages en une fois est le scénario type qui déclenche une
dévaluation de la part de Google. Trois raisons concrètes :

1. **Budget de crawl.** Google alloue à chaque site un volume de pages qu'il
   explore par jour. Un site qui décuple brutalement son nombre d'URL voit son
   exploration s'étaler sur des mois, avec une part importante de pages
   découvertes mais jamais indexées.
2. **Évaluation qualité.** Une arrivée massive de pages construites sur le même
   gabarit est le signal caractéristique du contenu généré à grande échelle.
   Depuis les mises à jour anti spam de 2024, ce motif peut entraîner une
   sanction au niveau du site entier, pas seulement des pages concernées.
3. **Impossibilité de corriger.** Avec tout en ligne d'un coup, un défaut du
   gabarit se propage à 9 800 pages avant d'être détecté. Par vagues, un
   problème repéré sur la vague 3 se corrige avant que la vague 4 ne sorte.

D'où la montée en charge par paliers plutôt qu'un rythme constant : on commence
assez lentement pour pouvoir corriger, et on accélère une fois que les chiffres
d'indexation montrent que le gabarit passe.

---

## 3. Le calendrier

Une vague tous les 14 jours, départ le 10 août 2026. Les colonnes « Dépts » et
« Communes » montrent l'étalement géographique réel de chaque lot.

| Vague | Date | Pages | Dépts | Communes | Cumul | Couverture |
|---|---|---|---|---|---|---|
| 1 | 10/08/2026 | 100 | 25 | 28 | 100 | 1 % |
| 2 | 24/08/2026 | 100 | 31 | 33 | 200 | 2 % |
| 3 | 07/09/2026 | 100 | 33 | 42 | 300 | 3 % |
| 4 | 21/09/2026 | 100 | 46 | 52 | 400 | 4 % |
| 5 | 05/10/2026 | 100 | 41 | 59 | 500 | 5 % |
| 6 | 19/10/2026 | 100 | 47 | 61 | 600 | 6 % |
| 7 | 02/11/2026 | 250 | 63 | 115 | 850 | 9 % |
| 8 | 16/11/2026 | 250 | 64 | 118 | 1 100 | 11 % |
| 9 | 30/11/2026 | 250 | 75 | 184 | 1 350 | 14 % |
| 10 | 14/12/2026 | 250 | 79 | 232 | 1 600 | 16 % |
| 11 | 28/12/2026 | 250 | 79 | 225 | 1 850 | 19 % |
| 12 | 11/01/2027 | 250 | 77 | 241 | 2 100 | 21 % |
| 13 | 25/01/2027 | 500 | 88 | 464 | 2 600 | 27 % |
| 14 | 08/02/2027 | 500 | 90 | 474 | 3 100 | 32 % |
| 15 | 22/02/2027 | 500 | 91 | 471 | 3 600 | 37 % |
| 16 | 08/03/2027 | 500 | 93 | 475 | 4 100 | 42 % |
| 17 | 22/03/2027 | 500 | 91 | 486 | 4 600 | 47 % |
| 18 | 05/04/2027 | 500 | 91 | 483 | 5 100 | 52 % |
| 19 | 19/04/2027 | 800 | 94 | 746 | 5 900 | 60 % |
| 20 | 03/05/2027 | 800 | 95 | 774 | 6 700 | 68 % |
| 21 | 17/05/2027 | 800 | 94 | 769 | 7 500 | 77 % |
| 22 | 31/05/2027 | 800 | 92 | 777 | 8 300 | 85 % |
| 23 | 14/06/2027 | 800 | 95 | 773 | 9 100 | 93 % |
| 24 | 28/06/2027 | 703 | 95 | 692 | 9 803 | 100 % |

**Fin du déploiement : 28 juin 2027, soit 10 mois et demi.**

Les six premières vagues restent volontairement à 100 pages. C'est la phase où
l'on ne sait pas encore comment Google accueille le gabarit, et où une erreur se
paie cher. À partir de la vague 7 (2 novembre 2026), la cadence monte.

Pour réafficher ce calendrier à tout moment :

```bash
npm run waves:plan
```

### Le point de décision du 21 septembre 2026

L'accélération est **inscrite dans le plan**, elle se déclenchera donc toute
seule. La vérification après la vague 4 n'est plus un feu vert à donner mais un
frein à actionner si besoin :

- **Vague 4 le 21 septembre 2026**, 400 pages en ligne.
- **Premier lot à 250 le 2 novembre 2026.** Six semaines de marge pour regarder
  les chiffres et réagir.
- Si moins de 70 % des 400 pages sont indexées à cette date, ou si une alerte
  qualité remonte, **freiner** : voir le point 6 pour repousser les paliers, ou
  le point 9 pour geler complètement.

## 4. Ce qui se passe automatiquement

| Quand | Quoi | Qui |
|---|---|---|
| Toutes les 3 h | Récupération du flux gouvernemental, recalcul des prix | `.github/workflows/update-fuel-data.yml` |
| Idem | Affectation des stations nouvellement apparues à une vague future | `scripts/build-station-waves.js` |
| Idem | Bascule des vagues arrivées à échéance à l'état publié | idem |
| Si les données ont changé | Commit, puis build et déploiement FTP vers Hostinger | `deploy-hostinger.yml` |

Le jour d'une vague, le fichier `station-waves.json` change (le drapeau
`published` bascule), ce qui garantit qu'un déploiement part ce jour-là même si
les prix n'ont pas bougé.

**Aucune intervention manuelle n'est requise pour publier une vague.**

---

## 5. Comment c'est construit

### Fichiers

| Fichier | Rôle |
|---|---|
| `scripts/build-station-waves.js` | Calcule le plan de déploiement. Idempotent. |
| `src/data/fuel/station-waves.json` | Le calendrier. Source de vérité, versionné dans git. |
| `src/data/fuel/stations-detail/*.json` | Services et horaires par station (non servis au navigateur). |
| `src/data/fuel/city-names.json` | Noms de communes remis en casse correcte. |
| `src/utils/station-waves.ts` | Décide ce qui est publié à la date du build. |
| `src/utils/station-intro.ts` | Génère le texte et la FAQ de chaque page. |
| `src/utils/station-hours.ts` | Décode les horaires, produit le `openingHoursSpecification`. |
| `src/pages/prix-carburants/station/[city]/[station].astro` | La page. |
| `src/pages/prix-carburants/stations/[...page].astro` | L'annuaire paginé des fiches publiées. |
| `src/components/StationLink.astro` | Lien vers une fiche, inactif si la vague n'est pas sortie. |
| `src/components/BrandCell.astro` | Cellule enseigne du tableau de répartition. |
| `src/utils/station-quality.mjs` | Règle de noindex des fiches trop pauvres (point 6 bis). |

### Structure des URL

```
/prix-carburants/station/{commune}/{enseigne}-{adresse}-{identifiant}/
```

Exemple : `/prix-carburants/station/nimes/leclerc-route-de-beaucaire-30000008/`

L'identifiant en fin de chaîne est celui du fichier gouvernemental. Il garantit
l'unicité même pour deux stations de la même enseigne dans la même rue.

### Deux garanties du planificateur

1. **Une station ne change jamais de vague.** Le script relit le plan existant
   et n'affecte que les stations qui n'en ont pas encore. Une page publiée ne
   peut pas disparaître au rebuild suivant.
2. **L'URL est gelée à l'affectation.** Le chemin est calculé une fois puis
   recopié tel quel. Si l'open data corrige l'orthographe d'une adresse ou si le
   mapping d'enseigne évolue, l'URL déjà indexée ne bouge pas.

Une vague déjà publiée n'accepte plus de nouvelle station : les stations qui
apparaissent dans l'open data après coup vont dans la première vague à venir qui
a de la place. Une station qui disparaît du flux garde son affectation et son
URL, sa page cesse simplement d'être générée.

La conséquence de la garantie n°1 mérite d'être explicite : **une fois le plan
écrit, modifier `WAVE_PLAN` ne change rien**, puisque toutes les stations sont
déjà affectées. Changer de cadence passe obligatoirement par `--replan`, décrit
au point 6.

### Ordre de publication

Les stations sont classées par potentiel décroissant. Le score combine :

- le poids démographique de la commune (population pour les 168 villes de
  `top-cities.json`, nombre de stations de la commune ailleurs) ;
- la richesse des données affichables : nombre de carburants cotés, enseigne
  identifiée, adresse exploitable, services et horaires déclarés ;
- un bonus pour les stations d'autoroute, qui captent des requêtes propres ;
- un bonus de fraîcheur pour les stations qui déclarent régulièrement leurs prix.

Deux plafonds de diversité s'appliquent **par vague**, exprimés en part du lot :
6 % maximum pour une même commune, 12 % pour un même département. Sur une vague
de 100, cela fait 6 et 12 ; sur une vague de 800, 48 et 96. Sans eux, la vague 1
serait presque entièrement parisienne et lyonnaise, les pages se
cannibaliseraient entre elles et concurrenceraient la page ville existante.

Le résultat figure dans les colonnes « Dépts » et « Communes » du calendrier :
25 départements dès la vague 1, et plus de 90 départements pour 700 à 780
communes sur les grosses vagues.

---

## 6. Changer la cadence

Tout se règle dans `scripts/build-station-waves.js`, en haut du fichier.

```js
const INTERVAL_DAYS = 14;

const WAVE_PLAN = [
  { fromWave: 1, size: 100 },  // vagues 1 à 6, prudence initiale
  { fromWave: 7, size: 250 },  // vagues 7 à 12
  { fromWave: 13, size: 500 }, // vagues 13 à 18
  { fromWave: 19, size: 800 }, // vagues 19 et suivantes
];
```

`WAVE_PLAN` fonctionne par paliers : chaque entrée s'applique à partir de la
vague indiquée, jusqu'au palier suivant.

### Le piège à connaître

Modifier `WAVE_PLAN` puis relancer `npm run waves` **ne fait rien**. Le script
est idempotent par construction : il n'affecte que les stations qui n'ont pas
encore de vague, et à ce stade elles en ont toutes une. C'est précisément ce qui
protège les pages en ligne, mais cela veut dire qu'un changement de cadence
demande une commande différente.

### Appliquer un nouveau plan

```bash
npm run waves:replan:plan   # simulation, n'écrit rien
npm run waves:replan        # applique
```

`--replan` gèle les stations des vagues **déjà publiées** (vague et URL
inchangées) et redistribue toutes les autres selon le nouveau plan. C'est
l'unique manière de changer de cadence en cours de route sans toucher à ce qui
est en ligne.

Le script affiche ce qu'il fait avant d'écrire :

```
♻️  Replanification : 600 station(s) figée(s) (vagues 1 à 6, déjà publiées), 9203 redistribuée(s).
```

Vérifier ce nombre de stations figées : il doit correspondre au cumul des vagues
déjà sorties. S'il vaut 0 alors que des pages sont en ligne, ne pas écrire.

### Freiner

Repousser les paliers suffit, par exemple pour rester à 100 pendant six mois de
plus :

```js
const WAVE_PLAN = [
  { fromWave: 1, size: 100 },
  { fromWave: 19, size: 250 },
  { fromWave: 25, size: 500 },
  { fromWave: 31, size: 800 },
];
```

Puis `npm run waves:replan`. Les vagues déjà sorties ne bougent pas.

### Ce à quoi ne pas toucher

`INTERVAL_DAYS` et `startDate` décalent **toutes** les dates, y compris celles
de vagues déjà publiées. Allonger l'intervalle après coup peut faire repasser
une vague publiée à l'état non publié et retirer ses pages du site. Pour
suspendre, utiliser `FREEZE_AT_WAVE` (point 9), pas l'intervalle.

## 6 bis. Garde-fous qualité

Deux réglages limitent le risque que ces pages soient perçues comme du contenu
produit en série. Ils comptent davantage que la cadence.

### Les fiches trop pauvres ne sont pas indexées

Toutes les stations ont une page, elle reste utile à qui cherche cette adresse.
Mais **563 fiches (5,7 % du parc) sont rendues en `noindex` et exclues du
sitemap**, parce qu'elles n'ont pas de quoi tenir debout :

| Critère | Effet |
|---|---|
| Moins de 2 carburants cotés | noindex |
| Adresse inexploitable (moins de 5 caractères) | noindex |
| Dernière déclaration de prix vieille de plus de 90 jours | noindex |

La règle vit dans `src/utils/station-quality.mjs`, importée à la fois par la
page et par `astro.config.mjs`. Une seule définition, donc pas de risque qu'une
page soit `noindex` tout en restant au sitemap. Le build affiche le compte :

```
[sitemap] 563 fiche(s) station exclue(s) : données insuffisantes.
```

Ces fiches affichent en outre un encart avertissant le visiteur que la donnée
est incomplète ou ancienne, avec le motif exact.

Pour durcir ou assouplir, modifier `MIN_FUELS` et `STALE_DAYS` dans ce fichier.

### Le texte est volontairement court

Environ **120 mots** par fiche, pas 300. La page porte déjà une grille de prix,
un comparatif, un classement, un tableau d'enseignes, des horaires, une liste de
services et les stations proches. Paraphraser ces blocs en prose gonflerait le
compteur de mots sans rien apprendre à personne, et c'est précisément ce qui
donne à une page l'allure du contenu généré en série.

Le texte sert donc à interpréter, pas à répéter : ce que l'écart de prix
représente sur un plein de 50 litres, ce que le type d'enseigne implique, ce
qu'il faut vérifier sur place.

Mesure de la répétition sur les 9 803 fiches générées, avant et après ce
resserrage :

| | Avant | Après |
|---|---|---|
| Mots par fiche (moyenne) | 262 | 119 |
| Tournure la plus répandue | 98 % des fiches | 33 % |

Les 33 % restants correspondent à une clause factuelle courte (« l'écart avec la
moyenne nationale est de X % »), difficilement reformulable et sans enjeu.

---

## 7. Points de contrôle

À faire dans la Search Console, deux ou trois jours après chaque vague au début,
puis une fois par mois en régime de croisière.

**Couverture et indexation**

- `Pages > Indexation` : le nombre de pages indexées doit progresser à peu près
  au rythme des vagues. Un décrochage net signale un problème de gabarit.
- Motifs à surveiller : « Détectée, actuellement non indexée » et « Explorée,
  actuellement non indexée ». Quelques pour cent sont normaux. **Au-delà de 30 %
  d'un lot, arrêter d'accélérer** et regarder pourquoi avant d'envoyer la suite.

**Qualité**

- `Expérience > Core Web Vitals` : les pages station embarquent une carte en
  iframe chargée en différé, elles ne devraient pas dégrader le LCP. À vérifier
  après la vague 1.
- `Améliorations > FAQ` et données structurées : les pages déclarent
  `GasStation`, `BreadcrumbList` et `FAQPage`. Vérifier l'absence d'erreurs
  bloquantes avec l'outil de test des résultats enrichis.

**Trafic**

- Filtrer les performances sur les URL contenant `/prix-carburants/station/`
  pour isoler l'apport réel de ces pages.
- Le bon indicateur au début n'est pas le trafic mais le **nombre d'URL qui
  génèrent au moins une impression**. Il doit croître avec les vagues.

**Rythme des vérifications**

L'accélération étant automatique, la surveillance compte plus que dans un plan à
cadence constante. Trois rendez-vous à ne pas manquer :

| Date | Vagues sorties | Pages | À vérifier |
|---|---|---|---|
| 21/09/2026 | 1 à 4 | 400 | Taux d'indexation. En dessous de 70 %, freiner avant le 2 novembre. |
| 30/11/2026 | 1 à 9 | 1 350 | Le passage à 250 a-t-il tenu ? Freiner avant le 25 janvier si non. |
| 05/04/2027 | 1 à 18 | 5 100 | Dernier point avant les vagues à 800. |

Entre ces rendez-vous, un coup d'œil mensuel à la courbe d'indexation suffit.

---

## 8. Prévisualiser et tester

```bash
# Voir le plan sans rien écrire
npm run waves:plan

# Générer le site à une date simulée (utile pour voir la vague suivante)
STATIONS_ROLLOUT_DATE=2027-03-01 npx astro build

# Générer les 9 804 fiches d'un coup, en local uniquement,
# pour relire le gabarit sur des stations de toutes tailles
npm run preview:stations
```

`STATIONS_ROLLOUT_ALL=1` ne doit **jamais** être positionné sur le build de
production : c'est exactement la publication massive que ce système évite.

---

## 9. Procédure d'arrêt

Si un problème sérieux est constaté sur les pages station (pénalité, erreur de
gabarit à grande échelle) :

Tout passe par une seule constante, `FREEZE_AT_WAVE`, en haut de
`src/utils/station-waves.ts` :

```ts
const FREEZE_AT_WAVE: number | null = null;
```

| Valeur | Effet |
|---|---|
| `null` | Déploiement normal, piloté par le calendrier. |
| `4` | Les vagues 1 à 4 restent en ligne, aucune nouvelle ne sort. |
| `0` | Toutes les pages station sont retirées au prochain build. |

Un gel ne touche pas à `station-waves.json` : le calendrier reste intact et le
déploiement reprend exactement où il s'était arrêté dès que la valeur repasse à
`null`. Les vagues dont la date est passée pendant le gel sortent alors d'un
coup, penser à remonter `FREEZE_AT_WAVE` progressivement plutôt qu'à le remettre
à `null` d'un seul geste après un gel long.

**Si des pages déjà indexées sont retirées**, prévoir des redirections 301 vers
la page ville correspondante dans `astro.config.mjs`. Un 404 en masse est un
signal négatif.

---

## 10. Limites connues

- **Fiabilité des prix.** Les tarifs viennent des déclarations des gérants. Un
  décalage de quelques heures avec le prix réel est possible. La date de
  dernière déclaration est affichée sur chaque fiche, et une station qui ne
  déclare plus depuis 90 jours passe automatiquement en noindex (point 6 bis).
- **Noms de communes.** Un tiers du parc arrive en majuscules dans l'open data,
  parfois sans accents. `city-names.json` reconstitue la meilleure graphie
  disponible en croisant les variantes, mais une commune dont aucune station
  n'écrit correctement le nom reste approximative (par exemple « Montreal du
  Gers » au lieu de « Montréal-du-Gers »). Un référentiel INSEE des communes
  corrigerait ce point définitivement.
- **Horaires.** Environ 4 100 stations sur 9 800 déclarent leurs horaires. Les
  autres n'affichent pas de bloc horaires, ce qui est préférable à une
  information inventée.
- **Pages ville existantes.** Les tableaux des pages ville et département
  affichent toujours les noms de communes bruts de l'open data. Le référentiel
  `city-names.json` pourrait y être branché, ce n'est pas fait à ce stade pour
  ne pas modifier le contenu de pages déjà indexées sans décision explicite.
