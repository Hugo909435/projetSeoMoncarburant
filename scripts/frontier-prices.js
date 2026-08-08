#!/usr/bin/env node
/**
 * Comparaison des prix du carburant de part et d'autre des frontières.
 *
 * Alimente l'article /blog/faire-le-plein-a-l-etranger-frontaliers/.
 *
 * Le côté français est calculé ici, à partir des stations déjà présentes dans
 * src/data/fuel. Le point de comparaison n'est pas la moyenne nationale mais la
 * médiane des stations situées à moins de 30 km d'un point de passage
 * frontalier : c'est le prix que le frontalier paie réellement s'il ne
 * traverse pas. Comparer l'Espagne à la moyenne française gonflerait le gain,
 * les Pyrénées-Orientales étant déjà parmi les départements les moins chers.
 *
 * Le côté étranger n'est pas calculable : aucun pays voisin n'expose ses prix
 * dans un format ouvert comparable à prix-carburants.gouv.fr. Ces valeurs sont
 * relevées à la main dans src/data/fuel/frontier-foreign.json.
 *
 * C'est aussi la raison pour laquelle ce script n'est PAS branché sur le build
 * quotidien : il recalculerait le côté français avec des prix étrangers figés,
 * et produirait des écarts faux sans que personne s'en aperçoive. Il se lance à
 * la main quand on rafraîchit l'article :
 *
 *   npm run frontier          affiche le tableau et écrit le JSON
 *   npm run frontier:chart    régénère l'image de une
 *
 * Sortie : src/data/fuel/frontier-comparison.json
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'src/data/fuel');
const DEPT_DIR = resolve(DATA_DIR, 'stations-by-department');

/** Rayon retenu autour de chaque point de passage, en kilomètres. */
const RADIUS_KM = 30;

/** Carburants comparés. E10 est retenu comme essence de référence : c'est la moins chère côté français, donc la comparaison la plus prudente face au Super 95 étranger. */
const FUELS = ['Gazole', 'E10', 'SP95', 'SP98'];

/**
 * Points de passage frontaliers, en [latitude, longitude, nom].
 * Choisis parmi les axes réellement empruntés par les frontaliers, pas les
 * postes secondaires : c'est là que se trouvent les stations qui comptent.
 */
const CROSSINGS = {
  Luxembourg: [
    [49.358, 6.168, 'Thionville'], [49.522, 5.766, 'Longwy'], [49.470, 5.936, 'Villerupt'],
    [49.445, 6.130, 'Cattenom'], [49.279, 6.106, 'Hayange'],
  ],
  Belgique: [
    [50.630, 3.060, 'Lille'], [50.357, 3.523, 'Valenciennes'], [50.279, 3.973, 'Maubeuge'],
    [49.772, 4.720, 'Charleville'], [49.920, 4.083, 'Hirson'], [50.985, 2.383, 'Dunkerque'],
    [49.545, 5.180, 'Givet-Sud'],
  ],
  Allemagne: [
    [48.583, 7.750, 'Strasbourg'], [49.190, 6.900, 'Forbach'], [49.037, 7.950, 'Wissembourg'],
    [47.591, 7.560, 'Saint-Louis'], [49.110, 7.070, 'Sarreguemines'], [48.750, 7.870, 'Haguenau nord'],
  ],
  Suisse: [
    [47.591, 7.510, 'Saint-Louis / Bâle'], [46.903, 6.355, 'Pontarlier'], [46.193, 6.236, 'Annemasse'],
    [46.333, 6.058, 'Gex'], [47.508, 6.996, 'Delle'], [47.057, 6.607, 'Morteau'], [46.372, 6.480, 'Thonon'],
  ],
  Italie: [
    [43.775, 7.500, 'Menton'], [45.198, 6.660, 'Modane'], [44.899, 6.635, 'Briançon'],
    [45.590, 6.930, 'Bourg-Saint-Maurice'],
  ],
  Espagne: [
    [43.359, -1.775, 'Hendaye'], [42.465, 2.863, 'Le Perthus'], [42.433, 1.940, 'Bourg-Madame'],
    [42.440, 3.170, 'Cerbère'], [43.180, -1.230, 'Saint-Jean-Pied-de-Port'],
  ],
  Andorre: [
    [42.588, 1.798, "L'Hospitalet-près-l'Andorre"], [42.719, 1.838, 'Ax-les-Thermes'],
    [42.797, 1.615, 'Tarascon-sur-Ariège'],
  ],
};

/** Consommation de référence, en litres aux 100 km, pour le calcul du détour. */
const CONSUMPTION = 6.5;
/** Contenance de référence d'un plein, en litres. */
const TANK = 50;
/** Kilométrage annuel de référence. */
const KM_PER_YEAR = 13000;

/** Distance approchée en kilomètres, projection équirectangulaire (suffisante sous 100 km). */
function distanceKm(a, b) {
  const K = Math.PI / 180;
  const dx = (a.lng - b.lng) * K * Math.cos(((a.lat + b.lat) / 2) * K);
  const dy = (a.lat - b.lat) * K;
  return 6371 * Math.sqrt(dx * dx + dy * dy);
}

/** Médiane, préférée à la moyenne pour limiter l'effet des stations d'autoroute. */
function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[Math.floor(sorted.length / 2)];
}

