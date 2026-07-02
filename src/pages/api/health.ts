import type { APIContext } from 'astro';

export const prerender = false;

/**
 * Lightweight health endpoint for uptime monitors (UptimeRobot, Healthchecks.io,
 * Better Stack, etc.). Returns 200 with a small JSON payload so the monitor can
 * verify both that the SSR function is alive and that the runtime environment
 * has the bits we expect (Resend key present, in production).
 */
export async function GET(_context: APIContext): Promise<Response> {
  // Bewusst minimal: der Endpoint ist öffentlich (vom Site-Lock ausgenommen),
  // Konfigurationsdetails (welche Keys gesetzt sind, Node-Version) wären
  // kostenlose Recon für Angreifer.
  const body = {
    ok: true,
    service: 'travel2rescue',
    time: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
