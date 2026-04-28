#!/usr/bin/env node
/**
 * Récupération des données carburant depuis l'open data gouvernemental
 * Source : https://donnees.roulez-eco.fr/opendata/jour
 * Licence : Licence Ouverte / Open Licence
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import slugify from 'slugify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'src/data/fuel');
const DEPT_DIR = resolve(DATA_DIR, 'stations-by-department');
const CITY_DIR = resolve(DATA_DIR, 'stations-by-city');
const PUBLIC_DATA_DIR = resolve(ROOT, 'public/data');

const SOURCE_URL = 'https://donnees.roulez-eco.fr/opendata/jour';
const CHECK_ONLY = process.argv.includes('--check');

const FUELS = ['Gazole', 'SP95', 'SP98', 'E10', 'E85', 'GPLc'];

// Mapping carburant id → nom
const FUEL_ID_MAP = { '1': 'Gazole', '2': 'SP95', '6': 'SP98', '5': 'E10', '3': 'E85', '4': 'GPLc' };

function slugifyCity(name) {
  return slugify(name, { lower: true, strict: true, locale: 'fr' });
}

function ensureDirs() {
  for (const dir of [DATA_DIR, DEPT_DIR, CITY_DIR, PUBLIC_DATA_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

function loadDepartments() {
  const raw = readFileSync(resolve(ROOT, 'src/data/departments.json'), 'utf-8');
  return JSON.parse(raw);
}

function loadTopCities() {
  const raw = readFileSync(resolve(ROOT, 'src/data/top-cities.json'), 'utf-8');
  return JSON.parse(raw);
}

async function downloadZip() {
  console.log(`⬇️  Téléchargement depuis ${SOURCE_URL}...`);
  const resp = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'mon-carburant.com/1.0 (opendata fetch)' },
    signal: AbortSignal.timeout(120000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
  const buf = await resp.arrayBuffer();
  console.log(`✅ Téléchargé ${(buf.byteLength / 1024).toFixed(0)} Ko`);
  return Buffer.from(buf);
}

function parseXml(buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const xmlEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.xml'));
  if (!xmlEntry) throw new Error('Aucun fichier XML trouvé dans le ZIP');

  const xmlBuffer = xmlEntry.getData();
  // Le fichier est encodé en ISO-8859-1
  const decoder = new TextDecoder('iso-8859-1');
  const xmlText = decoder.decode(xmlBuffer);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    isArray: (name) => ['pdv', 'prix', 'service', 'rupture', 'jour', 'horaire'].includes(name),
    allowBooleanAttributes: true,
  });

  const result = parser.parse(xmlText);
  return result?.pdv_liste?.pdv ?? [];
}

function getDepNum(cp) {
  if (!cp) return null;
  const str = String(cp).padStart(5, '0');
  if (str.startsWith('97')) return str.substring(0, 3);
  if (str.startsWith('20')) {
    // Corse : 20xxx → 2A ou 2B selon la commune
    const num = parseInt(str.substring(2), 10);
    return num < 200 ? '2A' : '2B';
  }
  return str.substring(0, 2);
}

function normalizePrice(valeur) {
  if (valeur == null || valeur === '' || valeur === 0) return null;
  const v = Number(valeur);
  if (isNaN(v) || v <= 0) return null;
  // Les prix sont en millièmes d'euro (ex: 1789 = 1.789 €)
  return v > 10 ? Math.round(v) / 1000 : Math.round(v * 1000) / 1000;
}

function processStations(rawStations, departments) {
  const stations = [];

  for (const pdv of rawStations) {
    const cp = String(pdv['@_cp'] ?? '').padStart(5, '0');
    const depNum = getDepNum(cp);
    if (!depNum) continue;

    const dept = departments[depNum];
    if (!dept) continue;

    // Coordonnées GPS (en 1/100000 degrés)
    const latRaw = pdv['@_latitude'];
    const lngRaw = pdv['@_longitude'];
    const lat = latRaw ? latRaw / 100000 : null;
    const lng = lngRaw ? lngRaw / 100000 : null;

    if (!lat || !lng) continue;

    const ville = String(pdv.ville ?? '').trim();
    if (!ville) continue;

    // Prix par carburant
    const prices = {};
    const priceUpdates = {};
    const ruptures = new Set();

    // Ruptures de stock
    if (Array.isArray(pdv.rupture)) {
      for (const r of pdv.rupture) {
        if (!r['@_fin'] || r['@_fin'] === '') {
          const fuelName = FUEL_ID_MAP[String(r['@_id'])] ?? r['@_nom'];
          if (fuelName) ruptures.add(fuelName);
        }
      }
    }

    if (Array.isArray(pdv.prix)) {
      for (const p of pdv.prix) {
        const nom = p['@_nom'];
        if (!FUELS.includes(nom)) continue;
        if (ruptures.has(nom)) continue;
        const price = normalizePrice(p['@_valeur']);
        if (price !== null) {
          prices[nom] = price;
          priceUpdates[nom] = p['@_maj'] ?? null;
        }
      }
    }

    // Services
    const services = [];
    if (pdv.services?.service) {
      const svcList = Array.isArray(pdv.services.service)
        ? pdv.services.service
        : [pdv.services.service];
      services.push(...svcList.map(s => String(s).trim()));
    }

    // Horaires automate 24/24
    const automate = pdv.horaires?.['@_automate-24-24'] === 1 || pdv.horaires?.['@_automate-24-24'] === '1';

    const station = {
      id: String(pdv['@_id']),
      cp,
      ville,
      villeSlug: slugifyCity(ville),
      adresse: String(pdv.adresse ?? '').trim(),
      lat,
      lng,
      dep: depNum,
      depName: dept.name,
      region: dept.region,
      regionSlug: dept.regionSlug,
      pop: pdv['@_pop'] === 'A' ? 'autoroute' : 'route',
      automate,
      services,
      prices,
      priceUpdates,
    };

    stations.push(station);
  }

  return stations;
}

function computeStats(stations, fuel) {
  const prices = stations
    .map(s => s.prices[fuel])
    .filter(p => p != null && p > 0);
  if (prices.length === 0) return null;
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { avg: Math.round(avg * 1000) / 1000, min, max, count: prices.length };
}

function buildNationalStats(stations) {
  const stats = {};
  for (const fuel of FUELS) {
    const s = computeStats(stations, fuel);
    stats[fuel] = s ? s.avg : null;
  }
  return stats;
}

function buildDepStats(stationsByDep) {
  const stats = {};
  for (const [dep, sts] of Object.entries(stationsByDep)) {
    stats[dep] = {};
    for (const fuel of FUELS) {
      const s = computeStats(sts, fuel);
      stats[dep][fuel] = s ? s.avg : null;
    }
  }
  return stats;
}

function buildRegionStats(stations) {
  const byRegion = {};
  for (const s of stations) {
    if (!byRegion[s.regionSlug]) byRegion[s.regionSlug] = { name: s.region, stations: [] };
    byRegion[s.regionSlug].stations.push(s);
  }
  const stats = {};
  for (const [slug, { name, stations: sts }] of Object.entries(byRegion)) {
    stats[slug] = { name };
    for (const fuel of FUELS) {
      const cs = computeStats(sts, fuel);
      stats[slug][fuel] = cs ? cs.avg : null;
    }
  }
  return stats;
}

function stationToLight(s) {
  return {
    id: s.id,
    cp: s.cp,
    ville: s.ville,
    villeSlug: s.villeSlug,
    adresse: s.adresse,
    lat: s.lat,
    lng: s.lng,
    dep: s.dep,
    pop: s.pop,
    prices: s.prices,
  };
}

async function main() {
  console.log('\n🚀 Fetch carburant — ' + new Date().toLocaleString('fr-FR'));

  const departments = loadDepartments();
  const topCities = loadTopCities();
  const topCitySlugs = new Set(topCities.map(c => c.slug));

  let zipBuffer;
  try {
    zipBuffer = await downloadZip();
  } catch (err) {
    console.error('❌ Erreur téléchargement :', err.message);
    // Garder les anciennes données, ne pas écraser
    if (CHECK_ONLY) {
      process.exit(1);
    } else {
      console.log('⚠️  Conservation des données existantes.');
      process.exit(0);
    }
  }

  let rawStations;
  try {
    rawStations = parseXml(zipBuffer);
  } catch (err) {
    console.error('❌ Erreur parsing XML :', err.message);
    process.exit(1);
  }

  console.log(`📊 ${rawStations.length} stations brutes trouvées`);

  if (CHECK_ONLY) {
    console.log('\n✅ Check OK — données accessibles.');
    process.exit(0);
  }

  const stations = processStations(rawStations, departments);
  console.log(`✅ ${stations.length} stations valides après traitement`);

  ensureDirs();

  // Grouper par département
  const byDep = {};
  for (const s of stations) {
    if (!byDep[s.dep]) byDep[s.dep] = [];
    byDep[s.dep].push(s);
  }

  // Grouper par ville-slug pour les top cities
  const byCity = {};
  for (const s of stations) {
    if (!byCity[s.villeSlug]) byCity[s.villeSlug] = [];
    byCity[s.villeSlug].push(s);
  }

  // Stats nationales
  const statsNational = buildNationalStats(stations);
  writeFileSync(resolve(DATA_DIR, 'stats-national.json'), JSON.stringify(statsNational, null, 2));

  // Stats par département
  const statsByDep = buildDepStats(byDep);
  writeFileSync(resolve(DATA_DIR, 'stats-by-department.json'), JSON.stringify(statsByDep, null, 2));

  // Stats par région
  const statsByRegion = buildRegionStats(stations);
  writeFileSync(resolve(DATA_DIR, 'stats-by-region.json'), JSON.stringify(statsByRegion, null, 2));

  // Fichiers par département
  let depCount = 0;
  for (const [dep, sts] of Object.entries(byDep)) {
    const dept = departments[dep];
    if (!dept) continue;

    const depStats = {};
    for (const fuel of FUELS) {
      const cs = computeStats(sts, fuel);
      depStats[fuel] = cs;
    }

    // Top 10 moins chers par carburant
    const top10 = {};
    for (const fuel of ['Gazole', 'SP95']) {
      top10[fuel] = sts
        .filter(s => s.prices[fuel] != null)
        .sort((a, b) => a.prices[fuel] - b.prices[fuel])
        .slice(0, 10)
        .map(stationToLight);
    }

    const payload = {
      num: dep,
      name: dept.name,
      slug: dept.slug,
      region: dept.region,
      regionSlug: dept.regionSlug,
      neighbors: dept.neighbors,
      stats: depStats,
      top10,
      stations: sts.map(stationToLight),
      count: sts.length,
    };

    writeFileSync(resolve(DEPT_DIR, `${dep}.json`), JSON.stringify(payload));
    depCount++;
  }
  console.log(`📁 ${depCount} fichiers département générés`);

  // Fichiers par ville (top cities uniquement)
  let cityCount = 0;
  for (const cityDef of topCities) {
    const citySlugs = [cityDef.slug];
    // Certaines villes ont des slugs dupliqués avec suffixe
    const cityStations = [];
    for (const slug of citySlugs) {
      if (byCity[slug]) cityStations.push(...byCity[slug]);
    }
    // Aussi chercher par code postal / département
    if (cityStations.length === 0 && byDep[cityDef.department]) {
      const depStations = byDep[cityDef.department];
      const nameNorm = slugifyCity(cityDef.name);
      for (const s of depStations) {
        if (s.villeSlug === nameNorm || s.villeSlug.includes(nameNorm.substring(0, 5))) {
          cityStations.push(s);
        }
      }
    }

    if (cityStations.length < 2) continue;

    const cityStats = {};
    for (const fuel of FUELS) {
      const cs = computeStats(cityStations, fuel);
      cityStats[fuel] = cs ? cs.avg : null;
    }

    const sorted = [...cityStations]
      .sort((a, b) => (a.prices.Gazole ?? 99) - (b.prices.Gazole ?? 99))
      .map(stationToLight);

    const payload = {
      citySlug: cityDef.slug,
      cityName: cityDef.name,
      department: cityDef.department,
      stats: cityStats,
      stations: sorted,
      count: cityStations.length,
    };

    writeFileSync(resolve(CITY_DIR, `${cityDef.slug}.json`), JSON.stringify(payload));
    cityCount++;
  }
  console.log(`🏙️  ${cityCount} fichiers ville générés`);

  // stations-light.json pour le composant FuelSearch (max ~5Mo)
  const lightStations = stations.map(stationToLight);
  const lightJson = JSON.stringify(lightStations);
  console.log(`💾 stations-light.json : ${(lightJson.length / 1024).toFixed(0)} Ko`);
  writeFileSync(resolve(PUBLIC_DATA_DIR, 'stations-light.json'), lightJson);

  // meta.json
  const meta = {
    lastUpdate: new Date().toISOString(),
    totalStations: stations.length,
    generatedAt: new Date().toISOString(),
    source: SOURCE_URL,
  };
  writeFileSync(resolve(DATA_DIR, 'meta.json'), JSON.stringify(meta, null, 2));
  writeFileSync(resolve(ROOT, 'last-update.txt'), meta.lastUpdate);

  console.log(`\n✅ Terminé ! ${stations.length} stations, ${depCount} depts, ${cityCount} villes`);
  console.log(`📅 Dernière mise à jour : ${new Date().toLocaleString('fr-FR')}\n`);
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
