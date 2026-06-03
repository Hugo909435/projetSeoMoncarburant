// Télécharge les blasons des départements métropolitains encore sans emblème.
// Lit departments.json, ignore les DOM (pas de page) et ceux déjà présents.
// Motif Wikimedia Commons : "Blason département fr <Nom>.svg" (+ repli sans accent).
//
//   node scripts/fetch-flags-depts.mjs

import { mkdir, writeFile, readFile, stat, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/images/flags/departments');

const deps = JSON.parse(await readFile(join(ROOT, 'src/data/departments.json'), 'utf-8'));
const stationDir = join(ROOT, 'src/data/fuel/stations-by-department');
const hasPage = new Set((await readdir(stationDir)).map((f) => f.replace('.json', '')));

await mkdir(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

async function download(filename) {
  const url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(filename);
  for (let attempt = 0; attempt < 4; attempt++) {
    await sleep(6000);
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': 'MonCarburant-flag-fetch/1.0' }, redirect: 'follow' });
    } catch {
      await sleep(3000);
      continue;
    }
    if (res.status === 404) return null;
    if (res.status === 429 || res.status >= 500 || !res.ok) { await sleep(4000 * (attempt + 1)); continue; }
    const text = await res.text();
    const head = text.slice(0, 300).toLowerCase();
    if ((head.includes('<svg') || head.includes('<?xml')) && !head.includes('<!doctype html')) return text;
    if (head.includes('too many') || head.includes('rate') || head.includes('error')) { await sleep(4000 * (attempt + 1)); continue; }
    return null;
  }
  return null;
}

const targets = Object.values(deps)
  .filter((d) => hasPage.has(d.num))            // a une page
  .filter((d) => !existsSync(join(OUT, `${d.num}.svg`))); // pas déjà d'emblème

console.log(`${targets.length} départements à traiter`);
const failures = [];

for (const d of targets) {
  const candidates = [
    `Blason département fr ${d.name}.svg`,
    `Blason departement fr ${stripAccents(d.name)}.svg`,
    `Blason ${d.name}.svg`,
  ];
  let ok = false;
  for (const c of candidates) {
    const svg = await download(c);
    if (svg) {
      await writeFile(join(OUT, `${d.num}.svg`), svg, 'utf-8');
      console.log(`  ✓ ${d.num} ${d.name}  ←  ${c}`);
      ok = true;
      break;
    }
  }
  if (!ok) { failures.push(`${d.num} ${d.name}`); console.log(`  ✗ ${d.num} ${d.name}`); }
}

console.log('\nRésumé : ' + (failures.length ? `ÉCHECS (${failures.length}) → ${failures.join(', ')}` : 'tous récupérés ✓'));
