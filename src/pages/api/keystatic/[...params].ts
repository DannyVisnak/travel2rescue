import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
// @ts-expect-error — no type definitions shipped
import { parseString } from 'set-cookie-parser';
// @ts-expect-error — virtual module registered by the Keystatic Vite plugin
import config from 'virtual:keystatic-config';
import type { APIContext } from 'astro';

export const prerender = false;

export async function ALL(context: APIContext): Promise<Response> {
  const url = new URL(context.request.url);
  const isOauthCallback = url.pathname.includes('/github/oauth/callback');

  // Wrap fetch only during the OAuth callback flow so a failed token
  // exchange surfaces GitHub's actual error in Vercel logs instead of
  // collapsing into Keystatic's opaque "Authorization failed".
  const originalFetch = globalThis.fetch;
  if (isOauthCallback) {
    globalThis.fetch = (async (input: any, init?: any) => {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input?.url;
      const res = await originalFetch(input, init);
      if (typeof urlStr === 'string' && urlStr.includes('github.com/login/oauth/access_token')) {
        const body = await res.clone().text();
        if (res.status !== 200 || !body.includes('access_token')) {
          console.error('[keystatic] github token exchange failed', {
            status: res.status,
            body: body.slice(0, 500),
          });
        }
      }
      return res;
    }) as typeof fetch;
  }

  let body: unknown, headers: unknown, status: number | undefined;
  try {
    const handler = makeGenericAPIRouteHandler(
      {
        config,
        clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
        clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
        secret: process.env.KEYSTATIC_SECRET,
      },
      { slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' }
    );
    ({ body, headers, status } = await handler(context.request));
  } catch (err) {
    console.error(
      '[keystatic] handler threw',
      err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err
    );
    return new Response(
      `Keystatic handler error: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500 }
    );
  } finally {
    if (isOauthCallback) globalThis.fetch = originalFetch;
  }

  // Reproduce the cookie-handling logic from @keystatic/astro's makeHandler
  // so Astro can set cookies through its own API.
  const headersMap = new Map<string, string[]>();
  if (headers) {
    if (Array.isArray(headers)) {
      for (const [k, v] of headers) {
        const key = k.toLowerCase();
        if (!headersMap.has(key)) headersMap.set(key, []);
        headersMap.get(key)!.push(v);
      }
    } else if (typeof (headers as Headers).entries === 'function') {
      for (const [k, v] of (headers as Headers).entries()) {
        headersMap.set(k.toLowerCase(), [v]);
      }
      if (headers && 'getSetCookie' in (headers as object) && typeof (headers as any).getSetCookie === 'function') {
        const sc = (headers as any).getSetCookie() as string[];
        if (sc?.length) headersMap.set('set-cookie', sc);
      }
    } else {
      for (const [k, v] of Object.entries(headers as Record<string, string>)) {
        headersMap.set(k.toLowerCase(), [v]);
      }
    }
  }

  const setCookieHeaders = headersMap.get('set-cookie');
  headersMap.delete('set-cookie');
  if (setCookieHeaders) {
    for (const raw of setCookieHeaders) {
      const { name, value, ...opts } = parseString(raw);
      const sameSite = opts.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined;
      context.cookies.set(name, value, {
        domain: opts.domain,
        expires: opts.expires,
        httpOnly: opts.httpOnly,
        maxAge: opts.maxAge,
        path: opts.path,
        sameSite: sameSite === 'lax' || sameSite === 'strict' || sameSite === 'none' ? sameSite : undefined,
      });
    }
  }

  return new Response(body as any, {
    status,
    headers: [...headersMap.entries()].flatMap(
      ([k, vals]) => vals.map<[string, string]>((v) => [k, v]),
    ),
  });
}
