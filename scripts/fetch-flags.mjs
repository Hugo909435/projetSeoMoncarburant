// Télécharge les emblèmes (drapeaux / blasons) des régions et départements
// depuis Wikimedia Commons vers public/images/flags/.
// Throttlé pour respecter les limites de Wikimedia. Idempotent : ne retélécharge
// pas un fichier déjà présent et valide.
//
//   node scripts/fetch-flags.mjs            # télécharge ce qui manque
//   node scripts/fetch-flags.mjs --force    # force le retéléchargement

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FORCE = process.argv.includes('--force');

// Chaque entrée : liste de candidats "type|NomDuFichierCommons" essayés dans l'ordre.
// On garde le premier qui renvoie un vrai SVG. type = drapeau | blason
const REGIONS = {
  'bretagne':                 ['drapeau|Flag of Brittany.svg'],
  'corse':                    ['drapeau|Flag of Corsica.svg'],
  'normandie':                ['drapeau|Flag of Normandie.svg'],
  'occitanie':                ['drapeau|Flag of Occitania (with star).svg'],
  'provence-alpes-cote-d-azur': ['drapeau|Flag of Provence-Alpes-Côte d\'Azur.svg', 'drapeau|Flag of Provence.svg'],
  'ile-de-france':            ['drapeau|Flag of Île-de-France.svg', 'blason|Blason région fr Île-de-France.svg', 'blason|Grandes Armes de Paris.svg'],
  'pays-de-la-loire':         ['drapeau|Flag of Pays de la Loire.svg', 'blason|Blason Pays-de-la-Loire.svg'],
  'grand-est':                ['drapeau|Flag of Grand Est.svg', 'blason|Blason région fr Grand Est.svg', 'drapeau|Flag of Alsace.svg'],
  'hauts-de-france':          ['drapeau|Flag of Hauts-de-France.svg', 'blason|Blason région fr Hauts-de-France.svg', 'drapeau|Flag of French Flanders.svg'],
  'nouvelle-aquitaine':       ['drapeau|Flag of Nouvelle-Aquitaine.svg', 'blason|Blason région fr Nouvelle-Aquitaine.svg', 'drapeau|Flag of Aquitaine.svg'],
  'auvergne-rhone-alpes':     ['drapeau|Flag of Auvergne-Rhône-Alpes.svg', 'drapeau|Gonfanon de l\'Auvergne.svg', 'blason|Blason région fr Auvergne-Rhône-Alpes.svg'],
  'bourgogne-franche-comte':  ['drapeau|Flag of Bourgogne-Franche-Comté.svg', 'drapeau|Flag of Franche-Comté.svg', 'blason|Blason region fr Bourgogne-Franche-Comté.svg'],
  'centre-val-de-loire':      ['drapeau|Flag of Centre-Val de Loire.svg', 'blason|Blason région fr Centre-Val de Loire.svg', 'blason|Blason region Centre-Val-de-Loire.svg'],
};

