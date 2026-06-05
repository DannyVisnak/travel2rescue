import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

export default defineConfig({
  adapter: vercel(),
  site: 'https://www.travel2rescue.de',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  security: {
    // Trust x-forwarded-host from Vercel so Astro.url.origin reflects the
    // real domain. Without this, request.url is built with hostname
    // "localhost", which breaks Astro's CSRF origin check (403 on
    // /api/keystatic/github/refresh-token/) and forced the manual
    // fixRequestUrl workaround in the keystatic API route.
    allowedDomains: [
      { hostname: 'travel2rescue.de', protocol: 'https' },
      { hostname: 'www.travel2rescue.de', protocol: 'https' },
      { hostname: '**.vercel.app', protocol: 'https' },
    ],
  },
  integrations: [
    sitemap({
      // Keep noindex / utility pages out of the sitemap.
      filter: (page) => !/\/danke\/?$|\/404\/?$/.test(page),
    }),
    react(),
    keystatic(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
