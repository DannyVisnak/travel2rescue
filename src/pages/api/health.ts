import type { APIContext } from 'astro';

export const prerender = false;

/**
 * Lightweight health endpoint for uptime monitors (UptimeRobot, Healthchecks.io,
 * Better Stack, etc.). Returns 200 with a small JSON payload so the monitor can
 * verify both that the SSR function is alive and that the runtime environment
 * has the bits we expect (Resend key present, in production).
 */
export async function GET(_context: APIContext): Promise<Response> {
  const body = {
    ok: true,
    service: 'travel2rescue',
    time: new Date().toISOString(),
    runtime: {
      node: typeof process !== 'undefined' ? process.version : null,
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
    },
    config: {
      resend: Boolean(process.env.RESEND_API_KEY),
      keystaticAuth: Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID),
    },
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
