# Déploiement des pages station

Note de référence pour la mise en ligne progressive des fiches station-service
de mon-carburant.com.

Dernière mise à jour du document : 4 août 2026.

---

## 1. En une minute

Le site connaît 9 804 stations-service. Chacune a désormais sa page détaillée
(prix des six carburants, comparaison avec la commune, le département et la
France, carte, horaires, services, texte de 250 à 350 mots, FAQ, données
structurées).

Ces pages ne sont **pas** publiées d'un coup. Elles sortent par **vagues de 100,
toutes les deux semaines**, à partir du **lundi 10 août 2026**.

Le mécanisme est automatique. Le site est déjà reconstruit tous les jours pour
rafraîchir les prix : le jour où une vague arrive à échéance, ce rebuild
quotidien génère les 100 nouvelles pages et les déploie. **Il n'y a rien à faire
à chaque vague.**

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

Le rythme choisi est volontairement prudent. Il permet de mesurer le taux
d'indexation réel de chaque lot dans la Search Console avant d'envoyer le
suivant.

---

## 3. Le calendrier

Une vague tous les 14 jours, 100 pages par vague, départ le 10 août 2026.

| Trimestre | Vagues | Période | Pages du trimestre | Cumul | Couverture |
|---|---|---|---|---|---|
| 3e trim. 2026 | 1 à 4 | 10/08 au 21/09/2026 | 400 | 400 | 4 % |
| 4e trim. 2026 | 5 à 11 | 05/10 au 28/12/2026 | 700 | 1 100 | 11 % |
| 1er trim. 2027 | 12 à 17 | 11/01 au 22/03/2027 | 600 | 1 700 | 17 % |
| 2e trim. 2027 | 18 à 24 | 05/04 au 28/06/2027 | 700 | 2 400 | 24 % |
| 3e trim. 2027 | 25 à 30 | 12/07 au 20/09/2027 | 600 | 3 000 | 31 % |
| 4e trim. 2027 | 31 à 37 | 04/10 au 27/12/2027 | 700 | 3 700 | 38 % |
| 1er trim. 2028 | 38 à 43 | 10/01 au 20/03/2028 | 600 | 4 300 | 44 % |
| 2e trim. 2028 | 44 à 50 | 03/04 au 26/06/2028 | 700 | 5 000 | 51 % |
| 3e trim. 2028 | 51 à 56 | 10/07 au 18/09/2028 | 600 | 5 600 | 57 % |
| 4e trim. 2028 | 57 à 63 | 02/10 au 25/12/2028 | 700 | 6 300 | 64 % |
| 1er trim. 2029 | 64 à 69 | 08/01 au 19/03/2029 | 600 | 6 900 | 70 % |
| 2e trim. 2029 | 70 à 76 | 02/04 au 25/06/2029 | 700 | 7 600 | 78 % |
| 3e trim. 2029 | 77 à 82 | 09/07 au 17/09/2029 | 600 | 8 200 | 84 % |
| 4e trim. 2029 | 83 à 89 | 01/10 au 24/12/2029 | 700 | 8 900 | 91 % |
| 1er trim. 2030 | 90 à 95 | 07/01 au 18/03/2030 | 600 | 9 500 | 97 % |
| 2e trim. 2030 | 96 à 99 | 01/04 au 13/05/2030 | 304 | 9 804 | 100 % |

**Fin du déploiement : 13 mai 2030, soit 3 ans et 9 mois.**

Le calendrier exact, vague par vague, est dans
`src/data/fuel/station-waves.json` (champ `waves`). Pour l'afficher :

```bash
node -e "const w=require('./src/data/fuel/station-waves.json'); \
  w.waves.forEach(v=>console.log('Vague '+String(v.n).padStart(2)+' | '+v.publishAt+' | '+v.count+' pages'+(v.published?' | publiée':'')))"
```

### Attention sur la durée

**3 ans et 9 mois, ce n'est pas « plusieurs mois ».** C'est la conséquence
arithmétique directe de 100 pages toutes les deux semaines sur un parc de
9 804 stations : 99 vagues, 26 vagues par an.

Ce rythme est le bon **pour commencer**, parce qu'il n'engage à rien et
qu'il permet de vérifier que Google indexe correctement le gabarit. Il n'a
aucune raison d'être maintenu pendant quatre ans. Une fois les trois ou
quatre premières vagues indexées à un taux satisfaisant, la cadence peut
être multipliée sans risque : à ce stade Google a déjà validé le modèle de
page, ce qui reste à prouver est seulement la capacité du site à absorber
du volume.

Le palier d'accélération recommandé est décrit au point 6. Il ramène la
couverture complète à **fin juin 2027, soit un peu moins d'un an**.

---

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

### Ordre de publication

Les stations sont classées par potentiel décroissant. Le score combine :

- le poids démographique de la commune (population pour les 168 villes de
  `top-cities.json`, nombre de stations de la commune ailleurs) ;
- la richesse des données affichables : nombre de carburants cotés, enseigne
  identifiée, adresse exploitable, services et horaires déclarés ;
- un bonus pour les stations d'autoroute, qui captent des requêtes propres ;
- un bonus de fraîcheur pour les stations qui déclarent régulièrement leurs prix.

Deux plafonds de diversité s'appliquent **par vague** : 6 stations maximum par
commune, 12 par département. Sans eux, la vague 1 serait presque entièrement
parisienne et lyonnaise, les 100 pages se cannibaliseraient entre elles et
concurrenceraient la page ville existante. Avec, la vague 1 couvre 24
départements et 44 communes.

---

## 6. Changer la cadence

Tout se règle dans `scripts/build-station-waves.js`, en haut du fichier.

```js
const INTERVAL_DAYS = 14;

const WAVE_PLAN = [
  { fromWave: 1, size: 100 },
];
```

`WAVE_PLAN` fonctionne par paliers : chaque entrée s'applique à partir de la
vague indiquée, jusqu'au palier suivant.

### Palier d'accélération recommandé

À appliquer une fois les vagues 1 à 4 indexées correctement (voir point 7) :

```js
const WAVE_PLAN = [
  { fromWave: 1, size: 100 },   // vagues 1 à 6, prudence initiale
  { fromWave: 7, size: 250 },   // vagues 7 à 12
  { fromWave: 13, size: 500 },  // vagues 13 à 18
  { fromWave: 19, size: 800 },  // vagues 19 et suivantes
];
```

Résultat : 24 vagues au lieu de 99, couverture complète **fin juin 2027**.

### Après modification

```bash
npm run waves:plan   # simulation, n'écrit rien
npm run waves        # applique
```

**Modifier `WAVE_PLAN` ne dépublie jamais rien.** Les stations déjà affectées
gardent leur vague ; seules les stations non encore affectées et les vagues
futures sont recalculées. Réduire une taille de vague ne retire donc pas de
pages déjà en ligne.

En revanche, `INTERVAL_DAYS` et `startDate` décalent **toutes** les dates,
y compris celles de vagues déjà publiées. Ne les changer qu'en connaissance de
cause : allonger l'intervalle après coup peut faire repasser une vague publiée à
l'état non publié et retirer ses pages du site.

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

**Décision d'accélération**

Après la vague 4 (21 septembre 2026), soit 400 pages en ligne : si plus de 70 %
sont indexées et qu'aucune alerte qualité n'est remontée, appliquer le palier
d'accélération du point 6.

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
  décalage de quelques heures avec le prix réel est possible, et une station qui
  ne déclare plus affiche des données figées. La date de dernière déclaration
  est affichée sur chaque fiche.
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