// Départements : drapeau si emblématique, sinon blason "Blason département fr <Nom>.svg"
const DEPARTMENTS = {
  '85': ['drapeau|Flag of Vendée.svg'],                    // drapeau vendéen (demandé)
  '75': ['drapeau|Flag of Paris with coat of arms.svg', 'blason|Blason paris 75.svg', 'drapeau|Flag of Paris.svg'],
  '59': ['blason|Blason département fr Nord.svg'],
  '13': ['blason|Blason département fr Bouches-du-Rhône.svg'],
  '69': ['blason|Blason département fr Rhône.svg'],
  '33': ['blason|Blason département fr Gironde.svg'],
  '62': ['blason|Blason département fr Pas-de-Calais.svg'],
  '92': ['blason|Blason département fr Hauts-de-Seine.svg'],
  '93': ['blason|Blason département fr Seine-Saint-Denis.svg'],
  '78': ['blason|Blason département fr Yvelines.svg'],
  '77': ['blason|Blason département fr Seine-et-Marne.svg'],
  '44': ['blason|Blason département fr Loire-Atlantique.svg'],
  '38': ['blason|Blason département fr Isère.svg'],
  '31': ['blason|Blason département fr Haute-Garonne.svg'],
  '67': ['blason|Blason département fr Bas-Rhin.svg'],
  '34': ['blason|Blason département fr Hérault.svg'],
  '94': ['blason|Blason département fr Val-de-Marne.svg'],
  '91': ['blason|Blason département fr Essonne.svg'],
  '95': ['blason|Blason département fr Val-d\'Oise.svg'],
  '06': ['blason|Blason département fr Alpes-Maritimes.svg'],
  '29': ['blason|Blason département fr Finistère.svg'],
  '83': ['blason|Blason département fr Var.svg'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fileLooksValid(path) {
  try {
    const s = await stat(path);
    if (s.size < 200) return false;
    const head = (await readFile(path, 'utf-8')).slice(0, 200).toLowerCase();
    return (head.includes('<svg') || head.includes('<?xml')) && !head.includes('<!doctype html');
  } catch {
    return false;
  }
}

async function download(filename) {
  const url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(filename);
  for (let attempt = 0; attempt < 6; attempt++) {
    await sleep(2500); // throttle global
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': 'MonCarburant-flag-fetch/1.0 (contact: site)' }, redirect: 'follow' });
    } catch (e) {
      await sleep(3000);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    if (res.status === 404) return null;
    if (!res.ok) { await sleep(4000 * (attempt + 1)); continue; }
    const text = await res.text();
    const head = text.slice(0, 300).toLowerCase();
    if ((head.includes('<svg') || head.includes('<?xml')) && !head.includes('<!doctype html')) {
      return text;
    }
    // Réponse HTML inattendue (page d'erreur / throttle déguisé) : on retente.
    if (head.includes('too many') || head.includes('rate') || head.includes('error')) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    return null;
  }
  return null;
}

async function processGroup(group, subdir, keyLabel) {
  const outDir = join(ROOT, 'public/images/flags', subdir);
  await mkdir(outDir, { recursive: true });
  const results = {};
  for (const [key, candidates] of Object.entries(group)) {
    const outPath = join(outDir, `${key}.svg`);
    if (!FORCE && (await fileLooksValid(outPath))) {
      results[key] = { ok: true, cached: true };
      console.log(`  = ${keyLabel} ${key} (déjà présent)`);
      continue;
    }
    let done = false;
    for (const cand of candidates) {
      const [type, filename] = cand.split('|');
      const svg = await download(filename);
      if (svg) {
        await writeFile(outPath, svg, 'utf-8');
        results[key] = { ok: true, type, source: filename };
        console.log(`  ✓ ${keyLabel} ${key}  [${type}]  ${filename}`);
        done = true;
        break;
      } else {
        console.log(`  · ${keyLabel} ${key}  échec: ${filename}`);
      }
    }
    if (!done) {
      results[key] = { ok: false };
      console.log(`  ✗ ${keyLabel} ${key}  AUCUN candidat valide`);
    }
  }
  return results;
}

console.log('→ Régions');
const regionResults = await processGroup(REGIONS, 'regions', 'région');
console.log('→ Départements');
const deptResults = await processGroup(DEPARTMENTS, 'departments', 'dépt');

const manifest = { regions: regionResults, departments: deptResults };
await writeFile(join(__dirname, 'flag-fetch-report.json'), JSON.stringify(manifest, null, 2));

const fail = [
  ...Object.entries(regionResults).filter(([, v]) => !v.ok).map(([k]) => `région:${k}`),
  ...Object.entries(deptResults).filter(([, v]) => !v.ok).map(([k]) => `dépt:${k}`),
];
console.log('\nRésumé : ' + (fail.length ? `ÉCHECS → ${fail.join(', ')}` : 'tous les emblèmes récupérés ✓'));
