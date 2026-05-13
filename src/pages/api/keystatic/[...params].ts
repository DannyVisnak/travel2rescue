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

function tryEnv(key: string): string | undefined {
  try {
    return (import.meta.env as Record<string, string | undefined>)[key];
  } catch {
    return undefined;
  }
}

export async function ALL(context: APIContext): Promise<Response> {
  const handler = makeGenericAPIRouteHandler(
    {
      config,
      clientId: tryEnv('KEYSTATIC_GITHUB_CLIENT_ID'),
      clientSecret: tryEnv('KEYSTATIC_GITHUB_CLIENT_SECRET'),
      secret: tryEnv('KEYSTATIC_SECRET'),
    },
    { slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' }
  );

  const { body, headers, status } = await handler(fixRequestUrl(context.request));

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

  return new Response(body, {
    status,
    headers: [...headersMap.entries()].flatMap(([k, vals]) => vals.map(v => [k, v])),
  });
}
