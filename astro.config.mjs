import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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

export default defineConfig({
  site: 'https://mon-carburant.com',
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/auteur/thomas-martin/': '/auteur/hugo-beignon/',
    '/piliers/guide-economiser-carburant/': '/piliers/reduire-facture-carburant/',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404') && !weakUrls.has(page),
      serialize(item) {
        item.lastmod = siteLastmod.toISOString();
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
