import type { APIContext } from 'astro';
import { resend, MAIL_FROM, MAIL_TO, escapeHtml, isValidEmail } from '@/lib/email';

export const prerender = false;

// Fotos werden clientseitig auf ~1600px / JPEG komprimiert; dieses Limit ist
// die Notbremse für No-JS-Submits (Vercel kappt Request-Bodies bei 4,5 MB).
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const MAX_PHOTOS = 4;

const REPORT_WHATSAPP = '+62 82342539507';

const FIELDS: Array<{ label: string; name: string }> = [
  { label: 'Name', name: 'name' },
  { label: 'WhatsApp', name: 'whatsapp' },
  { label: 'E-Mail', name: 'email' },
  { label: 'Still with the animal?', name: 'still_with_animal' },
  { label: 'Location (Google Maps)', name: 'location' },
  { label: 'Easy to find again?', name: 'easy_to_find' },
  { label: 'What happened?', name: 'what_happened' },
  { label: 'Condition', name: 'description' },
  { label: 'Urgency', name: 'urgency' },
  { label: 'Other details', name: 'details' },
];

export async function POST(context: APIContext): Promise<Response> {
  const wantsJson = (context.request.headers.get('accept') || '').includes('application/json');

  if (!resend) {
    console.error('[medical-report] RESEND_API_KEY not configured');
    return respond(context, wantsJson, false, 'Mail service not configured.', 500);
  }

  let data: FormData;
  try {
    data = await context.request.formData();
  } catch {
    return respond(context, wantsJson, false, 'Invalid request.', 400);
  }

  if (String(data.get('botcheck') || '').length > 0) {
    return respond(context, wantsJson, true, undefined, 200);
  }

  const name = String(data.get('name') || '').trim();
  const whatsapp = String(data.get('whatsapp') || '').trim();
  const email = String(data.get('email') || '').trim();
  const location = String(data.get('location') || '').trim();
  const whatHappened = String(data.get('what_happened') || '').trim();
  const description = String(data.get('description') || '').trim();
  const urgency = String(data.get('urgency') || '').trim();

  if (!name || !whatsapp || !email || !location || !whatHappened || !description) {
    return respond(context, wantsJson, false, 'Please fill in all required fields.', 400);
  }
  if (!isValidEmail(email)) {
    return respond(context, wantsJson, false, 'Invalid email address.', 400);
  }

  // Fotos sind Pflicht — Eileen braucht Bilder, um Notfälle zu priorisieren.
  const photos = data
    .getAll('photos')
    .filter((p): p is File => p instanceof File && p.size > 0)
    .slice(0, MAX_PHOTOS);
  if (photos.length === 0) {
    return respond(context, wantsJson, false, 'Please attach at least one photo.', 400);
  }
  const totalBytes = photos.reduce((sum, p) => sum + p.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return respond(context, wantsJson, false, 'Photos are too large. Please attach fewer or smaller photos.', 413);
  }

  const attachments = await Promise.all(
    photos.map(async (photo, i) => ({
      filename: photo.name && photo.name !== 'blob' ? photo.name : `photo-${i + 1}.jpg`,
      content: Buffer.from(await photo.arrayBuffer()),
    })),
  );

  const subject = `🆘 Medical Report – ${urgency || 'unbewertet'} – ${name}`;

  try {
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: [MAIL_TO],
      replyTo: email,
      subject,
      html: renderReportEmail(data),
      attachments,
    });
    if (error) {
      console.error('[medical-report] resend error', error);
      return respond(context, wantsJson, false, 'Sending failed. Please contact us via WhatsApp.', 502);
    }

    // Eingangsbestätigung an die meldende Person — non-fatal.
    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to: [email],
        subject: 'We received your report – Travel2Rescue e.V.',
        html: renderConfirmationEmail(name),
      });
    } catch (confirmErr) {
      console.error('[medical-report] confirmation email failed', confirmErr);
    }

    return respond(context, wantsJson, true, undefined, 200);
  } catch (err) {
    console.error('[medical-report] unexpected error', err);
    return respond(context, wantsJson, false, 'Unexpected error.', 500);
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
): Response {
  if (wantsJson) return json(ok ? { ok } : { ok, error }, status);
  if (ok) {
    return new Response(null, { status: 303, headers: { location: '/medical-report/?sent=1' } });
  }
  return new Response(null, { status: 303, headers: { location: '/medical-report/?error=1' } });
}

function renderReportEmail(data: FormData): string {
  const location = String(data.get('location') || '').trim();
  const rows = FIELDS.map(({ label, name }) => {
    const value = String(data.get(name) || '').trim();
    if (!value) return '';
    const display =
      name === 'location' && /^https?:\/\//.test(value)
        ? `<a href="${escapeHtml(value)}">${escapeHtml(value)}</a>`
        : escapeHtml(value).replace(/\n/g, '<br />');
    return `<tr>
      <td style="padding:8px 16px 8px 0;color:#666;font-size:13px;vertical-align:top;width:180px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#111;font-size:14px;">${display}</td>
    </tr>`;
  })
    .filter(Boolean)
    .join('');

  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#f5f0e8;font-family:Inter,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #eee;">
    <header style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #b91c1c;">
      <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">Travel2Rescue · Medical Report</p>
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:#b91c1c;">🆘 ${escapeHtml(String(data.get('urgency') || 'Neuer Notfall-Report'))}</h1>
      ${location && /^https?:\/\//.test(location) ? `<p style="margin:8px 0 0 0;"><a href="${escapeHtml(location)}" style="color:#1A3D2B;font-weight:bold;">📍 Standort auf Google Maps öffnen</a></p>` : ''}
    </header>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <p style="margin:24px 0 0 0;font-size:13px;color:#666;">Fotos hängen an dieser E-Mail. Eingegangen über travel2rescue.de/medical-report · ${new Date().toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Makassar' })} (Lombok)</p>
  </div>
</body></html>`;
}

function renderConfirmationEmail(name: string): string {
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f5f0e8;font-family:Inter,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #eee;">
    <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">Travel2Rescue e.V.</p>
    <h1 style="margin:0 0 16px 0;font-size:20px;color:#1A3D2B;">Thank you for reporting${name ? `, ${escapeHtml(name)}` : ''} 🙏🐾</h1>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">We received your report and will review it as soon as possible. We are a small rescue team with limited resources and receive many reports every day — clear information like yours helps us prioritize the most critical emergencies first.</p>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;"><strong>If the animal is in critical condition, please also call us via WhatsApp: ${REPORT_WHATSAPP}</strong></p>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">Please note: submitting a report does not guarantee immediate rescue, but every report matters.</p>
    <p style="margin:0;font-size:15px;line-height:1.55;">Fynn &amp; Eileen<br /><span style="color:#888;font-size:13px;">Travel2Rescue e.V. · Kuta, Lombok</span></p>
  </div>
</body></html>`;
}
