#!/usr/bin/env node
/**
 * Reconstitution de l'historique des ruptures depuis le fichier annuel.
 *
 * L'API v2 (fetch-ruptures.js) ne donne que la situation instantanée. Le
 * fichier annuel du ministère, lui, conserve chaque rupture avec sa date de
 * début et de fin : on peut donc recalculer, jour par jour, la part des
 * stations en rupture et disposer d'un niveau de référence sans attendre des
 * semaines de relevés.
 *
 * Mêmes règles que fetch-ruptures.js, évaluées chaque jour à midi :
 *   - ruptures « temporaire » sur gazole, E10, SP95 et SP98 ;
 *   - ouvertes à cet instant et commencées depuis au plus 30 jours ;
 *   - stations actives : un prix déclaré dans les 10 jours précédents, ou une
 *     rupture comptée ce jour-là.
 *
 * Les points déjà présents dans ruptures-history.json (relevés réels de l'API)
 * sont conservés : la reconstitution ne remplit que les jours manquants.
 *
 * Limite : une rupture terminée la veille du téléchargement peut encore
 * figurer sans date de fin dans le fichier. Les deux derniers jours reconstitués
 * sont donc légèrement surestimés, d'où leur exclusion par défaut.
 *
 * Usage :
 *   node scripts/backfill-ruptures.js [annee]   (défaut : année en cours)
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HISTORY_FILE = resolve(ROOT, 'src/data/fuel/ruptures-history.json');

const YEAR = process.argv[2] ?? String(new Date().getFullYear());
const SOURCE_URL = `https://donnees.roulez-eco.fr/opendata/annee/${YEAR}`;

const FUELS = ['Gazole', 'E10', 'SP95', 'SP98'];
const MAX_RUPTURE_AGE_DAYS = 30;
const RECENT_DAYS = 7;
const ACTIVE_DAYS = 10;
const SKIP_LAST_DAYS = 2;
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

const share = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0);

function getDepNum(cp) {
  const str = String(cp ?? '').padStart(5, '0');
  if (str.startsWith('97')) return str.substring(0, 3);
  if (str.startsWith('20')) return parseInt(str.substring(2), 10) < 200 ? '2A' : '2B';
  return str.substring(0, 2);
}

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';

async function main() {
  console.log(`Téléchargement du fichier annuel ${YEAR}...`);
  const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(300_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const zip = new AdmZip(Buffer.from(await res.arrayBuffer()));
  const entry = zip.getEntries().find((e) => e.entryName.toLowerCase().endsWith('.xml'));
  if (!entry) throw new Error('aucun XML dans le ZIP');
  const xml = new TextDecoder('iso-8859-1').decode(entry.getData());

  const start = Date.parse(`${YEAR}-01-01T12:00:00+01:00`);
  const todayNoon = Date.parse(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date())}T12:00:00+02:00`);
  const nDays = Math.round((todayNoon - start) / DAY_MS) - SKIP_LAST_DAYS;
  if (nDays <= 0) throw new Error('aucun jour à reconstituer');

  const days = Array.from({ length: nDays }, () => ({
    stations: 0,
    enRupture: 0,
    recentes: 0,
    parCarburant: Object.fromEntries(FUELS.map((f) => [f, 0])),
    depts: {},
  }));

  let pdvCount = 0;
  for (const match of xml.matchAll(/<pdv [^>]*>[\s\S]*?<\/pdv>/g)) {
    pdvCount++;
    const block = match[0];
    const dept = getDepNum(attr(block, 'cp'));

    const priceDays = new Set();
    for (const tag of block.matchAll(/<prix [^>]*>/g)) {
      const t = parisTime(attr(tag[0], 'maj'));
      if (Number.isFinite(t)) priceDays.add(Math.floor((t - start) / DAY_MS));
    }

    const ruptures = [];
    for (const tag of block.matchAll(/<rupture [^>]*\/?>/g)) {
      if (attr(tag[0], 'type') !== 'temporaire') continue;
      const nom = attr(tag[0], 'nom');
      if (!FUELS.includes(nom)) continue;
      const debut = parisTime(attr(tag[0], 'debut'));
      if (!Number.isFinite(debut)) continue;
      const fin = parisTime(attr(tag[0], 'fin'));
      ruptures.push({ nom, debut, fin: Number.isFinite(fin) ? fin : Infinity });
    }

    for (let i = 0; i < nDays; i++) {
      const t = start + i * DAY_MS;
      const open = ruptures.filter(
        (r) => r.debut <= t && r.fin > t && (t - r.debut) / DAY_MS <= MAX_RUPTURE_AGE_DAYS,
      );
      let active = open.length > 0;
      for (let k = 0; !active && k <= ACTIVE_DAYS; k++) active = priceDays.has(i - k);
      if (!active) continue;

      const day = days[i];
      const d = (day.depts[dept] ??= { stations: 0, enRupture: 0 });
      day.stations++;
      d.stations++;
      if (!open.length) continue;
      day.enRupture++;
      d.enRupture++;
      if (open.some((r) => (t - r.debut) / DAY_MS <= RECENT_DAYS)) day.recentes++;
      for (const nom of new Set(open.map((r) => r.nom))) day.parCarburant[nom]++;
    }
  }

  const history = existsSync(HISTORY_FILE) ? JSON.parse(readFileSync(HISTORY_FILE, 'utf8')) : [];
  const known = new Set(history.map((p) => p.date));
  let added = 0;
  days.forEach((day, i) => {
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(start + i * DAY_MS));
    if (known.has(date) || day.stations < 1000) return;
    history.push({
      date,
      stations: day.stations,
      part: share(day.enRupture, day.stations),
      partRecentes: share(day.recentes, day.stations),
      parCarburant: day.parCarburant,
      departements: Object.fromEntries(
        Object.entries(day.depts)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([code, d]) => [code, share(d.enRupture, d.stations)]),
      ),
      reconstitue: true,
    });
    added++;
  });
  history.sort((a, b) => (a.date < b.date ? -1 : 1));
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 1) + '\n');
  console.log(`✅ ${pdvCount} stations lues, ${added} jour(s) reconstitué(s), ${history.length} point(s) au total.`);
}

main().catch((err) => {
  console.error(`❌ Reconstitution impossible : ${err.message}`);
  process.exit(1);
});
