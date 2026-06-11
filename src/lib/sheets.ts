// Schickt Formulardaten an ein Google-Apps-Script-Web-App, das sie als Zeile
// in ein Google Sheet schreibt (Script-Vorlage: scripts/google-sheets-webhook.gs).
//
// Bewusst non-fatal: Wenn das Sheet nicht erreichbar ist, darf die Anfrage
// trotzdem durchgehen — die E-Mail über Resend bleibt der primäre Kanal.
// Ohne GOOGLE_SHEETS_WEBHOOK_URL ist die Funktion ein No-op.

export async function appendToSheet(payload: Record<string, string>): Promise<void> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '',
        ...payload,
      }),
      // Apps Script antwortet über einen 302 auf googleusercontent.com
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error('[sheets] webhook responded with', res.status);
    }
  } catch (err) {
    console.error('[sheets] webhook failed', err);
  }
}
