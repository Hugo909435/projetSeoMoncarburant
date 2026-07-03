#!/usr/bin/env node
/**
 * Récupération des données carburant depuis l'open data gouvernemental
 * Source : https://donnees.roulez-eco.fr/opendata/jour
 * Licence : Licence Ouverte / Open Licence
 */

import { existsSync, mkdirSync, readdirSync, unlinkSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
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
const BRAND_DIR = resolve(DATA_DIR, 'stations-by-brand');
const PUBLIC_DATA_DIR = resolve(ROOT, 'public/data');
const BRAND_MAP_FILE = resolve(ROOT, 'src/data/station-brands.json');

const SOURCE_URL = 'https://donnees.roulez-eco.fr/opendata/jour';
const CHECK_ONLY = process.argv.includes('--check');

const FUELS = ['Gazole', 'SP95', 'SP98', 'E10', 'E85', 'GPLc'];

// Mapping carburant id → nom
const FUEL_ID_MAP = { '1': 'Gazole', '2': 'SP95', '6': 'SP98', '5': 'E10', '3': 'E85', '4': 'GPLc' };

function slugifyCity(name) {
  return slugify(name, { lower: true, strict: true, locale: 'fr' });
}

// Normalisation des noms d'enseigne issus du XML gouvernemental
const BRAND_MAP = {
  'leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'e.leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'e-leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'e. leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'carrefour': { slug: 'carrefour', name: 'Carrefour' },
  'carrefour market': { slug: 'carrefour', name: 'Carrefour' },
  'carrefour contact': { slug: 'carrefour', name: 'Carrefour' },
  'carrefour express': { slug: 'carrefour', name: 'Carrefour' },
  'intermarché': { slug: 'intermarche', name: 'Intermarché' },
  'intermarche': { slug: 'intermarche', name: 'Intermarché' },
  'total': { slug: 'total', name: 'Total' },
  'totalenergies': { slug: 'total', name: 'Total' },
  'total energies': { slug: 'total', name: 'Total' },
  'total access': { slug: 'total-access', name: 'Total Access' },
  'totalaccess': { slug: 'total-access', name: 'Total Access' },
  'esso': { slug: 'esso', name: 'Esso' },
  'esso express': { slug: 'esso', name: 'Esso' },
  'esso-express': { slug: 'esso', name: 'Esso' },
  'elan': { slug: 'elan', name: 'Élan' },
  'élan': { slug: 'elan', name: 'Élan' },
  'avia': { slug: 'avia', name: 'Avia' },
  'eni': { slug: 'eni', name: 'Eni' },
  'as 24': { slug: 'as24', name: 'AS 24' },
  'as24': { slug: 'as24', name: 'AS 24' },
  'netto': { slug: 'netto', name: 'Netto' },
  'bp': { slug: 'bp', name: 'BP' },
  'shell': { slug: 'shell', name: 'Shell' },
  'costco': { slug: 'costco', name: 'Costco' },
  'géant casino': { slug: 'casino', name: 'Casino' },
  'geant casino': { slug: 'casino', name: 'Casino' },
  'casino': { slug: 'casino', name: 'Casino' },
  'super casino': { slug: 'casino', name: 'Casino' },
  'auchan': { slug: 'auchan', name: 'Auchan' },
  'super u': { slug: 'super-u', name: 'Super U' },
  'hyper u': { slug: 'super-u', name: 'Super U' },
  'u express': { slug: 'super-u', name: 'Super U' },
  'u': { slug: 'super-u', name: 'Super U' },
  'station u': { slug: 'super-u', name: 'Super U' },
  'la station u': { slug: 'super-u', name: 'Super U' },
  'système u': { slug: 'super-u', name: 'Super U' },
  'systeme u': { slug: 'super-u', name: 'Super U' },
  'total contact': { slug: 'total', name: 'Total' },
  'lidl': { slug: 'lidl', name: 'Lidl' },
  'monoprix': { slug: 'monoprix', name: 'Monoprix' },
};

function normalizeEnseigne(raw) {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return BRAND_MAP[key] ?? { slug: slugify(key, { lower: true, strict: true }), name: raw.trim() };
}

function ensureDirs() {
  for (const dir of [DATA_DIR, DEPT_DIR, CITY_DIR, BRAND_DIR, PUBLIC_DATA_DIR]) {
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
    isArray: (name) => ['pdv', 'prix', 'service', 'rupture', 'jour', 'horaire', 'enseigne'].includes(name),
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

function processStations(rawStations, departments, brandMap) {
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

    // Enseigne — source : station-brands.json (généré par fetch-brand-map.js)
    const stationId = String(pdv['@_id']);
    const brand = brandMap[stationId] ?? null;

    // Date de déclaration la plus récente parmi les carburants (issue du flux officiel)
    const majDates = Object.values(priceUpdates).filter(Boolean);
    const maj = majDates.length > 0 ? majDates.sort().at(-1) : null;

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
      enseigne: brand?.name ?? null,
      enseigneSlug: brand?.slug ?? null,
      prices,
      priceUpdates,
      maj,
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
    enseigne: s.enseigne ?? null,
    enseigneSlug: s.enseigneSlug ?? null,
    prices: s.prices,
    maj: s.maj ?? null,
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
    console.log('⚠️  Conservation des données existantes.');
    console.log('FETCH_STATUS=failed');
    if (CHECK_ONLY) {
      process.exit(1);
    } else {
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

  // Charger le mapping enseigne (optionnel — généré par fetch-brand-map.js)
  let brandMap = {};
  if (existsSync(BRAND_MAP_FILE)) {
    brandMap = JSON.parse(readFileSync(BRAND_MAP_FILE, 'utf-8'));
    console.log(`🏷️  Mapping enseigne chargé : ${Object.keys(brandMap).length} stations`);
  } else {
    console.log('ℹ️  Pas de mapping enseigne (lance npm run fetch-brands pour l\'activer)');
  }

  const stations = processStations(rawStations, departments, brandMap);
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

  // Historique des prix nationaux (1 point/jour, fenêtre glissante) pour le graphique de tendance
  const HISTORY_FILE = resolve(DATA_DIR, 'price-history.json');
  const HISTORY_MAX_DAYS = 90;
  const today = new Date().toISOString().slice(0, 10);
  let priceHistory = [];
  if (existsSync(HISTORY_FILE)) {
    try {
      priceHistory = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
    } catch {
      priceHistory = [];
    }
  }
  priceHistory = priceHistory.filter((entry) => entry.date !== today);
  priceHistory.push({ date: today, prices: statsNational });
  priceHistory.sort((a, b) => a.date.localeCompare(b.date));
  if (priceHistory.length > HISTORY_MAX_DAYS) {
    priceHistory = priceHistory.slice(priceHistory.length - HISTORY_MAX_DAYS);
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(priceHistory, null, 2));
  console.log(`📈 Historique des prix : ${priceHistory.length} jour(s) conservé(s)`);

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

  // Fichiers par enseigne
  const byBrand = {};
  for (const s of stations) {
    if (!s.enseigneSlug) continue;
    if (!byBrand[s.enseigneSlug]) byBrand[s.enseigneSlug] = { name: s.enseigne, stations: [] };
    byBrand[s.enseigneSlug].stations.push(s);
  }

  // Purger les anciens fichiers enseigne avant d'écrire les nouveaux
  if (existsSync(BRAND_DIR)) {
    for (const f of readdirSync(BRAND_DIR)) {
      if (f.endsWith('.json')) unlinkSync(resolve(BRAND_DIR, f));
    }
  }

  let brandCount = 0;
  const brandsIndex = [];
  for (const [brandSlug, { name: brandName, stations: sts }] of Object.entries(byBrand)) {
    if (sts.length < 5) continue;

    const brandStats = {};
    for (const fuel of FUELS) {
      const cs = computeStats(sts, fuel);
      brandStats[fuel] = cs;
    }

    const top10 = {};
    for (const fuel of ['Gazole', 'SP95']) {
      top10[fuel] = sts
        .filter(s => s.prices[fuel] != null)
        .sort((a, b) => a.prices[fuel] - b.prices[fuel])
        .slice(0, 10)
        .map(stationToLight);
    }

    const deptsCovered = [...new Set(sts.map(s => s.dep))].sort();

    const payload = {
      slug: brandSlug,
      name: brandName,
      stats: brandStats,
      top10,
      stations: sts.map(stationToLight),
      count: sts.length,
      departments: deptsCovered,
    };

    writeFileSync(resolve(BRAND_DIR, `${brandSlug}.json`), JSON.stringify(payload));
    brandsIndex.push({ slug: brandSlug, name: brandName, count: sts.length });
    brandCount++;
  }

  brandsIndex.sort((a, b) => b.count - a.count);
  writeFileSync(resolve(DATA_DIR, 'brands.json'), JSON.stringify(brandsIndex, null, 2));
  console.log(`🏪 ${brandCount} fichiers enseigne générés`);

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
  console.log('FETCH_STATUS=ok');
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
