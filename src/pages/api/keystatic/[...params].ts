import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import { parseString } from 'set-cookie-parser';
// @ts-ignore — virtual module registered by the Keystatic Vite plugin
import config from 'virtual:keystatic-config';
import type { APIContext } from 'astro';

export const prerender = false;

// Vercel serverless passes localhost as the hostname in req.url.
// The real host comes via x-forwarded-host. Patch it before Keystatic
// builds the OAuth redirect_uri, otherwise GitHub rejects the callback.
function fixRequestUrl(request: Request): Request {
  const url = new URL(request.url);
  if (url.hostname !== 'localhost') return request;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (!forwardedHost) return request;
  url.hostname = forwardedHost.split(':')[0];
  url.protocol = forwardedProto + ':';
  url.port = '';
  return new Request(url.toString(), request);
}

function envStatus(): Record<string, string> {
  const e = process.env as Record<string, string | undefined>;
  const fmt = (v: string | undefined) => (v ? `set(len=${v.length})` : 'MISSING');
  return {
    KEYSTATIC_GITHUB_CLIENT_ID: fmt(e.KEYSTATIC_GITHUB_CLIENT_ID),
    KEYSTATIC_GITHUB_CLIENT_SECRET: fmt(e.KEYSTATIC_GITHUB_CLIENT_SECRET),
    KEYSTATIC_SECRET: fmt(e.KEYSTATIC_SECRET),
  };
}

export async function ALL(context: APIContext): Promise<Response> {
  const fixed = fixRequestUrl(context.request);
  const fixedUrl = new URL(fixed.url);
  const isOauthCallback = fixedUrl.pathname.includes('/github/oauth/callback');

  if (isOauthCallback) {
    console.log('[ks-debug] callback hit', {
      pathname: fixedUrl.pathname,
      hasCode: fixedUrl.searchParams.has('code'),
      hasState: fixedUrl.searchParams.has('state'),
      githubError: fixedUrl.searchParams.get('error'),
      githubErrorDesc: fixedUrl.searchParams.get('error_description'),
      env: envStatus(),
    });
  }

  // Intercept the GitHub token-exchange fetch so we can see WHY it fails.
  // Keystatic only surfaces "Authorization failed" to the client.
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
        try {
          const bodyText = await res.clone().text();
          console.log('[ks-debug] github token endpoint response', {
            status: res.status,
            body: bodyText.slice(0, 800),
          });
        } catch (err) {
          console.log('[ks-debug] failed to read github token body', err);
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
    ({ body, headers, status } = await handler(fixed));
  } catch (err) {
    console.error(
      '[ks-debug] keystatic handler threw',
      err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err
    );
    if (isOauthCallback) globalThis.fetch = originalFetch;
    return new Response(
      `Keystatic handler error: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500 }
    );
  } finally {
    if (isOauthCallback) globalThis.fetch = originalFetch;
  }

  if (isOauthCallback) {
    console.log('[ks-debug] handler returned', {
      status,
      bodyPreview: typeof body === 'string' ? body.slice(0, 200) : '<non-string-body>',
    });
  }

  // Reproduce the cookie-handling logic from @keystatic/astro's makeHandler
  // so Astro can set cookies properly through its own API.
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
      if ('getSetCookie' in headers && typeof (headers as any).getSetCookie === 'function') {
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
    headers: [...headersMap.entries()].flatMap(([k, vals]) => vals.map(v => [k, v])),
  });
}
