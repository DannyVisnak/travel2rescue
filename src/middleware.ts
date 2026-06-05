import { defineMiddleware } from 'astro:middleware';

/**
 * Sitewide password lock for the "under construction" window.
 *
 * Activated by the SITE_PASSWORD env var (set it in Vercel). When unset, this
 * middleware is a no-op so production keeps behaving normally.
 *
 * Uses HTTP Basic Auth — the browser's native dialog — because it's the
 * fastest path to a working lock that survives reloads, works on every page
 * (incl. prerendered), and doesn't need a custom login UI we have to maintain.
 *
 * The username field can be anything; only the password is checked. We compare
 * in constant time so the response timing doesn't leak the password length.
 *
 * NOTE: requires `edgeMiddleware: true` on the Vercel adapter (configured in
 * astro.config.mjs) so this runs for prerendered routes too — otherwise it
 * would only fire on dynamic routes and the static HTML would be served
 * directly from the CDN.
 */

const REALM = 'travel2rescue — in Bearbeitung';

// Paths that stay accessible even while the public site is locked.
// Eileen must keep editing via the CMS, monitors must keep pinging health, and
// browsers need icons + manifest for the auth dialog tab.
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

function decodeBase64(s: string): string {
  // atob is available in all Edge runtimes and modern Node.
  return atob(s);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Runtime env var read. `import.meta.env` would be Vite-replaced at build
  // time with the build env's value (none), so the lock would never activate.
  const password = (typeof process !== 'undefined' && process.env.SITE_PASSWORD) || '';
  if (!password) return next();

  const path = new URL(context.request.url).pathname;

  if (PUBLIC_EXACT_PATHS.has(path)) return next();
  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (path === prefix || path.startsWith(prefix + '/') || path.startsWith(prefix)) {
      return next();
    }
  }

  const auth = context.request.headers.get('authorization') ?? '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = decodeBase64(auth.slice(6));
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
