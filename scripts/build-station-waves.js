#!/usr/bin/env node
/**
 * Planification du déploiement progressif des pages station.
 *
 * Le site compte près de 10 000 stations. Publier 10 000 pages d'un coup est le
 * meilleur moyen de déclencher une évaluation qualité défavorable de Google
 * (pages générées en masse, budget de crawl saturé, indexation partielle).
 * On étale donc la publication en « vagues » : chaque vague est un lot de
 * stations qui devient visible à une date donnée.
 *
 * Ce script produit src/data/fuel/station-waves.json, qui est le calendrier de
 * référence. La page station ne génère que les stations dont la vague est déjà
 * échue à la date du build. Comme le site est rebuildé tous les jours par le
 * workflow de mise à jour des prix, une vague se publie toute seule le jour dit,
 * sans intervention.
 *
 * Deux garanties non négociables :
 *
 *  1. IDEMPOTENCE. Une station déjà affectée à une vague n'en change jamais.
 *     Une page publiée ne doit pas disparaître au rebuild suivant.
 *  2. URL GELÉE. Le chemin de la page est figé au moment de l'affectation et
 *     recopié tel quel ensuite. Si l'open data corrige l'orthographe d'une
 *     adresse ou si le mapping d'enseigne change, l'URL déjà indexée par Google
 *     ne bouge pas.
 *
 * Usage :
 *   node scripts/build-station-waves.js
 *   node scripts/build-station-waves.js --dry-run    (n'écrit rien, affiche le plan)
 *   STATIONS_WAVE_START=2026-09-01 node scripts/build-station-waves.js
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'src/data/fuel');
const DEPT_DIR = resolve(DATA_DIR, 'stations-by-department');
const DETAIL_DIR = resolve(DATA_DIR, 'stations-detail');
const WAVES_FILE = resolve(DATA_DIR, 'station-waves.json');

const DRY_RUN = process.argv.includes('--dry-run');

// ─────────────────────────────────────────────────────────────────────────────
// Cadence de publication
// ─────────────────────────────────────────────────────────────────────────────

/** Nombre de jours entre deux vagues. */
const INTERVAL_DAYS = 14;

/**
 * Taille des vagues, par paliers. Chaque entrée s'applique à partir de la vague
 * indiquée et jusqu'au palier suivant.
 *
 * Réglage actuel : 100 pages toutes les deux semaines, du début à la fin.
 * À ce rythme, les ~9 800 stations demandent 98 vagues, soit près de quatre ans.
 * Voir STATIONS-ROLLOUT.md pour le palier d'accélération prêt à l'emploi, à
 * appliquer une fois l'indexation des premières vagues validée.
 *
 * Modifier ce tableau ne réaffecte JAMAIS une station déjà publiée : seules les
 * stations pas encore affectées et les vagues futures sont impactées.
 */
const WAVE_PLAN = [
  { fromWave: 1, size: 100 },
];

/**
 * Plafonds de diversité géographique, par vague.
 *
 * Sans eux, la première vague serait à peu près intégralement parisienne et
 * lyonnaise : les 100 pages se cannibaliseraient entre elles et concurrenceraient
 * la page ville existante. En bornant, chaque vague couvre au minimum une
 * dizaine de départements, ce qui multiplie les requêtes visées et donne à
 * Google un signal de couverture nationale plutôt que d'empilement local.
 */
const MAX_PER_CITY_PER_WAVE = 6;
const MAX_PER_DEPT_PER_WAVE = 12;

