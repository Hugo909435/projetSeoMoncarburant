// Récupération best-effort des blasons communaux depuis Wikimedia Commons.
// Les villes sans blason trouvé retomberont (côté page) sur le blason de leur
// département. Idempotent : ne retélécharge pas un fichier déjà présent.
//
//   node scripts/fetch-flags-cities.mjs

import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/images/flags/cities');
const cityDir = join(ROOT, 'src/data/fuel/stations-by-city');

const deps = JSON.parse(await readFile(join(ROOT, 'src/data/departments.json'), 'utf-8'));
await mkdir(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(filename) {
  const url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(filename);
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(5000);
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': 'MonCarburant-flag-fetch/1.0' }, redirect: 'follow' });
    } catch {
      await sleep(3000); continue;
    }
    if (res.status === 404) return null;
    if (res.status === 429 || res.status >= 500 || !res.ok) { await sleep(4000 * (attempt + 1)); continue; }
    const text = await res.text();
    const head = text.slice(0, 300).toLowerCase();
    if ((head.includes('<svg') || head.includes('<?xml')) && !head.includes('<!doctype html')) return text;
    if (head.includes('too many') || head.includes('rate')) { await sleep(4000 * (attempt + 1)); continue; }
    return null;
  }
  return null;
}

const files = (await readdir(cityDir)).filter((f) => f.endsWith('.json'));
let done = 0, failed = 0;

for (const file of files) {
  const data = JSON.parse(await readFile(join(cityDir, file), 'utf-8'));
  const { citySlug, cityName, department } = data;
  if (!citySlug || !cityName) continue;
  if (existsSync(join(OUT, `${citySlug}.svg`))) { done++; continue; }
  const deptName = deps[department]?.name;
  const candidates = [
    deptName ? `Blason ville fr ${cityName} (${deptName}).svg` : null,
    `Blason ville fr ${cityName}.svg`,
    `Blason ${cityName}.svg`,
  ].filter(Boolean);

  let ok = false;
  for (const c of candidates) {
    const svg = await download(c);
    if (svg) {
      await writeFile(join(OUT, `${citySlug}.svg`), svg, 'utf-8');
      console.log(`  ✓ ${citySlug}  ←  ${c}`);
      ok = true; done++;
      break;
    }
  }
  if (!ok) { failed++; console.log(`  · ${citySlug} (repli département)`); }
}

console.log(`\nRésumé villes : ${done} blasons communaux, ${failed} sans blason (repli département).`);
