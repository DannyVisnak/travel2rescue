# TinaCMS — der Vergleichs-Admin

Diese Seite hat aktuell **zwei** Redaktions-Oberflächen. Sie bearbeiten
dieselben Dateien unter `content/` und liefern dieselbe Website aus. Der
Unterschied ist die Bedienung:

| | Keystatic (`/keystatic/`) | Tina (`/admin/`) |
|---|---|---|
| Bedienung | Formular mit beschrifteten Feldern | Klick auf den Text **in der Seite**, Formular daneben |
| Ergebnis sehen | Speichern → ca. 1 Minute warten → Seite neu laden | sofort, schon beim Tippen |
| Handy | gut bedienbar | funktioniert, aber die geteilte Ansicht will einen grösseren Bildschirm |
| Kosten | 0 € | 0 € bis 2 Redakteure (Tina Cloud Free) |
| Aufwand | läuft | Tina-Cloud-Projekt + 2 Variablen (siehe unten) |
| Einrichtung fertig | ja, produktiv | vorbereitet, muss noch scharfgeschaltet werden |

**Der Zweck ist eine Entscheidung, kein Dauerzustand.** Eileen probiert beide
aus, sagt welche sich besser anfühlt — die andere fliegt danach raus. Zwei
CMS dauerhaft parallel zu pflegen wäre unnötiger Ballast.

## Sicherheitsnetz: für Besucher ändert sich nichts

Das war die Bedingung beim Einbau, und sie ist überprüft:

- `npm run dev` und `npm run build` verhalten sich **exakt wie vorher**. Der
  Vercel-Deploy läuft unverändert über Keystatic.
- Das ausgelieferte HTML für normale Besucher ist unverändert — keine
  `data-tina-field`-Attribute, kein Tina-Skript.
- Die Seiten laden ihre Inhalte weiter über den Keystatic-Reader. Nur wenn
  eine Anfrage **aus dem Tina-Admin-Iframe** kommt, wird über Tina geladen.
- Schlägt dabei irgendetwas fehl (fehlende Zugangsdaten, nicht gebaut, kein
  Netz), fällt die Seite still auf den Keystatic-Stand zurück, statt einen
  Fehler zu zeigen. Siehe `src/lib/tina-preview.ts`.

## Bekannter Nachteil: `astro check` läuft nicht mehr

Solange die Tina-Pakete installiert sind, bricht `npm run check`
(`astro check`) mit „JavaScript heap out of memory" ab — auch mit 8 GB Heap.
Ursache ist der Typgraph von `tinacms` (über 1.000 zusätzliche Pakete); ein
`exclude` für `tina/` und `skipLibCheck` (ist im Astro-Preset ohnehin aktiv)
ändern nichts. Nachgewiesen: legt man `node_modules/tinacms` und
`node_modules/@tinacms` beiseite, läuft `astro check` wieder.

Betroffen ist **nur** die Typprüfung:

- `npm run build` läuft normal — der Vercel-Deploy ist nicht betroffen.
- Die Seite selbst funktioniert unverändert.

Trotzdem gehört das auf die Rechnung: Die Typprüfung ist die einzige
automatische Absicherung dieses Projekts (es gibt keine Tests und keinen
Linter). Fällt die Wahl auf Keystatic, verschwindet der Nachteil mit dem
Ausbauen der Pakete. Fällt sie auf Tina, muss dafür eine Lösung her
(z.B. Typprüfung in einem separaten Verzeichnis ohne die Tina-Abhängigkeiten).

## Lokal ausprobieren

```bash
npm run tina:dev     # startet den Tina-Server + Astro zusammen
```

Dann:

- Website: <http://localhost:4321/>
- Tina-Admin: <http://localhost:4321/admin/index.html>
- Keystatic-Admin: <http://localhost:4321/keystatic/>

Im Tina-Admin „🏠 Startseite" öffnen: links die Felder, rechts die echte Seite.
Ein Klick auf die Überschrift in der Vorschau springt zum passenden Feld, und
Tippen ändert die Vorschau sofort. Gespeichert wird in `content/pages/home.json`
— dieselbe Datei, die auch Keystatic schreibt.

