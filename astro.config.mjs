import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_astro',
  },
});
