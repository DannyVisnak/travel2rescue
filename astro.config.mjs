import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

export default defineConfig({
  // output: 'server' routes every page through the SSR function so the
  // SITE_PASSWORD middleware can actually gate them. Pages still cached
  // hard by Vercel's CDN on a per-URL basis once warm. Without this, the
  // adapter defaults to static prerendering, and prerendered HTML bypasses
  // Astro middleware entirely — so a password set in Vercel would only
  // protect dynamic API routes, not the public site.
  output: 'server',
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