Lokal wird ohne Zugangsdaten gearbeitet (Dateisystem-Modus), es ist also kein
Konto nötig, um es sich anzusehen.

## Für Eileen freischalten (damit sie es online testen kann)

Drei Schritte, ca. 10 Minuten:

1. **Tina-Cloud-Projekt anlegen** auf <https://app.tina.io> (kostenlos, 2
   Redakteure), Projekt mit dem GitHub-Repo `DannyVisnak/travel2rescue`
   verbinden. Ergebnis: eine **Client-ID** und ein **Token**.

2. **Zwei Variablen in Vercel setzen** (Project Settings → Environment
   Variables):

   | Variable | Wert |
   |---|---|
   | `PUBLIC_TINA_CLIENT_ID` | die Client-ID aus Tina Cloud |
   | `TINA_TOKEN` | das Token (Read-Only reicht nicht — Schreibrechte nötig) |

3. **Build-Kommando in Vercel umstellen** auf:

   ```
   npm run tina:build && npm run build
   ```

   `tinacms build` erzeugt den Admin unter `public/admin/` und den
   GraphQL-Client. Beides ist bewusst nicht im Repo (siehe `.gitignore`), weil
   `client.ts` einen absoluten Pfad der Build-Maschine enthält.

Danach ist der Tina-Admin unter `https://travel2rescue.de/admin/index.html`
erreichbar. Eileen meldet sich mit E-Mail an, kein GitHub-Konto nötig — das
ist nebenbei ein echter Vorteil gegenüber Keystatic, wo sie einen
GitHub-Account und eine Collaborator-Einladung braucht.

⚠️ Solange `SITE_PASSWORD` gesetzt ist, fragt der Browser beim Öffnen der
Vorschau einmal nach dem Seiten-Passwort.

## Umfang der Vergleichs-Variante

Bewusst **nicht** die ganze Seite, sondern genug zum Beurteilen:

- **🏠 Startseite** — vollständig, inklusive Live-Vorschau und Klick-zum-Bearbeiten
  auf den Hero-Feldern (genau die Stelle, die Eileen verschieben wollte).
- **🐾 Hunde** — alle Felder, mit Vorschau-Verlinkung auf die jeweilige Hundeseite.

Die übrigen Seiten (Mission, Helfen, Adoptieren, Über uns, Linktree, Footer)
sind nur im Keystatic-Admin. Fällt die Wahl auf Tina, werden sie nach dem
gleichen Muster ergänzt — die Schemata liegen in `keystatic.config.ts` bereits
vollständig vor und lassen sich fast eins zu eins übertragen.

## Wichtig beim Weiterbauen

`tina/config.ts` bildet `content/pages/home.json` **vollständig** ab. Das ist
kein Zufall: Tina schreibt beim Speichern nur die Felder, die es kennt — ein
im Schema fehlendes Feld würde beim ersten Speichern still aus der JSON-Datei
verschwinden. **Wer ein Feld in `keystatic.config.ts` ergänzt, muss es auch in
`tina/config.ts` ergänzen**, solange beide Systeme parallel laufen.

Die Absatz-Listen (`missionBody`, `storyBody`, FAQ-Antworten, Hunde-Geschichte)
sind in beiden Systemen dieselbe Struktur: eine Liste von Markdown-Strings.
Keystatic bearbeitet sie mit einem Rich-Text-Feld, Tina mit einem Textfeld pro
Absatz. Hinzufügen, Löschen und Sortieren geht in beiden.

## Wieder ausbauen

Fällt die Wahl auf Keystatic:

```bash
npm uninstall tinacms @tinacms/astro @tinacms/cli
rm -rf tina/ public/admin/ docs/tina-setup.md src/lib/tina-preview.ts
```

Dann in `astro.config.mjs` die `tina()`-Integration entfernen, in
`src/pages/index.astro` den `tinaPreview`-Aufruf durch
`const homeData = await reader.singletons.homeContent.read();` ersetzen und die
`data-tina-field`-Attribute im Hero löschen. Die `tina:*`-Skripte aus
`package.json` nehmen. Danach ist der Stand wieder exakt wie vorher.
