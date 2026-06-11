import type { APIContext } from 'astro';
import { resend, MAIL_FROM, MAIL_TO, escapeHtml, isValidEmail } from '@/lib/email';

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  // Browsers that submit the form natively (JS disabled) don't send
  // Accept: application/json — for those we redirect to /danke/ on success
  // and back to the page with ?error=1 on failure, so users never see raw
  // JSON. Fetch callers always set Accept and get JSON.
  const wantsJson = (context.request.headers.get('accept') || '').includes('application/json');

  if (!resend) {
    console.error('[contact] RESEND_API_KEY not configured');
    return respond(context, wantsJson, false, 'Mailversand nicht konfiguriert.', 500, 'kontakt');
  }

  let data: FormData;
  try {
    data = await context.request.formData();
  } catch {
    return respond(context, wantsJson, false, 'Ungültige Anfrage.', 400, 'kontakt');
  }

  if (String(data.get('botcheck') || '').length > 0) {
    return respond(context, wantsJson, true, undefined, 200, 'kontakt');
  }

  const vorname = String(data.get('vorname') || '').trim();
  const nachname = String(data.get('nachname') || '').trim();
  const email = String(data.get('email') || '').trim();
  const telefon = String(data.get('telefon') || '').trim();
  const betreff = String(data.get('betreff') || '').trim();
  const nachricht = String(data.get('nachricht') || '').trim();
  const subject = String(data.get('subject') || 'Anfrage über travel2rescue.de').trim();

  if (!vorname || !email || !nachricht) {
    return respond(context, wantsJson, false, 'Pflichtfelder fehlen.', 400, 'kontakt');
  }
  if (!isValidEmail(email)) {
    return respond(context, wantsJson, false, 'Ungültige E-Mail-Adresse.', 400, 'kontakt');
  }

  const fullName = [vorname, nachname].filter(Boolean).join(' ');
  const html = renderContactEmail({ fullName, email, telefon, betreff, nachricht });

  try {
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: [MAIL_TO],
      replyTo: email,
      subject: `${subject} – ${fullName}`,
      html,
    });
    if (error) {
      console.error('[contact] resend error', error);
      return respond(context, wantsJson, false, 'Versand fehlgeschlagen.', 502, 'kontakt');
    }
    return respond(context, wantsJson, true, undefined, 200, 'kontakt');
  } catch (err) {
    console.error('[contact] unexpected error', err);
    return respond(context, wantsJson, false, 'Unerwarteter Fehler.', 500, 'kontakt');
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function respond(
  context: APIContext,
  wantsJson: boolean,
  ok: boolean,
  error: string | undefined,
  status: number,
  typ: 'kontakt' | 'adoption',
): Response {
  if (wantsJson) return json(ok ? { ok } : { ok, error }, status);
  if (ok) {
    return new Response(null, { status: 303, headers: { location: `/danke/?typ=${typ}` } });
  }
  const referer = context.request.headers.get('referer');
  const back = referer ? new URL(referer) : new URL('/', context.url);
  back.searchParams.set('error', error ? '1' : '1');
  return new Response(null, { status: 303, headers: { location: back.pathname + back.search } });
}

interface ContactFields {
  fullName: string;
  email: string;
  telefon: string;
  betreff: string;
  nachricht: string;
}

function renderContactEmail(f: ContactFields): string {
  const row = (label: string, value: string) => value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;width:140px;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#111;">${escapeHtml(value)}</td></tr>`
    : '';
  const message = escapeHtml(f.nachricht).replace(/\n/g, '<br />');
  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#f5f0e8;font-family:Inter,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #eee;">
    <h1 style="margin:0 0 4px 0;font-size:20px;">Neue Nachricht über travel2rescue.de</h1>
    <p style="margin:0 0 20px 0;color:#666;font-size:14px;">${escapeHtml(f.fullName)} hat das Kontaktformular ausgefüllt.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row('Name', f.fullName)}
      ${row('E-Mail', f.email)}
      ${row('Telefon', f.telefon)}
      ${row('Betreff', f.betreff)}
    </table>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;">
      <div style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Nachricht</div>
      <div style="font-size:15px;line-height:1.55;">${message}</div>
    </div>
  </div>
</body></html>`;
}
