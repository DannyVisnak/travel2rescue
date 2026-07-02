import type { APIContext } from 'astro';
import { resend, MAIL_FROM, MAIL_TO, escapeHtml } from '@/lib/email';
import { appendToSheet } from '@/lib/sheets';
import { isRateLimited } from '@/lib/ratelimit';

export const prerender = false;

interface Field {
  label: string;
  name: string;
}

interface Section {
  title: string;
  fields: Field[];
}

const SECTIONS: Section[] = [
  {
    title: 'Hund',
    fields: [{ label: 'Wer hat dein Herz erobert?', name: 'hund' }],
  },
  {
    title: 'Persönliche Daten',
    fields: [
      { label: 'Vor- und Nachname', name: 'name' },
      { label: 'Geburtsdatum', name: 'geburtsdatum' },
      { label: 'Telefon (WhatsApp)', name: 'telefon' },
      { label: 'Adresse', name: 'adresse' },
      { label: 'Beruf', name: 'beruf' },
      { label: 'Arbeitszeiten', name: 'arbeitszeiten' },
    ],
  },
  {
    title: 'Haushalt',
    fields: [
      { label: 'Personen im Haushalt', name: 'personen' },
      { label: 'Kinder?', name: 'kinder' },
      { label: 'Alter der Kinder', name: 'kinder_alter' },
      { label: 'Wohnrecht bei Nachwuchs', name: 'familienplanung' },
      { label: 'Stunden täglich allein', name: 'alleine_stunden' },
      { label: 'Frei nehmen für Eingewöhnung?', name: 'urlaub_freizeit' },
    ],
  },
  {
    title: 'Erfahrung mit Hunden',
    fields: [
      { label: 'Hundeerfahrung?', name: 'erfahrung_hund' },
      { label: 'Erfahrung mit Tierschutz-Hunden?', name: 'erfahrung_tierschutz' },
      { label: 'Erfahrung mit Angsthunden?', name: 'erfahrung_angst' },
      { label: 'Erfahrung mit Jagdinstinkten?', name: 'erfahrung_jagd' },
      { label: 'Erster eigener Hund?', name: 'erster_hund' },
      { label: 'Andere Tiere im Haushalt', name: 'andere_tiere' },
    ],
  },
  {
    title: 'Wohnsituation',
    fields: [
      { label: 'Eigentum oder Miete', name: 'eigentum_miete' },
      { label: 'Lage', name: 'lage' },
      { label: 'Gebäude', name: 'gebaeude' },
      { label: 'Vermieter gefragt?', name: 'vermieter' },
      { label: 'Garten vorhanden?', name: 'garten' },
      { label: 'Garten eingezäunt?', name: 'garten_eingezaeunt' },
      { label: 'Gartenart', name: 'gartenart' },
    ],
  },
  {
    title: 'Alltag mit dem Hund',
    fields: [
      { label: 'Zeit für Betreuung & Auslauf', name: 'zeit_betreuung' },
      { label: 'Wunsch-Alltag', name: 'alltag_beschreibung' },
      { label: 'Schlafplatz', name: 'schlafplatz' },
    ],
  },
  {
    title: 'Bereitschaft & Finanzen',
    fields: [
      { label: 'Hundeschule/Trainer bei Problemen?', name: 'hundeschule' },
      { label: 'Geduld für Eingewöhnung?', name: 'geduld_eingewoehnung' },
      { label: 'Bewusstsein: kein 100%-Verhalten vorhersehbar', name: 'bewusstsein_verhalten' },
      { label: 'Bewusstsein: Straßenhunde-Instinkte', name: 'bewusstsein_instinkte' },
      { label: 'Reisekosten (1.500–2.000 €) tragbar?', name: 'reisekosten' },
      { label: 'Monatliches Budget', name: 'monatliches_budget' },
      { label: 'Unerwartete Tierarztkosten vorbereitet?', name: 'notfallkosten' },
      { label: 'Versicherung geplant?', name: 'versicherung' },
      { label: 'Abholung in Berlin möglich?', name: 'abholung_berlin' },
      { label: 'Hausbesuch ok?', name: 'hausbesuch' },
    ],
  },
];

