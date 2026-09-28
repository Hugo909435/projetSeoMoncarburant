#!/usr/bin/env node
/**
 * Relevé des ruptures de carburant en station (suivi des pénuries).
 *
 * Le flux XML utilisé par fetch-fuel-data.js (donnees.roulez-eco.fr) ne publie
 * plus aucune balise <rupture> : vérifié le 28/09/2026, 0 occurrence sur tout
 * le fichier. Les ruptures sont en revanche exposées par l'API v2 du ministère
 * (data.economie.gouv.fr), la même source que prix-carburants.gouv.fr, avec
 * pour chaque carburant le type de rupture et sa date de début.
 *
 * Ce script ne sert pour l'instant qu'à constituer un historique. Tant qu'on
 * ne connaît pas le niveau habituel de ruptures, impossible de dire si 8 % des
 * stations en rupture est un signal ou le bruit de fond : les seuils d'alerte
 * seront calés sur cet historique.
 *
 * Trois filtres, sans lesquels le chiffre ne veut rien dire :
 *
 *  1. Ruptures « temporaire » seulement. Une rupture « definitive » signifie
 *     que la station a cessé de vendre ce carburant, pas qu'elle en manque.
 *  2. Ruptures récentes seulement (moins de MAX_RUPTURE_AGE_DAYS). Au
 *     28/09/2026, 330 ruptures temporaires ouvertes avaient plus de 180 jours :
 *     des gérants qui n'ont jamais déclaré la fin.
 *  3. Stations actives seulement : un prix déclaré depuis moins de
 *     ACTIVE_DAYS, OU une rupture récente. Le second critère est
 *     indispensable : une station à sec sur tous ses carburants ne déclare
 *     plus aucun prix, son champ *_maj est vide. Sans lui, le 28/09/2026,
 *     847 des 1 594 stations en rupture étaient écartées comme inactives,
 *     précisément les plus touchées.
 *
 * Gazole, SP95, E10 et SP98 uniquement : le GPLc et l'E85 sont en rupture
 * chronique dans une partie du parc, ils noieraient le signal.
 *
 * Sorties :
 *   src/data/fuel/ruptures.json          situation au dernier relevé
 *   src/data/fuel/ruptures-history.json  un point par jour (le dernier relevé
 *                                        du jour écrase le précédent)
 *
 * Usage :
 *   node scripts/fetch-ruptures.js
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_FILE = resolve(ROOT, 'src/data/fuel/ruptures.json');
const HISTORY_FILE = resolve(ROOT, 'src/data/fuel/ruptures-history.json');

const FUELS = [
  { key: 'gazole', label: 'Gazole' },
  { key: 'e10', label: 'E10' },
  { key: 'sp95', label: 'SP95' },
  { key: 'sp98', label: 'SP98' },
];

const SOURCE_URL =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/json?select=' +
  [
    'id',
    'code_departement',
    'departement',
    ...FUELS.flatMap(({ key }) => [`${key}_maj`, `${key}_rupture_debut`, `${key}_rupture_type`]),
  ].join(',');

/** Au-delà, une rupture ouverte est considérée comme non déclarée terminée. */
const MAX_RUPTURE_AGE_DAYS = 30;
/** Sous ce seuil, la rupture est comptée comme « récente » (moins de 7 jours). */
const RECENT_DAYS = 7;
/** Une station sans prix déclaré depuis plus longtemps est ignorée. */
const ACTIVE_DAYS = 10;

const DAY_MS = 86_400_000;

/**
 * Horodatages du ministère : heure de Paris, pas UTC.
 *
 * L'API v2 affiche « +00:00 », mais ses valeurs sont identiques caractère pour
 * caractère à celles du flux XML, qui est en heure locale (vérifié le
 * 28/09/2026 sur 8 762 stations). Lire le suffixe tel quel décale tout de
 * 1 à 2 h selon la saison. On ignore donc le suffixe et on interprète la date
 * comme une heure de Paris.
 */
function parisTime(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/.exec(String(value ?? ''));
  if (!m) return NaN;
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  const offset = (t) => {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(t)
        .map((x) => [x.type, x.value]),
    );
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t;
  };
  return wall - offset(wall - offset(wall));
}