/** Taille de la vague n (1-indexé). */
function waveSize(n) {
  let size = WAVE_PLAN[0].size;
  for (const step of WAVE_PLAN) {
    if (n >= step.fromWave) size = step.size;
  }
  return size;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dates
// ─────────────────────────────────────────────────────────────────────────────

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

/** Premier lundi à partir de la date donnée (incluse). */
function nextMonday(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0 = dimanche
  const delta = dow === 1 ? 0 : (8 - dow) % 7;
  return addDays(isoDate, delta);
}

/** Date de publication de la vague n, à partir de la date de la vague 1. */
function publishDateFor(n, startDate) {
  return addDays(startDate, (n - 1) * INTERVAL_DAYS);
}

// ─────────────────────────────────────────────────────────────────────────────
// Chargement des données
// ─────────────────────────────────────────────────────────────────────────────

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadStations() {
  if (!existsSync(DEPT_DIR)) {
    throw new Error(
      `${DEPT_DIR} est absent. Lance d'abord : node scripts/fetch-fuel-data.js`,
    );
  }

  const stations = [];
  for (const file of readdirSync(DEPT_DIR)) {
    if (!file.endsWith('.json')) continue;
    const dep = file.replace('.json', '');
    const payload = loadJson(resolve(DEPT_DIR, file));

    let detail = {};
    const detailFile = resolve(DETAIL_DIR, file);
    if (existsSync(detailFile)) detail = loadJson(detailFile);

    for (const s of payload.stations ?? []) {
      stations.push({ ...s, dep: s.dep ?? dep, detail: detail[s.id] ?? {} });
    }
  }
  return stations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score de potentiel SEO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ordonne les stations par potentiel décroissant. L'objectif n'est pas une
 * mesure absolue mais un classement : on veut que les premières vagues portent
 * les pages qui ont à la fois du volume de recherche (grandes villes, axes
 * routiers) et de la matière à afficher (prix nombreux, enseigne identifiée,
 * adresse propre, services renseignés). Publier d'abord les pages les plus
 * riches, c'est prouver la qualité du gabarit avant d'en produire du volume.
 */
function scoreStation(s, ctx) {
  let score = 0;

  // Poids démographique de la commune. Connu précisément pour les 168 villes de
  // top-cities.json, approché ailleurs par le nombre de stations de la commune,
  // qui suit de près la taille de l'agglomération.
  const pop = ctx.cityPopulation.get(s.villeSlug);
  if (pop) {
    score += Math.log10(pop) * 28; // Paris (2,16 M) ≈ 178, une ville de 21 000 ≈ 121
  }
  const cityStations = ctx.stationsPerCity.get(s.villeSlug) ?? 1;
  score += Math.min(cityStations, 40) * 2; // jusqu'à 80

  // Richesse des données affichables.
  const fuelCount = Object.keys(s.prices ?? {}).length;
  score += fuelCount * 8; // jusqu'à 48

  if (s.enseigneSlug && s.enseigneSlug !== 'independent') score += 15;
  if (s.adresse && s.adresse.length > 4) score += 10;

  const services = s.detail.services ?? [];
  score += Math.min(services.length, 6) * 2; // jusqu'à 12
  if (s.detail.horaires) score += 8;
  if (s.detail.automate) score += 5;

  // Les stations d'autoroute captent des requêtes propres ("station essence A7")
  // que les pages ville ne couvrent pas.
  if (s.pop === 'autoroute') score += 8;

  // Une station qui déclare ses prix régulièrement fera une page qui reste juste.
  if (s.maj) {
    const days = (ctx.now - new Date(s.maj).getTime()) / 86400000;
    if (days <= 3) score += 12;
    else if (days <= 10) score += 6;
  }

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// Construction de l'URL (gelée à la première affectation)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_ADDRESS_SLUG = 46;

function slugPart(value) {
  return slugify(String(value ?? ''), { lower: true, strict: true, locale: 'fr' });
}

/** Tronque sur une frontière de mot pour éviter les URLs à rallonge. */
function truncateSlug(slug, max) {
  if (slug.length <= max) return slug;
  const cut = slug.slice(0, max);
  const lastDash = cut.lastIndexOf('-');
  return lastDash > max * 0.5 ? cut.slice(0, lastDash) : cut;
}

/**
 * Chemin relatif de la page, sous /prix-carburants/station/.
 * Format : {ville}/{enseigne}-{adresse}-{id}
 * L'identifiant en fin de chaîne garantit l'unicité, y compris pour deux
 * stations de la même enseigne dans la même rue.
 */
function buildStationPath(s) {
  const city = slugPart(s.ville) || 'france';

  const brandRaw =
    s.enseigneSlug && s.enseigneSlug !== 'independent' ? s.enseigneSlug : 'station';
  const brand = slugPart(brandRaw) || 'station';

  const address = truncateSlug(slugPart(s.adresse), MAX_ADDRESS_SLUG);

  const leaf = [brand, address, s.id].filter(Boolean).join('-');
  return `${city}/${leaf}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Affectation
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const today = toISODate(new Date());

  const stations = loadStations();
  console.log(`📊 ${stations.length} stations chargées`);

  // Contexte de scoring
  const topCities = loadJson(resolve(ROOT, 'src/data/top-cities.json'));
  const cityPopulation = new Map(topCities.map((c) => [c.slug, c.population]));
  const stationsPerCity = new Map();
  for (const s of stations) {
    stationsPerCity.set(s.villeSlug, (stationsPerCity.get(s.villeSlug) ?? 0) + 1);
  }
  const ctx = { cityPopulation, stationsPerCity, now: Date.now() };

  // État précédent
  const previous = existsSync(WAVES_FILE) ? loadJson(WAVES_FILE) : null;
  const startDate =
    previous?.startDate ??
    process.env.STATIONS_WAVE_START ??
    nextMonday(today);

  if (previous && process.env.STATIONS_WAVE_START) {
    console.log(
      `ℹ️  STATIONS_WAVE_START ignoré : le calendrier existe déjà (départ ${startDate}).`,
    );
  }

  /** id -> { wave, path } */
  const assignment = new Map();
  for (const [id, entry] of Object.entries(previous?.stations ?? {})) {
    assignment.set(id, { wave: entry.wave, path: entry.path });
  }

  // Occupation courante des vagues, et compteurs de diversité.
  const occupancy = new Map(); // wave -> count
  const cityCount = new Map(); // `${wave}|${citySlug}` -> count
  const deptCount = new Map(); // `${wave}|${dep}` -> count
  const byId = new Map(stations.map((s) => [s.id, s]));

  for (const [id, entry] of assignment) {
    occupancy.set(entry.wave, (occupancy.get(entry.wave) ?? 0) + 1);
    const s = byId.get(id);
    if (!s) continue; // station disparue de l'open data, voir plus bas
    const ck = `${entry.wave}|${s.villeSlug}`;
    const dk = `${entry.wave}|${s.dep}`;
    cityCount.set(ck, (cityCount.get(ck) ?? 0) + 1);
    deptCount.set(dk, (deptCount.get(dk) ?? 0) + 1);
  }

  // Une vague déjà publiée est figée : on ne lui ajoute pas de station après
  // coup, sinon un lot annoncé à 100 pages en ferait 130 en silence et la
  // montée en charge ne serait plus maîtrisée.
  const lastExistingWave = Math.max(0, ...assignment.values().map((e) => e.wave));
  let firstOpenWave = 1;
  for (let n = 1; n <= lastExistingWave; n++) {
    if (publishDateFor(n, startDate) > today) {
      firstOpenWave = n;
      break;
    }
    firstOpenWave = n + 1;
  }

  // Stations à affecter, par potentiel décroissant. L'identifiant sert de
  // départage pour que deux exécutions sur les mêmes données donnent le même
  // plan, y compris en cas d'égalité de score.
  const pending = stations
    .filter((s) => !assignment.has(s.id))
    .map((s) => ({ station: s, score: scoreStation(s, ctx) }))
    .sort((a, b) => b.score - a.score || a.station.id.localeCompare(b.station.id));

  console.log(
    `🆕 ${pending.length} station(s) à affecter` +
      (previous ? ` (${assignment.size} déjà planifiées, première vague ouverte : ${firstOpenWave})` : ''),
  );

  const usedPaths = new Set([...assignment.values()].map((e) => e.path));

  for (const { station: s } of pending) {
    let wave = firstOpenWave;
    // Cherche la première vague ouverte qui a de la place ET qui respecte les
    // plafonds de diversité. Au-delà de la dernière vague existante, on en crée
    // une nouvelle, donc la boucle termine toujours.
    for (;;) {
      const size = waveSize(wave);
      const ck = `${wave}|${s.villeSlug}`;
      const dk = `${wave}|${s.dep}`;
      const fits =
        (occupancy.get(wave) ?? 0) < size &&
        (cityCount.get(ck) ?? 0) < MAX_PER_CITY_PER_WAVE &&
        (deptCount.get(dk) ?? 0) < MAX_PER_DEPT_PER_WAVE;
      if (fits) break;
      wave++;
    }

    let path = buildStationPath(s);
    if (usedPaths.has(path)) {
      // Ne devrait pas arriver (l'id est dans le chemin), mais une collision
      // silencieuse écraserait une page : on préfère un suffixe explicite.
      let i = 2;
      while (usedPaths.has(`${path}-${i}`)) i++;
      path = `${path}-${i}`;
      console.warn(`⚠️  Collision d'URL résolue pour la station ${s.id} : ${path}`);
    }
    usedPaths.add(path);

    assignment.set(s.id, { wave, path });
    occupancy.set(wave, (occupancy.get(wave) ?? 0) + 1);
    cityCount.set(`${wave}|${s.villeSlug}`, (cityCount.get(`${wave}|${s.villeSlug}`) ?? 0) + 1);
    deptCount.set(`${wave}|${s.dep}`, (deptCount.get(`${wave}|${s.dep}`) ?? 0) + 1);
  }

  // Stations planifiées mais absentes du flux du jour : station fermée, ou
  // simple absence temporaire côté open data. On garde l'affectation (l'URL
  // reste réservée) et la page ne sera pas générée tant que la donnée manque.
  const orphans = [...assignment.keys()].filter((id) => !byId.has(id));
  if (orphans.length > 0) {
    console.log(
      `👻 ${orphans.length} station(s) planifiée(s) absente(s) du flux actuel : page non générée, URL conservée.`,
    );
  }

  // ── Calendrier ────────────────────────────────────────────────────────────
  const totalWaves = Math.max(0, ...assignment.values().map((e) => e.wave));
  const waves = [];
  for (let n = 1; n <= totalWaves; n++) {
    const publishAt = publishDateFor(n, startDate);
    waves.push({
      n,
      publishAt,
      count: occupancy.get(n) ?? 0,
      published: publishAt <= today,
    });
  }

  const publishedWaves = waves.filter((w) => w.published);
  const publishedPages = publishedWaves.reduce((sum, w) => sum + w.count, 0);

  const output = {
    version: 1,
    generatedAt: new Date().toISOString(),
    startDate,
    intervalDays: INTERVAL_DAYS,
    wavePlan: WAVE_PLAN,
    diversity: {
      maxPerCityPerWave: MAX_PER_CITY_PER_WAVE,
      maxPerDeptPerWave: MAX_PER_DEPT_PER_WAVE,
    },
    totalStations: assignment.size,
    totalWaves,
    lastWaveDate: waves.at(-1)?.publishAt ?? startDate,
    waves,
    stations: Object.fromEntries(
      [...assignment.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    ),
  };

  console.log('');
  console.log(`📅 Départ : ${startDate}, une vague tous les ${INTERVAL_DAYS} jours`);
  console.log(`📦 ${totalWaves} vagues pour ${assignment.size} stations`);
  console.log(`🏁 Dernière vague : ${output.lastWaveDate}`);
  console.log(`✅ Publiées à ce jour (${today}) : ${publishedWaves.length} vague(s), ${publishedPages} page(s)`);

  const nextWave = waves.find((w) => !w.published);
  if (nextWave) {
    console.log(`⏭️  Prochaine vague : n°${nextWave.n} le ${nextWave.publishAt} (${nextWave.count} pages)`);
  }

  if (DRY_RUN) {
    console.log('\n🧪 --dry-run : aucun fichier écrit.');
    return;
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  // Sérialisation à une station par ligne : le fichier fait ~10 000 lignes et
  // il est relu à chaque exécution. Un diff lisible permet de vérifier d'un
  // coup d'œil qu'une mise à jour n'a fait qu'ajouter des lignes.
  const head = { ...output };
  delete head.stations;
  const stationLines = Object.entries(output.stations)
    .map(([id, e]) => `    ${JSON.stringify(id)}: ${JSON.stringify(e)}`)
    .join(',\n');
  const headJson = JSON.stringify(head, null, 2).replace(/\n}$/, '');
  const serialized = `${headJson},\n  "stations": {\n${stationLines}\n  }\n}\n`;

  // Le workflow quotidien ne redéploie le site que si src/data/fuel/ a changé.
  // Comme ce script tourne à chaque build, réécrire le fichier pour la seule
  // valeur de generatedAt déclencherait un déploiement tous les jours sans
  // raison. On ignore donc ce champ dans la comparaison : le fichier ne bouge
  // que quand le plan bouge vraiment, c'est-à-dire à l'ajout de stations ou au
  // passage d'une vague à l'état publié.
  const withoutTimestamp = (text) => text.replace(/^\s*"generatedAt":.*\n/m, '');
  if (existsSync(WAVES_FILE)) {
    const current = readFileSync(WAVES_FILE, 'utf-8');
    if (withoutTimestamp(current) === withoutTimestamp(serialized)) {
      console.log('\n✅ Plan inchangé, fichier laissé tel quel.');
      return;
    }
  }

  writeFileSync(WAVES_FILE, serialized);
  console.log(`\n💾 Écrit : ${WAVES_FILE}`);
}

main();
