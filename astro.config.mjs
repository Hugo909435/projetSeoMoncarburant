import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { isWeakStation } from './src/utils/station-quality.mjs';

// Date de dernière mise à jour du site (rebuild quotidien des prix carburant).
// Sert de signal de fraîcheur <lastmod> dans le sitemap.
let siteLastmod = new Date();
try {
  const meta = JSON.parse(
    readFileSync(new URL('./src/data/fuel/meta.json', import.meta.url), 'utf-8'),
  );
  if (meta.lastUpdate) siteLastmod = new Date(meta.lastUpdate);
} catch {
  // meta.json absent (avant le 1er fetch) : on garde la date courante.
}

// Pages trop faibles (villes/départements avec < 3 stations) : exclues du sitemap
// et passées en noindex côté page. Recalculé à chaque build (donc « en continu »).
const SITE = 'https://mon-carburant.com';
const WEAK_STATION_THRESHOLD = 3;
const weakUrls = new Set();
try {
  const deps = JSON.parse(
    readFileSync(new URL('./src/data/departments.json', import.meta.url), 'utf-8'),
  );
  const cityDir = new URL('./src/data/fuel/stations-by-city/', import.meta.url);
  for (const f of readdirSync(cityDir)) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(readFileSync(new URL(f, cityDir), 'utf-8'));
    const count = d.count ?? d.stations?.length ?? 0;
    if (count < WEAK_STATION_THRESHOLD && d.citySlug) {
      weakUrls.add(`${SITE}/prix-carburants/ville/${d.citySlug}/`);
    }
  }
  const deptDir = new URL('./src/data/fuel/stations-by-department/', import.meta.url);
  for (const f of readdirSync(deptDir)) {
    if (!f.endsWith('.json')) continue;
    const num = f.replace('.json', '');
    const d = JSON.parse(readFileSync(new URL(f, deptDir), 'utf-8'));
    const count = d.count ?? d.stations?.length ?? 0;
    if (count < WEAK_STATION_THRESHOLD && deps[num]) {
      weakUrls.add(`${SITE}/prix-carburants/${deps[num].slug}/`);
    }
  }
} catch {
  // données absentes : sitemap complet par défaut.
}

// Avant la première vague de pages station, l'annuaire n'a rien à lister. Il est
// déjà rendu en noindex côté page ; le laisser dans le sitemap enverrait deux
// signaux contradictoires, on l'en retire tant qu'il est vide.
try {
  const waves = JSON.parse(
    readFileSync(new URL('./src/data/fuel/station-waves.json', import.meta.url), 'utf-8'),
  );
  // Mêmes échappatoires que src/utils/station-waves.ts, sinon une simulation de
  // date produirait des pages station absentes du sitemap.
  const today = process.env.STATIONS_ROLLOUT_DATE ?? new Date().toISOString().slice(0, 10);
  const anyPublished =
    process.env.STATIONS_ROLLOUT_ALL === '1' ||
    (waves.waves ?? []).some((w) => w.publishAt <= today);
  if (!anyPublished) {
    weakUrls.add(`${SITE}/prix-carburants/stations/`);
  }

  // Fiches station trop pauvres pour être indexées. La page les rend déjà en
  // noindex : les laisser au sitemap enverrait le signal inverse. La règle vient
  // du même module que celui utilisé par la page, elle ne peut donc pas diverger.
  const currentWave = (waves.waves ?? []).reduce(
    (last, w) => (w.publishAt <= today ? w.n : last),
    0,
  );
  const maxWave = process.env.STATIONS_ROLLOUT_ALL === '1' ? (waves.totalWaves ?? 0) : currentWave;

  if (maxWave > 0) {
    const stationDir = new URL('./src/data/fuel/stations-by-department/', import.meta.url);
    let excluded = 0;
    for (const f of readdirSync(stationDir)) {
      if (!f.endsWith('.json')) continue;
      const payload = JSON.parse(readFileSync(new URL(f, stationDir), 'utf-8'));
      for (const station of payload.stations ?? []) {
        const entry = waves.stations?.[String(station.id)];
        if (!entry || entry.wave > maxWave) continue;
        if (isWeakStation(station)) {
          weakUrls.add(`${SITE}/prix-carburants/station/${entry.path}/`);
          excluded++;
        }
      }
    }
    if (excluded > 0) {
      console.log(`[sitemap] ${excluded} fiche(s) station exclue(s) : données insuffisantes.`);
    }
  }
} catch {
  // plan absent : rien à exclure.
}