export async function POST(context: APIContext): Promise<Response> {
  const wantsJson = (context.request.headers.get('accept') || '').includes('application/json');

  if (isRateLimited(context.request, 'adoption')) {
    return respond(context, wantsJson, false, 'Zu viele Anfragen. Bitte versuch es später erneut.', 429);
  }

  if (!resend) {
    console.error('[adoption] RESEND_API_KEY not configured');
    return respond(context, wantsJson, false, 'Mailversand nicht konfiguriert.', 500);
  }

  let data: FormData;
  try {
    data = await context.request.formData();
  } catch {
    return respond(context, wantsJson, false, 'Ungültige Anfrage.', 400);
  }

  if (String(data.get('botcheck') || '').length > 0) {
    return respond(context, wantsJson, true, undefined, 200);
  }

  const name = String(data.get('name') || '').trim();
  const telefon = String(data.get('telefon') || '').trim();
  const hund = String(data.get('hund') || '').trim();

  if (!name || !telefon || !hund) {
    return respond(context, wantsJson, false, 'Pflichtfelder fehlen.', 400);
  }

  // Alle Antworten zusätzlich ins Google Sheet schreiben — VOR dem Mailversand,
  // damit die Daten auch bei einem Resend-Ausfall nicht verloren gehen.
  // Non-fatal: ein Sheet-Fehler blockiert die Anfrage nicht (src/lib/sheets.ts).
  const sheetRow: Record<string, string> = {
    Eingegangen: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Berlin' }),
  };
  for (const section of SECTIONS) {
    for (const field of section.fields) {
      sheetRow[field.label] = String(data.get(field.name) || '').trim();
    }
  }
  await appendToSheet(sheetRow);

  const subject = `Adoptionsanfrage – ${name} für ${hund}`;
  const html = renderAdoptionEmail(data, name, hund);

  try {
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: [MAIL_TO],
      subject,
      html,
    });
    if (error) {
      console.error('[adoption] resend error', error);
      return respond(context, wantsJson, false, 'Versand fehlgeschlagen.', 502);
    }
    return respond(context, wantsJson, true, undefined, 200);
  } catch (err) {
    console.error('[adoption] unexpected error', err);
    return respond(context, wantsJson, false, 'Unerwarteter Fehler.', 500);
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
    return new Response(null, { status: 303, headers: { location: '/danke/?typ=adoption' } });
  }
  let back: URL;
  try {
    back = new URL(context.request.headers.get('referer') || '/adoptieren/formular/', context.url);
  } catch {
    back = new URL('/adoptieren/formular/', context.url);
  }
  back.searchParams.set('error', '1');
  return new Response(null, { status: 303, headers: { location: back.pathname + back.search } });
}

function renderAdoptionEmail(data: FormData, name: string, hund: string): string {
  const sectionsHtml = SECTIONS.map((section) => {
    const rows = section.fields
      .map((field) => {
        const value = String(data.get(field.name) || '').trim();
        if (!value) return '';
        const display = escapeHtml(value).replace(/\n/g, '<br />');
        return `<tr>
          <td style="padding:8px 16px 8px 0;color:#666;font-size:13px;vertical-align:top;width:200px;">${escapeHtml(field.label)}</td>
          <td style="padding:8px 0;color:#111;font-size:14px;">${display}</td>
        </tr>`;
      })
      .filter(Boolean)
      .join('');
    if (!rows) return '';
    return `<section style="margin-bottom:24px;">
      <h2 style="margin:0 0 8px 0;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#F58FB8;border-bottom:1px solid #eee;padding-bottom:6px;">${escapeHtml(section.title)}</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </section>`;
  }).join('');

  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#f5f0e8;font-family:Inter,Helvetica,Arial,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #eee;">
    <header style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1A3D2B;">
      <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#888;">Travel2Rescue · Adoptionsanfrage</p>
      <h1 style="margin:0;font-size:22px;line-height:1.3;color:#1A3D2B;">${escapeHtml(name)} möchte ${escapeHtml(hund)} adoptieren</h1>
    </header>
    ${sectionsHtml}
    <footer style="margin-top:28px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#888;">
      Eingegangen über travel2rescue.de · ${new Date().toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Berlin' })} (Berlin)
    </footer>
  </div>
</body></html>`;
}
