import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

// With output:'server', pages render inside the Vercel function at request
// time — but the function bundle only contains traced JS imports, NOT the
// Keystatic content/ JSON files the reader loads via fs. Without these the
// reader silently returns empty collections / null singletons in production:
// no dogs, no projects, every CMS edit invisible. Force-bundle them.
const keystaticContentFiles = readdirSync('content', { recursive: true })
  .filter((f) => f.endsWith('.json'))
  .map((f) => join('content', f));

// Dynamische SSR-Routen tauchen nicht automatisch in der Sitemap auf —
// die Hunde-Detailseiten (Long-Tail-Conversion-Seiten) müssen explizit rein.
const dogSitemapUrls = readdirSync('content/dogs')
  .filter((f) => f.endsWith('.json'))
  .map((f) => `https://travel2rescue.de/adoptieren/${f.replace(/\.json$/, '')}/`);

export default defineConfig({
  // output: 'server' routes every page through the SSR function so the
  // SITE_PASSWORD middleware can actually gate them. NOTE: Vercel does NOT
  // CDN-cache SSR responses by default (cache-control: max-age=0) — the
  // middleware sets s-maxage=300 on pages, but only while SITE_PASSWORD is
  // unset. Without output:'server', the adapter defaults to static
  // prerendering, and prerendered HTML bypasses Astro middleware entirely —
  // so a password set in Vercel would only protect dynamic API routes.
  output: 'server',
  adapter: vercel({ includeFiles: keystaticContentFiles }),
  // Live-Domain ist die Apex-Domain OHNE www — Kanonicals/Sitemap/JSON-LD
  // müssen auf denselben Host zeigen, sonst meldet Google "canonical is a
  // redirect" für jede Seite.
  site: 'https://travel2rescue.de',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // Alt-URLs der Vorgängerseite. (Die frühere public/_redirects-Datei war
  // Netlify-Syntax — auf Vercel wirkungslos.)
  redirects: {
    '/home': '/',
    '/uber-uns': '/ueber-uns/',
    '/link-tree': '/linktree/',
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
      filter: (page) => !/\/danke\/?$|\/404\/?$|\/impressum\/?$|\/datenschutz\/?$|\/admin-hilfe\/?$/.test(page),
      customPages: dogSitemapUrls,
    }),
    react(),
    keystatic(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
