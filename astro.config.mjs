import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mon-carburant.com',
  output: 'static',
  redirects: {
    '/auteur/thomas-martin/': '/auteur/hugo-beignon/',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: '_astro',
  },
});
