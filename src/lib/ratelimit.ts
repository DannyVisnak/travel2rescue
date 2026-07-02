// Einfacher In-Memory-Rate-Limiter für die Formular-API-Routen.
//
// Grenzen des Ansatzes: Vercel-Lambdas teilen keinen Speicher, d.h. das Limit
// gilt pro warmer Instanz — ein verteilter Angreifer wird damit nicht gestoppt,
// aber naive Loops (die realistische Bedrohung: Spam-Relay über die
// Bestätigungsmails + Erschöpfung des Resend-Kontingents) laufen ins Leere.
// Für mehr bräuchte es Turnstile/hCaptcha oder einen externen Store.

const buckets = new Map<string, number[]>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_BUCKETS = 5000; // Speicher-Backstop pro Lambda-Instanz

export function isRateLimited(request: Request, route: string): boolean {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${route}:${ip}`;
  const now = Date.now();

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    buckets.set(key, hits);
    return true;
  }

  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
    }
  }
  return false;
}
