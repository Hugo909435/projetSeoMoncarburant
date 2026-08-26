#!/usr/bin/env node
/**
 * Détection des opérations carburant à prix coûtant dans l'open data.
 *
 * Une opération à prix coûtant n'est jamais annoncée à l'avance de façon
 * exploitable : les enseignes communiquent 2 à 3 jours avant, par SMS ou
 * affichage en magasin. En revanche elle est parfaitement visible dans les
 * prix : plusieurs centaines de stations d'un même réseau décrochent le même
 * jour, de 5 à 15 centimes.
 *
 * L'historique nécessaire existe déjà : src/data/fuel/stations-by-department/
 * est commité toutes les 2 à 3h par le workflow de mise à jour. On lit donc
 * l'état de la veille directement dans git, sans stockage supplémentaire.
 *
 * PIÈGE PRINCIPAL. Un écart brut ne veut rien dire : quand le Brent reflue,
 * des milliers de stations baissent le même jour sans qu'aucune opération
 * n'ait lieu. On retranche donc à chaque station la variation médiane de
 * l'ensemble du parc ce jour-là. Ce qui est détecté est un décrochage par
 * rapport au marché, pas une baisse dans l'absolu.
 *
 * Usage :
 *   node scripts/detect-prix-coutant.js
 *   node scripts/detect-prix-coutant.js --backtest 2026-06-29 2026-07-08
 *   node scripts/detect-prix-coutant.js --backtest 2026-07-01 2026-07-06 --verbose
 */

import { execFileSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEPT_DIR = resolve(ROOT, 'src/data/fuel/stations-by-department');
const DEPT_REL = 'src/data/fuel/stations-by-department';
const BRANDS_FILE = resolve(ROOT, 'src/data/fuel/brands.json');
const OUT_FILE = resolve(ROOT, 'src/data/fuel/prix-coutant-signals.json');

/**
 * Seuils de déclenchement.
 *
 * Calibrés sur les opérations réelles de juillet et août 2026 (E.Leclerc les
 * 3-4 juillet, Intermarché et Netto les 4-5 juillet, Système U les 2-3 août),
 * en vérifiant qu'aucun signal ne sort les jours sans opération connue.
 *
 * Toute modification doit être revalidée par --backtest : abaisser un seuil
 * pour « détecter plus » revient surtout à annoncer des opérations qui
 * n'existent pas, ce qui est le pire risque pour cette page.
 */
// Surchargeables par variable d'environnement, uniquement pour le calage :
// PC_DROP=0.02 PC_MIN_STATIONS=25 PC_MIN_SHARE=0.2 node scripts/... --backtest ...
const num = (env, fallback) => (process.env[env] ? Number(process.env[env]) : fallback);

const DROP_THRESHOLD = num('PC_DROP', 0.03); // décrochage min. vs marché, en €/L
const MIN_STATIONS = num('PC_MIN_STATIONS', 40); // nb min. de stations qui décrochent
const MIN_SHARE = num('PC_MIN_SHARE', 0.45); // et part min. du réseau concerné

/**
 * Sous ce nombre de stations, un réseau est écarté. BP (90 stations) ou Shell
 * (60) franchissent régulièrement les seuils de part sur de simples
 * réalignements locaux : quelques dizaines de stations suffisent à faire une
 * majorité. Les opérations à prix coûtant sont le fait des grandes surfaces,
 * dont les réseaux dépassent tous largement ce seuil.
 *
 * Conséquence assumée : Netto (61 stations) n'est jamais détecté seul. Ce
 * n'est pas une perte, ses opérations sont menées avec Intermarché, qui
 * décroche en même temps.
 */
const MIN_BRAND_SIZE = num('PC_MIN_BRAND', 150);

/**
 * Fenêtre de comparaison. 20h plutôt que 24 : le flux bouge en cours de
 * journée et une opération est déclarée en fin d'après-midi ou le soir, il
 * faut donc une photo antérieure au démarrage sans remonter trop loin.
 */
const LOOKBACK_HOURS = 20;

/**
 * E85 et GPLc sont volontairement exclus. Ils se vendent autour de 0,86 et
 * 1,05 €/L : une variation de quelques centimes y est proportionnellement
 * énorme et déclenche du bruit, alors que les opérations prix coûtant portent
 * sur le gazole et les sans-plomb.
 */
const FUELS = ['Gazole', 'SP95', 'SP98', 'E10'];

/**
 * Au-delà, ce n'est pas une remise mais une erreur de saisie du gérant. Le
 * flux gouvernemental en contient régulièrement (prix à 1 €/L, virgule
 * décalée). Un seul de ces relevés suffit à fausser un maximum affiché.
 */
const MAX_PLAUSIBLE_DROP = 0.4;

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

const brandNames = JSON.parse(readFileSync(BRANDS_FILE, 'utf-8')).reduce((acc, b) => {
  acc[b.slug] = b.name;
  return acc;
}, {});

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Instantané du parc, réduit à ce que la détection utilise : enseigne et prix
 * des quatre carburants suivis. Un backtest garde une dizaine d'instantanés en
 * mémoire, les conserver entiers (adresse, coordonnées, ville) coûterait dix
 * fois plus pour rien.
 */
function slim(stations, station) {
  const prices = {};
  for (const fuel of FUELS) {
    const v = station.prices?.[fuel];
    if (typeof v === 'number') prices[fuel] = v;
  }
  stations.set(String(station.id), { brand: station.enseigneSlug, prices });
}

function readSnapshotFromDisk() {
  const stations = new Map();
  for (const file of readdirSync(DEPT_DIR)) {
    if (!file.endsWith('.json')) continue;
    const payload = JSON.parse(readFileSync(resolve(DEPT_DIR, file), 'utf-8'));
    for (const s of payload.stations ?? []) slim(stations, s);
  }
  return stations;
}

/**
 * Même chose, mais à un commit donné. Lire un instantané coûte une centaine
 * d'appels à git : pendant un backtest chaque instantané sert successivement
 * d'état courant puis de référence pour les commits suivants, d'où le cache.
 */
const SNAPSHOT_CACHE_SIZE = 12;
const snapshotCache = new Map();
function readSnapshotFromGit(sha) {
  const cached = snapshotCache.get(sha);
  if (cached) {
    // Remise en tête : le plus ancien sort en premier.
    snapshotCache.delete(sha);
    snapshotCache.set(sha, cached);
    return cached;
  }

  const listing = git(['ls-tree', '--name-only', `${sha}:${DEPT_REL}`])
    .split('\n')
    .filter((f) => f.endsWith('.json'));

  const stations = new Map();
  for (const file of listing) {
    let raw;
    try {
      raw = git(['show', `${sha}:${DEPT_REL}/${file}`]);
    } catch {
      continue; // fichier absent à ce commit (département apparu depuis)
    }
    const payload = JSON.parse(raw);
    for (const s of payload.stations ?? []) slim(stations, s);
  }

  if (snapshotCache.size >= SNAPSHOT_CACHE_SIZE) {
    snapshotCache.delete(snapshotCache.keys().next().value);
  }
  snapshotCache.set(sha, stations);
  return stations;
}

/**
 * Compare deux instantanés et renvoie les réseaux qui décrochent.
 */
function detect(current, previous) {
  // 1. Variations individuelles, tous carburants confondus.
  const deltas = []; // { id, brand, fuel, delta }
  for (const [id, now] of current) {
    const before = previous.get(id);
    if (!before) continue;
    const brand = now.brand;
    if (!brand) continue;
    for (const fuel of FUELS) {
      const a = before.prices[fuel];
      const b = now.prices[fuel];
      if (typeof a !== 'number' || typeof b !== 'number') continue;
      deltas.push({ id, brand, fuel, delta: b - a });
    }
  }
  if (deltas.length === 0) return { marketShift: 0, signals: [], sampleSize: 0 };

  // 2. Mouvement général du marché, retranché à chaque station.
  //
  // La médiane est prise sur les seules stations qui ont bougé. Sur l'ensemble
  // du parc elle vaudrait zéro tous les jours, la majorité des stations ne
  // changeant pas de prix quotidiennement : la correction serait alors nulle
  // et un reflux général du Brent ressortirait comme une opération.
  const moved = deltas.filter((d) => Math.abs(d.delta) > 0.0005).map((d) => d.delta);
  const marketShift = moved.length > 0 ? median(moved) : 0;

  // 3. Stations qui décrochent, et taille de chaque réseau observé.
  const droppingByBrand = new Map(); // brand -> Map(stationId -> décrochage max)
  const stationsByBrand = new Map(); // brand -> Set(stationId)
  for (const d of deltas) {
    if (!stationsByBrand.has(d.brand)) stationsByBrand.set(d.brand, new Set());
    stationsByBrand.get(d.brand).add(d.id);

    // Seule une station qui a effectivement changé son prix peut décrocher.
    // Sans ce filtre, un marché en hausse de 3 c/L ferait ressortir comme
    // « en baisse » toutes les stations qui n'ont simplement pas bougé, soit
    // la quasi-totalité du parc, et tous les réseaux sortiraient à 100 %.
    if (Math.abs(d.delta) <= 0.0005) continue;

    const relative = d.delta - marketShift;
    if (relative > -DROP_THRESHOLD) continue;
    if (relative < -MAX_PLAUSIBLE_DROP) continue; // erreur de saisie, pas une remise
    if (!droppingByBrand.has(d.brand)) droppingByBrand.set(d.brand, new Map());
    const seen = droppingByBrand.get(d.brand).get(d.id);
    // Une station décrochant sur plusieurs carburants ne compte qu'une fois,
    // sur son décrochage le plus fort.
    if (seen == null || relative < seen) droppingByBrand.get(d.brand).set(d.id, relative);
  }

  // 4. Une opération est une grappe, pas une station isolée.
  const signals = [];
  for (const [brand, dropping] of droppingByBrand) {
    const total = stationsByBrand.get(brand).size;
    if (total < MIN_BRAND_SIZE) continue;
    const count = dropping.size;
    const share = count / total;
    if (count < MIN_STATIONS || share < MIN_SHARE) continue;

    const drops = [...dropping.values()].map((v) => -v);
    signals.push({
      brand,
      brandName: brandNames[brand] ?? brand,
      stationsDropping: count,
      stationsObserved: total,
      share: Number(share.toFixed(3)),
      medianDrop: Number(median(drops).toFixed(3)),
      maxDrop: Number(Math.max(...drops).toFixed(3)),
    });
  }
  signals.sort((a, b) => b.stationsDropping - a.stationsDropping);

  return { marketShift: Number(marketShift.toFixed(4)), signals, sampleSize: deltas.length };
}

/** Dernier commit ayant touché les données avant un instant donné. */
function commitBefore(isoInstant) {
  const sha = git([
    'log',
    '-1',
    '--format=%H',
    `--before=${isoInstant}`,
    '--',
    DEPT_REL,
  ]).trim();
  return sha || null;
}

function commitDate(sha) {
  return git(['log', '-1', '--format=%cI', sha]).trim();
}

// ---------------------------------------------------------------- backtest --

function backtest(fromDay, toDay, verbose) {
  console.log(`Backtest du ${fromDay} au ${toDay}`);
  console.log(
    `Seuils : décrochage >= ${DROP_THRESHOLD} €/L, >= ${MIN_STATIONS} stations, >= ${MIN_SHARE * 100} % du réseau\n`,
  );

  // La production tourne à chaque build, soit toutes les 3h. Rejouer à la
  // maille journalière raterait une opération déclarée entre deux commits qui
  // ne forment jamais une paire : c'est exactement ce qui s'est produit avec
  // l'opération du 3 juillet, déclarée à 22h10. On rejoue donc commit par
  // commit, ce que fait réellement le workflow.
  const commits = git([
    'log',
    '--reverse',
    '--format=%H %cI',
    `--since=${fromDay}T00:00:00`,
    `--until=${toDay}T23:59:59`,
    '--',
    DEPT_REL,
  ])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, date] = line.split(' ');
      return { sha, date };
    });

  console.log(`${commits.length} commits à rejouer.\n`);

  let withSignal = 0;
  const daysSeen = new Set();
  for (const { sha, date } of commits) {
    const reference = new Date(new Date(date).getTime() - LOOKBACK_HOURS * 3600 * 1000);
    const shaBefore = commitBefore(reference.toISOString());
    if (!shaBefore || shaBefore === sha) continue;
    daysSeen.add(date.slice(0, 10));

    const result = detect(readSnapshotFromGit(sha), readSnapshotFromGit(shaBefore));
    const horodatage = date.replace('T', ' ').slice(0, 16);

    if (result.signals.length === 0) {
      if (verbose) console.log(`${horodatage} : rien (marché ${fmtShift(result.marketShift)})`);
      continue;
    }

    withSignal++;
    console.log(`${horodatage} : marché ${fmtShift(result.marketShift)}`);
    for (const s of result.signals) {
      console.log(
        `   -> ${s.brandName} : ${s.stationsDropping}/${s.stationsObserved} stations ` +
          `(${Math.round(s.share * 100)} %), décrochage médian ${(s.medianDrop * 100).toFixed(1)} c/L, ` +
          `max ${(s.maxDrop * 100).toFixed(1)} c/L`,
      );
    }
  }

  console.log(
    `\n${withSignal} relevé(s) avec signal sur ${commits.length} commits, ${daysSeen.size} jour(s) couvert(s).`,
  );
}

