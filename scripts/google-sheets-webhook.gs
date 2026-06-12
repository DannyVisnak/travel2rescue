/**
 * Google Apps Script für den Adoptionsformular-Export.
 *
 * Einrichtung (einmalig, ~5 Minuten):
 * 1. Google Sheet anlegen (z.B. "Adoptionsanfragen").
 * 2. Im Sheet: Erweiterungen → Apps Script → diesen Code einfügen.
 * 3. Optional: SECRET unten setzen (gleicher Wert wie GOOGLE_SHEETS_WEBHOOK_SECRET in Vercel).
 * 4. Bereitstellen → Neue Bereitstellung → Typ "Web-App"
 *    → Ausführen als: "Ich" → Zugriff: "Jeder" → Bereitstellen.
 * 5. Die Web-App-URL (endet auf /exec) in Vercel als GOOGLE_SHEETS_WEBHOOK_URL setzen.
 *
 * Die erste Anfrage legt automatisch die Kopfzeile an. Neue Felder im
 * Formular tauchen als neue Spalten NICHT automatisch auf — dafür die
 * Kopfzeile löschen und die nächste Anfrage neu anlegen lassen.
 */

var SECRET = ''; // optional — leer lassen, wenn kein Secret gesetzt ist

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  if (SECRET && data.secret !== SECRET) {
    return ContentService.createTextOutput('forbidden');
  }
  delete data.secret;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var keys = Object.keys(data);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(keys);
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function (h) { return data[h] || ''; }));

  return ContentService.createTextOutput('ok');
}
