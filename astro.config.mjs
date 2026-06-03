import { readFileSync } from 'node:fs';
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
      filter: (page) => !page.includes('/404'),
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