function fmtShift(v) {
  const c = v * 100;
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)} c/L`;
}

function toIso(d) {
  return d.toISOString().slice(0, 10);
}

// -------------------------------------------------------------- production --

function run() {
  if (!existsSync(DEPT_DIR)) {
    console.log('[prix-coutant] données station absentes, détection ignorée.');
    return;
  }

  // 20h en arrière plutôt que 24 : le flux étant rafraîchi en cours de
  // journée, on veut la photo d'avant le démarrage d'une opération du matin.
  const since = new Date(Date.now() - LOOKBACK_HOURS * 3600 * 1000).toISOString();
  const sha = commitBefore(since);
  if (!sha) {
    console.log(
      '[prix-coutant] aucun commit de référence trouvé (historique trop court ?), détection ignorée.',
    );
    writeFileSync(
      OUT_FILE,
      JSON.stringify({ generatedAt: new Date().toISOString(), unavailable: true, signals: [] }, null, 2),
    );
    return;
  }

  const result = detect(readSnapshotFromDisk(), readSnapshotFromGit(sha));
  const payload = {
    generatedAt: new Date().toISOString(),
    comparedTo: { sha: sha.slice(0, 9), date: commitDate(sha) },
    marketShift: result.marketShift,
    sampleSize: result.sampleSize,
    thresholds: {
      dropThreshold: DROP_THRESHOLD,
      minStations: MIN_STATIONS,
      minShare: MIN_SHARE,
    },
    signals: result.signals,
  };
  writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));

  if (result.signals.length === 0) {
    console.log(`[prix-coutant] aucun décrochage réseau (marché ${fmtShift(result.marketShift)}).`);
  } else {
    for (const s of result.signals) {
      console.log(
        `[prix-coutant] ${s.brandName} : ${s.stationsDropping} stations à ` +
          `${(s.medianDrop * 100).toFixed(1)} c/L sous le marché.`,
      );
    }
  }
}

/**
 * Diagnostic : compare deux commits précis. Sert au calage des seuils, quand
 * il faut savoir à quelle heure exactement une opération a été déclarée dans
 * le flux, ce que la maille journalière ne montre pas.
 */
function pair(shaBefore, shaAfter) {
  const result = detect(readSnapshotFromGit(shaAfter), readSnapshotFromGit(shaBefore));
  console.log(
    `${shaBefore.slice(0, 9)} (${commitDate(shaBefore)}) -> ${shaAfter.slice(0, 9)} (${commitDate(shaAfter)})`,
  );
  console.log(`marché ${fmtShift(result.marketShift)}, ${result.sampleSize} relevés comparés`);
  if (result.signals.length === 0) {
    console.log('   aucun décrochage réseau');
    return;
  }
  for (const s of result.signals) {
    console.log(
      `   -> ${s.brandName} : ${s.stationsDropping}/${s.stationsObserved} (${Math.round(s.share * 100)} %), ` +
        `médian ${(s.medianDrop * 100).toFixed(1)} c/L, max ${(s.maxDrop * 100).toFixed(1)} c/L`,
    );
  }
}

const args = process.argv.slice(2);
const pairIndex = args.indexOf('--pair');
if (pairIndex !== -1) {
  pair(args[pairIndex + 1], args[pairIndex + 2]);
  process.exit(0);
}
const backtestIndex = args.indexOf('--backtest');
if (backtestIndex !== -1) {
  const from = args[backtestIndex + 1];
  const to = args[backtestIndex + 2];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(to ?? '')) {
    console.error('Usage : --backtest AAAA-MM-JJ AAAA-MM-JJ [--verbose]');
    process.exit(1);
  }
  backtest(from, to, args.includes('--verbose'));
} else {
  run();
}
