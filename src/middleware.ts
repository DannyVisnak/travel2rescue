import { defineMiddleware } from 'astro:middleware';

/**
 * Sitewide password lock for the "under construction" window.
 *
 * Activated by the SITE_PASSWORD env var (set it in Vercel). When unset, this
 * middleware is a no-op so production keeps behaving normally.
 *
 * IMPORTANT — what this currently does and doesn't do:
 *
 * 1) Reads the password at RUNTIME via process.env (not import.meta.env),
 *    so flipping SITE_PASSWORD in Vercel doesn't require a rebuild.
 *
 * 2) NEVER fires during prerendering (context.isPrerendered check). Otherwise
 *    Astro would run this at build time and replace every prerendered page
 *    with the 401 body, leaving the whole site stuck on "enter password" even
 *    after the env var is removed.
 *
 * 3) Without `edgeMiddleware: true` on the Vercel adapter, this only runs for
 *    DYNAMIC routes (API endpoints, /keystatic). The static HTML pages bypass
 *    it. For a true sitewide lock covering prerendered pages, the right tool
 *    is Vercel's Deployment Protection (dashboard → Settings → Deployment
 *    Protection → Vercel Authentication), which is free on Hobby+.
 *
 * 4) The WWW-Authenticate realm is ASCII-only — HTTP header values can't
 *    contain characters > 255, so an em dash in there crashes Response().
 */

const REALM = 'travel2rescue'; // ASCII only — Response() rejects bytes > 255

// Paths that stay accessible even while the public site is locked.
const PUBLIC_PATH_PREFIXES = [
  '/keystatic',
  '/api/keystatic',
  '/api/health',
  '/.well-known',
];
const PUBLIC_EXACT_PATHS = new Set([
  '/favicon.png',
  '/site.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/robots.txt',
]);

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Astro 5 runs middleware during prerendering. If we return a 401 here,
  // that body becomes the prerendered HTML — every page on the site would
  // then serve "enter password" even after SITE_PASSWORD is removed. Skip.
  if (context.isPrerendered) return next();

  // Runtime env var read. `import.meta.env` would be Vite-replaced at build
  // time with the build env's value (usually empty), so the lock would never
  // actually activate even when the var is set in Vercel.
  const password = (typeof process !== 'undefined' && process.env.SITE_PASSWORD) || '';
  if (!password) return next();

  const path = new URL(context.request.url).pathname;

  if (PUBLIC_EXACT_PATHS.has(path)) return next();
  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (path.startsWith(prefix)) return next();
  }

  const auth = context.request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const colonIdx = decoded.indexOf(':');
      const candidate = colonIdx === -1 ? decoded : decoded.slice(colonIdx + 1);
      if (timingSafeEqual(candidate, password)) return next();
    } catch {
      // fall through to 401
    }
  }

  return new Response(
    'Diese Seite ist gerade in Bearbeitung. Bitte gib das Passwort ein.\n',
    {
      status: 401,
      headers: {
        'www-authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        // Keep search engines out while the site is locked.
        'x-robots-tag': 'noindex, nofollow',
      },
    },
  );
});
