#!/usr/bin/env node
/**
 * Détection des pénuries de carburant, à partir des relevés de fetch-ruptures.js.
 *
 * Deux signaux, calés sur l'historique reconstitué du 01/01 au 28/09/2026
 * (voir backfill-ruptures.js) :
 *
 *  1. NIVEAU NATIONAL. Moyenne sur NATIONAL_WINDOW jours de la part des
 *     stations en rupture, classée en quatre niveaux. La moyenne évite de
 *     changer de niveau à chaque relevé : sur la valeur brute du jour, le
 *     niveau basculait une quarantaine de fois en neuf mois. Pour redescendre,
 *     il faut en plus passer HYSTERESIS point sous la borne. Résultat sur
 *     l'historique : 6 hausses de niveau, toutes pendant des épisodes connus
 *     (crise d'Ormuz début avril, Alsace en août, fin septembre).
 *
 *  2. DÉPARTEMENT EN ALERTE. Au moins DEPT_THRESHOLD % des stations en rupture
 *     deux jours de suite, et au moins DEPT_MIN_STATIONS stations touchées pour
 *     écarter les petits départements où trois stations font 30 %. Sur
 *     l'historique : 19 entrées en alerte en neuf mois, dont le Bas-Rhin le
 *     06/08/2026, dix jours avant que la pénurie alsacienne fasse la une.
 *     L'alerte se lève quand la part repasse sous DEPT_RELEASE %.
 *
 * L'état est conservé dans src/data/fuel/ruptures-alertes.json, pour
 * n'alerter qu'à l'entrée dans un épisode et non à chaque passage. Quand une
 * nouvelle alerte apparaît, le message est écrit dans penurie-alerte.md, que le
 * workflow transforme en issue GitHub (donc en notification par mail).
 *
 * Usage :
 *   node scripts/detect-penurie.js
 */

import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SNAPSHOT_FILE = resolve(ROOT, 'src/data/fuel/ruptures.json');
const HISTORY_FILE = resolve(ROOT, 'src/data/fuel/ruptures-history.json');
const STATE_FILE = resolve(ROOT, 'src/data/fuel/ruptures-alertes.json');
const MESSAGE_FILE = resolve(ROOT, 'penurie-alerte.md');

export const LEVELS = [
  { id: 'calme', label: 'Situation normale', min: 0 },
  { id: 'tensions', label: 'Tensions', min: 3 },
  { id: 'penurie', label: 'Pénurie', min: 8 },
  { id: 'forte', label: 'Forte pénurie', min: 15 },
];
const NATIONAL_WINDOW = 5;
const HYSTERESIS = 1;

const DEPT_THRESHOLD = 30;
const DEPT_RELEASE = 18;
const DEPT_MIN_STATIONS = 12;

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);

function levelIndexFor(value) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (value >= l.min) idx = i;
  });
  return idx;
}

/** Niveau avec hystérésis : monte dès la borne franchie, descend avec une marge. */
function nextLevel(current, avg) {
  const raw = levelIndexFor(avg);
  if (current == null || raw > current) return raw;
  if (raw < current && avg < LEVELS[current].min - HYSTERESIS) return raw;
  return current;
}

function main() {
  const snapshot = readJson(SNAPSHOT_FILE, null);
  const history = readJson(HISTORY_FILE, []);
  if (!snapshot || history.length < NATIONAL_WINDOW) {
    console.log('Pas assez de données pour la détection des pénuries.');
    return;
  }

  const state = readJson(STATE_FILE, { national: null, departements: {} });
  const messages = [];
  const today = history.at(-1);
  const yesterday = history.at(-2);

  // 1. Niveau national
  const window = history.slice(-NATIONAL_WINDOW);
  const avg = Math.round((window.reduce((sum, p) => sum + p.part, 0) / window.length) * 10) / 10;
  const previousIdx = state.national ? LEVELS.findIndex((l) => l.id === state.national.niveau) : null;
  const idx = nextLevel(previousIdx === -1 ? null : previousIdx, avg);
  if (idx !== previousIdx) {
    if (previousIdx != null && idx > previousIdx) {
      messages.push(
        `**Niveau national : ${LEVELS[idx].label}** (était : ${LEVELS[previousIdx].label}). ` +
          `${avg} % des stations en rupture en moyenne sur ${NATIONAL_WINDOW} jours, ${today.part} % au dernier relevé.`,
      );
    }
    state.national = { niveau: LEVELS[idx].id, depuis: today.date };
  }
  state.national.moyenne = avg;
  state.national.dernier = today.part;

  // 2. Départements
  const alertes = state.departements ?? {};
  const nouveaux = [];
  for (const [code, dept] of Object.entries(snapshot.departements)) {
    const part = today.departements?.[code];
    const partVeille = yesterday?.departements?.[code];
    if (part == null) continue;
    if (alertes[code]) {
      if (part < DEPT_RELEASE) {
        delete alertes[code];
      } else {
        alertes[code].pic = Math.max(alertes[code].pic, part);
        alertes[code].part = part;
      }
      continue;
    }
    const touchees = Math.round((dept.stations * part) / 100);
    if (part >= DEPT_THRESHOLD && (partVeille ?? 0) >= DEPT_THRESHOLD && touchees >= DEPT_MIN_STATIONS) {
      alertes[code] = { nom: dept.nom, depuis: today.date, part, pic: part };
      nouveaux.push(`- **${dept.nom ?? code} (${code})** : ${part} % des stations en rupture (${touchees} sur ${dept.stations})`);
    }
  }
  state.departements = Object.fromEntries(Object.entries(alertes).sort(([a], [b]) => (a < b ? -1 : 1)));
  if (nouveaux.length) {
    messages.push(`**Département(s) entrant en alerte** (au moins ${DEPT_THRESHOLD} % deux jours de suite) :\n${nouveaux.join('\n')}`);
  }

  const json = JSON.stringify(state, null, 2) + '\n';
  if (!existsSync(STATE_FILE) || readFileSync(STATE_FILE, 'utf8') !== json) writeFileSync(STATE_FILE, json);

  if (messages.length) {
    const enCours = Object.entries(state.departements)
      .map(([code, d]) => `${d.nom ?? code} ${d.part} %`)
      .join(', ');
    writeFileSync(
      MESSAGE_FILE,
      `${messages.join('\n\n')}\n\n` +
        `Départements en alerte à ce jour : ${enCours || 'aucun'}.\n\n` +
        `Source : relevé du ${snapshot.releveLe}, src/data/fuel/ruptures.json.\n`,
    );
    console.log(`🚨 Nouvelle alerte pénurie :\n${messages.join('\n')}`);
  } else {
    rmSync(MESSAGE_FILE, { force: true });
    console.log(
      `Pénurie : niveau ${state.national.niveau} (moyenne ${avg} %), ` +
        `${Object.keys(state.departements).length} département(s) en alerte, aucune nouvelle alerte.`,
    );
  }
}

main();
