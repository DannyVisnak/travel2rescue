# Was Claude in dieser Nacht gemacht hat

> Stand: 2026-06-05, ca. 6 Uhr morgens. Alles ist reversibel — `git revert <hash>` an einem beliebigen Commit unten reicht.

## Zwei deploybare Branches zur Auswahl

| Branch | Was drin ist | Wie du es siehst |
|---|---|---|
| **`claude/integration`** | Alle neuen Features in der bestehenden Sage-Grün-Optik. Keine Farbänderungen. | Vercel deployt das auf eine Preview-URL sobald gepusht (ist passiert). |
| **`claude/integration-pink`** | Alles aus `integration` PLUS die Pink-Variante: Header-Schriftzug in Rosa, Buttons rosa, beige Bänder statt dunkelgrün (Pre-Footer-Sektionen). | Eigene Vercel Preview-URL. |

**Mein Vorschlag:** Erst `claude/integration` in eine Preview-Umgebung deployen, anschauen, alles testen. Wenn der Funktionsumfang passt → `main` mergen. Pink ist dann nur noch eine Designentscheidung, die du jederzeit als zweite Iteration drauflegen kannst.

## Was tatsächlich gefixt/gebaut wurde

### 🔴 Kritischer Bug (vorher auf `main` kaputt)
- **Sämtliche CMS-Bilder waren 404**: Hundefotos, Team-Portraits, Projekt-Bilder. Keystatics `reader` setzt `publicPath` für `fields.image` nicht voran. Neuer `src/lib/img.ts` Helper macht das jetzt. Auch als reiner Hotfix auf Branch `claude/fix-images` verfügbar.

### ✉️ Formulare funktionieren (Resend)
- `ContactForm` und das 39-Fragen-Adoptionsformular gehen jetzt über `/api/contact` und `/api/adoption` → Resend → `travel2rescue@gmail.com`
- Content-negotiation: JS-Submits bekommen JSON; Browser-Form-Submits ohne JS landen auf `/danke/?typ=…` (kein roher JSON mehr)
- Anti-Bot-Honeypot bleibt; Adoption-Mail kommt als strukturiertes HTML mit Sections pro Fieldset
- **Du brauchst noch:** `RESEND_API_KEY` in Vercel setzen und `travel2rescue.de` in Resend als Absender-Domain verifizieren (DNS-Records)

### ✏️ Eileen kann jetzt fast jeden Text/Bild der Website selbst editieren
- 8 neue Keystatic-Singletons (`missionContent`, `adoptionContent`, `aboutContent`, `projectsPage`, `linktreeContent`, `patenschaftContent`, `siteContent` + bestehende erweitert)
- 1 neue Collection: `📣 Aktuelles (News)` mit Draft-Flag und optionalem Coverbild
- Jede Seite hat ihren ursprünglichen Text als Inline-Fallback — fehlende/leere CMS-Felder rendern exakt wie vorher
- Eingeführt: `Lines.astro` für mehrzeilige Headings via `\n`
- **Was Eileen NICHT ändern kann** (mit Absicht): Impressum/Datenschutz, Nav-Labels, Bankdaten, die ~30 Screening-Fragen im Adoptionsformular, Icons auf Karten

Die komplette Bedienungsanleitung für Eileen liegt in `EILEEN-GUIDE.md` (deutsch, praktisch, ohne Technik).