// Dates réelles des articles (blog + piliers) : le sitemap doit refléter la
// date de publication/mise à jour propre à chaque article plutôt que la date
// de build du site. Un <lastmod> identique sur toutes les URLs à chaque build
// est un signal que Google apprend à ignorer.
// Map "/blog/{slug}/" ou "/piliers/{slug}/" -> Date
const articleLastmods = new Map();
for (const sectionDir of ['blog', 'piliers']) {
  const dir = new URL(`./src/content/${sectionDir}/`, import.meta.url);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const f of files) {
    const raw = readFileSync(new URL(f, dir), 'utf-8');
    const slugMatch = raw.match(/^slug:\s*"?([^"\r\n]+)"?/m);
    const updatedMatch = raw.match(/^updatedAt:\s*"?([^"\r\n]+)"?/m);
    const publishedMatch = raw.match(/^publishedAt:\s*"?([^"\r\n]+)"?/m);
    const dateStr = (updatedMatch ?? publishedMatch)?.[1];
    if (slugMatch && dateStr) {
      articleLastmods.set(`${SITE}/${sectionDir}/${slugMatch[1].trim()}/`, new Date(dateStr.trim()));
    }
  }
}

export default defineConfig({
  site: 'https://mon-carburant.com',
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/auteur/thomas-martin/': '/auteur/hugo-beignon/',
    '/piliers/guide-economiser-carburant/': '/piliers/reduire-facture-carburant/',
    // DOM-TOM sans données (API carburant = métropole uniquement)
    '/prix-carburants/guadeloupe-971/': '/prix-carburants/',
    '/prix-carburants/martinique-972/': '/prix-carburants/',
    '/prix-carburants/guyane-973/': '/prix-carburants/',
    '/prix-carburants/la-reunion-974/': '/prix-carburants/',
    '/prix-carburants/mayotte-976/': '/prix-carburants/',
    // Articles blog inexistants (pattern deviné par Google)
    '/blog/netto-carburant-prix-2026/': '/blog/',
    '/blog/avia-carburant-prix-2026/': '/blog/',
    '/blog/total-carburant-prix-2026/': '/blog/',
    '/blog/shell-carburant-prix-2026/': '/blog/',
    // Article obsolète (opération du 3-4 juillet passée) : contenu repris et
    // tenu à jour dans la page calendrier, qui concentre déjà l'essentiel du
    // trafic sur "carburant prix coûtant".
    '/blog/leclerc-carburant-prix-coutant-juillet-2026/':
      '/blog/prix-coutant-carburant-calendrier-leclerc-intermarche-carrefour/',
  },
  compressHTML: true,
  prefetch: {
    defaultStrategy: 'hover',
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404') && !weakUrls.has(page),
      serialize(item) {
        const articleDate = articleLastmods.get(item.url);
        item.lastmod = (articleDate ?? siteLastmod).toISOString();
        if (item.url === 'https://mon-carburant.com/') {
          item.changefreq = 'daily';
          item.priority = 1.0;
        } else if (item.url.includes('/prix-')) {
          // Pages de prix : mises à jour chaque jour
          item.changefreq = 'daily';
          item.priority = 0.8;
        } else {
          item.changefreq = 'weekly';
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_astro',
    inlineStylesheets: 'always',
  },
});
