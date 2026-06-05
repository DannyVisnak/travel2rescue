import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

export default defineConfig({
  // NOTE: We tried `edgeMiddleware: true` to run src/middleware.ts on every
  // route (incl. prerendered) — but the @astrojs/vercel adapter bundles
  // Astro's middleware system into a single Edge function that pulls in
  // Node APIs (Buffer, fs, Keystatic, sharp) the Edge runtime doesn't
  // support, and Vercel rejects the deploy.
  //
  // Without it, src/middleware.ts still runs on DYNAMIC routes (API
  // endpoints, /keystatic, etc.) in the Node serverless function. For a
  // true sitewide lock that covers prerendered HTML, use Vercel's
  // dashboard: Settings → Deployment Protection → Vercel Authentication
  // (free on Hobby, one click, no rebuild).
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