### 🆕 Neue Seiten
- `/patenschaft/` — Patenschafts-Landing (Hero, 3 Pakete, 4 Vorteile, Formular, CTA) — voll CMS-editierbar
- `/aktuelles/` + `/aktuelles/[slug]/` — News/Blog mit RSS-Feed `/aktuelles/feed.xml` (im `<head>` verlinkt, NewsArticle JSON-LD)
- `/danke/?typ=kontakt|adoption` — gebrandete Dankesseite (noindex)
- `/404` — gebrandete 404 (vorher gab's keine eigene)

### 🔍 SEO / Discoverability
- Echtes 1200×630 Share Bild `public/og-image.png` (per `npm run og` regenerierbar)
- JSON-LD: Organization (NGO) + WebSite + BreadcrumbList (aus URL) + FAQPage (auf Home/Helfen/Adoptieren) + Article pro Hund + NewsArticle pro Aktuelles-Beitrag
- Per-Hund `og:image` und `og:type=article`
- `robots.txt`, Sitemap (Filter für `/danke/`, `/404`), `site.webmanifest` mit 192/512 Icons

### 🛡️ Sicherheit & Performance (`vercel.json`)
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- Long-Cache-Header für `/images/*` und statische Assets
- Alle Hero-Bilder haben jetzt `width`/`height` + `fetchpriority=high` — eliminiert Layout-Shift (CLS) auf jedem Landing-Surface
- `prefers-reduced-motion`: hört auf User die Animationen abschalten möchten

### 📊 Analytics (opt-in)
- BaseLayout zeigt Plausible-Skript NUR wenn `PUBLIC_PLAUSIBLE_DOMAIN` gesetzt ist
- Privacy-friendly, GDPR-konform, kein Cookie-Banner nötig
- Self-hosted via `PUBLIC_PLAUSIBLE_SRC` einstellbar

### 🔧 Developer-Komfort
- `npm run check` (astro check) — **0 Errors**, 0 Warnings
- `npm run og` — regeneriert das Share-Bild
- `@astrojs/check` + `typescript` als Devdeps
- `README.md` für Entwickler:innen
- `.env.example` als Single Source of Truth
- `/api/health` Endpoint für Uptime-Monitoring

### 🎨 Polish
- Mobile-Menü schließt automatisch bei Klick auf Link oder Escape
- StickyDonation liest jetzt PayPal-URL aus dem CMS und versteckt sich auf `/helfen`, `/patenschaft`, `/danke`, `/keystatic`, `/linktree`, `/404`
- Mehr Beige-Sektionen (nur Pink-Branch) damit der Footer nicht so abrupt nach Dunkel wechselt

## Branch-Übersicht

```
claude/integration         ← alles, neutraler Style; empfohlen zum Anschauen
claude/integration-pink    ← alles + Pink-Theme + Text-Logo + Beige

claude/fix-images          ← nur der kritische Bilder-Bugfix (für sofortigen Hotfix)
claude/resend-forms        ← nur Resend
claude/cms-full-editable   ← nur die CMS-Erweiterung
claude/site-improvements   ← nur SEO/Polish/404/OG
claude/update-colors-logo-CWfb1  ← der ursprüngliche Farb-/Logo-Test
```

## To-Dos für dich, wenn du wach bist

1. **Resend API Key** in Vercel setzen (`RESEND_API_KEY=re_…`) und Domain verifizieren — sonst geben beide Formulare 500 zurück.
2. **Plausible (optional)** — wenn du Analytics willst: Account anlegen, `PUBLIC_PLAUSIBLE_DOMAIN=travel2rescue.de` in Vercel setzen.
3. **Entscheiden:** Pink-Variante oder Grün bleiben? Beide Branches sind preview-bar.
4. **Eileen EILEEN-GUIDE.md schicken** — sie kann dann sofort selbst alles ändern.
5. **Mergen wie du magst** — entweder den großen Integration-Branch oder die einzelnen Feature-Branches einzeln.

## Was bewusst NICHT gemacht wurde

- **Keine Änderungen an Impressum/Datenschutz** — rechtlich heikel, du musst das mit Eileen/Fynn abklären
- **Keine CSP** (Content Security Policy) — birgt Risiko PayPal/Keystatic zu brechen ohne Live-Test
- **Kein Stripe für Patenschaft** — das Formular sammelt Anfragen, die ihr manuell weiterverarbeitet (kann später mit echter monatlicher Buchung erweitert werden)
- **Keine Newsletter-Integration** — du wolltest erstmal Forms+CMS
- **Adoption-Formular-Fragen bleiben hardcoded** — Eileen kann sie nicht ändern, weil das Screening-kritisch ist (siehe CLAUDE.md "Adoption Form — CMS Evaluation")

Alles oben Gelistete ist later-Iterations-Material, falls gewünscht.

Schlaf gut. 🐾