async function fetchRecords() {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length < 1000) {
        throw new Error(`réponse inattendue (${Array.isArray(data) ? data.length : typeof data} enregistrements)`);
      }
      return data;
    } catch (err) {
      lastError = err;
      console.warn(`Tentative ${attempt}/3 échouée : ${err.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
  throw lastError;
}

const share = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0);

function summarize(records, now) {
  const national = { stations: 0, enRupture: 0, recentes: 0, parCarburant: {} };
  const departements = {};
  for (const { label } of FUELS) national.parCarburant[label] = 0;

  for (const s of records) {
    const ruptures = [];
    for (const { key, label } of FUELS) {
      if (s[`${key}_rupture_type`] !== 'temporaire') continue;
      const debut = parisTime(s[`${key}_rupture_debut`]);
      if (!Number.isFinite(debut)) continue;
      const age = (now - debut) / DAY_MS;
      if (age < 0 || age > MAX_RUPTURE_AGE_DAYS) continue;
      ruptures.push({ label, age });
    }

    const majs = FUELS.map(({ key }) => parisTime(s[`${key}_maj`])).filter(Number.isFinite);
    const declarePrix = majs.length > 0 && (now - Math.max(...majs)) / DAY_MS <= ACTIVE_DAYS;
    if (!declarePrix && !ruptures.length) continue;

    const code = s.code_departement ?? '??';
    const dept = (departements[code] ??= {
      nom: s.departement ?? null,
      stations: 0,
      enRupture: 0,
      recentes: 0,
      parCarburant: {},
    });
    national.stations++;
    dept.stations++;
    if (!ruptures.length) continue;

    national.enRupture++;
    dept.enRupture++;
    if (ruptures.some((r) => r.age <= RECENT_DAYS)) {
      national.recentes++;
      dept.recentes++;
    }
    for (const { label } of ruptures) {
      national.parCarburant[label]++;
      dept.parCarburant[label] = (dept.parCarburant[label] ?? 0) + 1;
    }
  }

  national.part = share(national.enRupture, national.stations);
  national.partRecentes = share(national.recentes, national.stations);
  for (const d of Object.values(departements)) d.part = share(d.enRupture, d.stations);

  const sortedDepts = Object.fromEntries(Object.entries(departements).sort(([a], [b]) => (a < b ? -1 : 1)));
  return { national, departements: sortedDepts };
}

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const now = Date.now();
  const records = await fetchRecords();
  const { national, departements } = summarize(records, now);

  if (national.stations < 1000) {
    throw new Error(`seulement ${national.stations} stations actives, relevé ignoré`);
  }

  const snapshot = {
    source: 'data.economie.gouv.fr, prix-des-carburants-en-france-flux-instantane-v2',
    criteres: {
      carburants: FUELS.map((f) => f.label),
      typeRupture: 'temporaire',
      ageMaxRuptureJours: MAX_RUPTURE_AGE_DAYS,
      recenteJours: RECENT_DAYS,
      stationActiveJours: ACTIVE_DAYS,
    },
    national,
    departements,
  };

  // Le fichier n'est réécrit que si les chiffres changent : un horodatage seul
  // suffirait sinon à déclencher un commit et un envoi FTP à chaque passage.
  const previous = readJson(OUT_FILE, null);
  const { releveLe: _ignored, ...previousData } = previous ?? {};
  if (JSON.stringify(previousData) !== JSON.stringify(snapshot)) {
    writeFileSync(OUT_FILE, JSON.stringify({ releveLe: new Date(now).toISOString(), ...snapshot }, null, 2) + '\n');
  }

  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(now));
  const point = {
    date: day,
    stations: national.stations,
    part: national.part,
    partRecentes: national.partRecentes,
    parCarburant: national.parCarburant,
    departements: Object.fromEntries(Object.entries(departements).map(([code, d]) => [code, d.part])),
  };
  const history = readJson(HISTORY_FILE, []).filter((p) => p.date !== day);
  history.push(point);
  history.sort((a, b) => (a.date < b.date ? -1 : 1));
  const historyJson = JSON.stringify(history, null, 1) + '\n';
  if (!existsSync(HISTORY_FILE) || readFileSync(HISTORY_FILE, 'utf8') !== historyJson) {
    writeFileSync(HISTORY_FILE, historyJson);
  }

  const top = Object.entries(departements)
    .filter(([, d]) => d.stations >= 25)
    .sort(([, a], [, b]) => b.part - a.part)
    .slice(0, 5)
    .map(([code, d]) => `${code} ${d.part} %`)
    .join(', ');
  console.log(
    `⛽ Ruptures : ${national.enRupture}/${national.stations} stations actives (${national.part} %), ` +
      `dont ${national.partRecentes} % depuis moins de ${RECENT_DAYS} j. Départements les plus touchés : ${top}.`,
  );
}

main().catch((err) => {
  console.error(`❌ Relevé des ruptures impossible : ${err.message}`);
  process.exit(1);
});