function loadStations() {
  const stations = [];
  for (const file of readdirSync(DEPT_DIR)) {
    if (!file.endsWith('.json')) continue;
    const dept = JSON.parse(readFileSync(resolve(DEPT_DIR, file), 'utf8'));
    if (Array.isArray(dept.stations)) stations.push(...dept.stations);
  }
  return stations;
}

function main() {
  const stations = loadStations();
  const foreign = JSON.parse(readFileSync(resolve(DATA_DIR, 'frontier-foreign.json'), 'utf8'));
  const eurPerChf = foreign._eurPerChf;

  const national = {};
  for (const fuel of FUELS) {
    national[fuel] = median(stations.map((s) => s.prices?.[fuel]).filter(Boolean));
  }

  const borders = [];
  for (const [country, points] of Object.entries(CROSSINGS)) {
    const entry = foreign.countries[country];
    if (!entry) throw new Error(`Prix étrangers manquants pour ${country} dans frontier-foreign.json`);

    const near = stations.filter(
      (s) => s.lat && s.lng && points.some(([lat, lng]) => distanceKm(s, { lat, lng }) <= RADIUS_KM)
    );
    if (!near.length) throw new Error(`Aucune station française trouvée à moins de ${RADIUS_KM} km de la frontière ${country}`);

    // Prix étrangers : soit directement en euros, soit convertis depuis le franc suisse.
    const abroad = entry.prices
      ? { ...entry.prices }
      : Object.fromEntries(
          // On garde la précision de la conversion : arrondir ici décalerait l'écart d'un centime.
          Object.entries(entry.pricesChf).map(([fuel, chf]) => [fuel, Number((chf * eurPerChf).toFixed(4))])
        );

    const fr = {};
    const counts = {};
    for (const fuel of FUELS) {
      const values = near.map((s) => s.prices?.[fuel]).filter(Boolean);
      fr[fuel] = median(values);
      counts[fuel] = values.length;
    }

    const comparison = {};
    for (const fuel of FUELS) {
      if (fr[fuel] == null || abroad[fuel] == null) continue;
      const perLitre = Number((fr[fuel] - abroad[fuel]).toFixed(4));
      const perTank = Number((perLitre * TANK).toFixed(2));
      // Coût du détour : seul le carburant brûlé est compté, ni l'usure ni le temps.
      const costPerKm = (CONSUMPTION / 100) * fr[fuel];
      comparison[fuel] = {
        france: fr[fuel],
        abroad: abroad[fuel],
        perLitre,
        perTank,
        detourKm: perLitre > 0 ? Math.round(perTank / costPerKm) : 0,
        perYear: Number((perLitre * (KM_PER_YEAR * CONSUMPTION) / 100).toFixed(0)),
      };
    }

    borders.push({
      country,
      stationsUsed: near.length,
      sampleSizes: counts,
      date: entry.date,
      source: entry.source,
      sourceUrl: entry.sourceUrl,
      note: entry.note ?? null,
      fuels: comparison,
    });
  }

  borders.sort((a, b) => (b.fuels.Gazole?.perTank ?? 0) - (a.fuels.Gazole?.perTank ?? 0));

  const output = {
    generatedAt: new Date().toISOString(),
    radiusKm: RADIUS_KM,
    tankLitres: TANK,
    consumptionPer100km: CONSUMPTION,
    kmPerYear: KM_PER_YEAR,
    eurPerChf,
    foreignPricesUpdatedAt: foreign._updatedAt,
    nationalMedian: national,
    borders,
  };

  const outPath = resolve(DATA_DIR, 'frontier-comparison.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');

  const eur = (n) => (n > 0 ? '+' : '') + n.toFixed(2).replace('.', ',');
  for (const fuel of ['Gazole', 'E10']) {
    console.log(`\n=== ${fuel} : côté français (${RADIUS_KM} km de la frontière) vs pays voisin ===`);
    console.log('Pays'.padEnd(12) + 'France'.padStart(8) + 'Voisin'.padStart(9) + 'Écart/L'.padStart(10) + `Plein ${TANK}L`.padStart(12) + 'Détour'.padStart(10) + 'Par an'.padStart(12));
    for (const b of borders) {
      const c = b.fuels[fuel];
      if (!c) continue;
      console.log(
        b.country.padEnd(12) +
        c.france.toFixed(3).padStart(8) +
        c.abroad.toFixed(3).padStart(9) +
        ((c.perLitre > 0 ? '+' : '') + c.perLitre.toFixed(3).replace('.', ',')).padStart(10) +
        (eur(c.perTank) + ' €').padStart(12) +
        (c.detourKm ? c.detourKm + ' km' : 'aucun').padStart(10) +
        (eur(c.perYear) + ' €').padStart(12)
      );
    }
  }
  console.log(`\nMédiane nationale : ` + FUELS.map((f) => `${f} ${national[f]?.toFixed(3)}`).join(' · '));
  console.log(`Prix étrangers relevés le ${foreign._updatedAt}. Écrit dans ${outPath.replace(ROOT + '/', '')}`);
  console.log('Détour = kilomètres aller-retour que le gain absorbe, carburant seul, hors temps et usure.');
}

main();
