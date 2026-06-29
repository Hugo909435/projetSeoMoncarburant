#!/usr/bin/env node
/**
 * Génère src/data/station-brands.json : mapping id_station → {slug, name}
 *
 * Méthode : téléchargement des stations-service France depuis OpenStreetMap
 * (Overpass API, tag "brand"), puis matching géographique avec les stations
 * gouvernementales (public/data/stations-light.json) dans un rayon de 150m.
 *
 * Source marques : OpenStreetMap contributors, licence ODbL
 * Usage : node scripts/fetch-brand-map.js   (1x/semaine suffit)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_FILE = resolve(ROOT, 'src/data/station-brands.json');
const STATIONS_LIGHT = resolve(ROOT, 'public/data/stations-light.json');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const MAX_DIST_M = 150;

const BRAND_MAP = {
  'e.leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'e-leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'e. leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
  'leclerc': { slug: 'leclerc', name: 'E.Leclerc' },
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

function normalizeBrand(raw) {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  if (BRAND_MAP[key]) return BRAND_MAP[key];
  const slug = slugify(key, { lower: true, strict: true });
  return slug ? { slug, name: raw.trim() } : null;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dphi = (lat2 - lat1) * Math.PI / 180;
  const dlambda = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildSpatialIndex(stations) {
  const index = {};
  for (const s of stations) {
    if (s.lat == null || s.lng == null) continue;
    const key = `${Math.floor(s.lat * 10)},${Math.floor(s.lng * 10)}`;
    if (!index[key]) index[key] = [];
    index[key].push(s);
  }
  return index;
}

function findNearest(lat, lng, index) {
  const baseLat = Math.floor(lat * 10);
  const baseLng = Math.floor(lng * 10);
  let best = null;
  let bestDist = MAX_DIST_M;
  for (let dlat = -1; dlat <= 1; dlat++) {
    for (let dlng = -1; dlng <= 1; dlng++) {
      const candidates = index[`${baseLat + dlat},${baseLng + dlng}`] ?? [];
      for (const s of candidates) {
        const d = haversine(lat, lng, s.lat, s.lng);
        if (d < bestDist) { bestDist = d; best = s; }
      }
    }
  }
  return best;
}

async function fetchOsmStations() {
  const query = `[out:json][timeout:120];
area["ISO3166-1"="FR"]["admin_level"="2"]->.fr;
(
  node(area.fr)["amenity"="fuel"]["brand"];
  way(area.fr)["amenity"="fuel"]["brand"];
  relation(area.fr)["amenity"="fuel"]["brand"];
);
out center;`;

  console.log('⬇️  Overpass API — stations OSM France avec marque...');
  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'mon-carburant.com/1.0 (brand-map-builder)',
    },
    signal: AbortSignal.timeout(150000),
  });
  if (!resp.ok) throw new Error(`Overpass: HTTP ${resp.status}`);
  const data = await resp.json();
  const elements = data.elements ?? [];
  console.log(`✅ ${elements.length} éléments OSM reçus`);
  return elements
    .filter(e => e.tags?.brand)
    .map(e => ({
      lat: e.lat ?? e.center?.lat,
      lng: e.lon ?? e.center?.lon,
      brand: e.tags.brand,
    }))
    .filter(e => e.lat != null && e.lng != null);
}

async function main() {
  console.log('\n🗺️  Génération mapping enseigne — ' + new Date().toLocaleString('fr-FR'));

  if (!existsSync(STATIONS_LIGHT)) {
    console.error(`❌ ${STATIONS_LIGHT} introuvable. Lance d'abord : npm run fetch-fuel`);
    process.exit(1);
  }

  const govStations = JSON.parse(readFileSync(STATIONS_LIGHT, 'utf-8'));
  console.log(`📂 ${govStations.length} stations gouvernementales chargées`);

  const spatialIndex = buildSpatialIndex(govStations);

  const osmStations = await fetchOsmStations();
  console.log(`📍 ${osmStations.length} stations OSM avec marque reconnue`);

  console.log('🔗 Matching géographique (rayon ' + MAX_DIST_M + 'm)...');
  const brandMap = {};
  let matched = 0;
  const brandCounts = {};

  for (const osm of osmStations) {
    const nearest = findNearest(osm.lat, osm.lng, spatialIndex);
    if (!nearest) continue;
    const brand = normalizeBrand(osm.brand);
    if (!brand) continue;
    if (!brandMap[nearest.id]) {
      brandMap[nearest.id] = { slug: brand.slug, name: brand.name };
      matched++;
      brandCounts[brand.slug] = (brandCounts[brand.slug] ?? 0) + 1;
    }
  }

  console.log(`\n✅ ${matched} stations matchées (${osmStations.length - matched} sans correspondance)`);
  console.log('📊 Top enseignes identifiées :');
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([slug, n]) => console.log(`   ${slug.padEnd(20)} ${n}`));

  writeFileSync(OUT_FILE, JSON.stringify(brandMap, null, 2));
  console.log(`\n💾 ${OUT_FILE} — ${Object.keys(brandMap).length} stations avec enseigne`);
  console.log('👉 Lance ensuite : npm run fetch-fuel\n');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
