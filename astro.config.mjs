import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

export default defineConfig({
  adapter: vercel(),
  site: 'https://www.travel2rescue.de',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap(),
    keystatic(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
