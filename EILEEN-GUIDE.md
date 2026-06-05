# Eileens Handbuch zur Website

Alles, was du brauchst, um Texte und Fotos auf travel2rescue.de selbst zu ändern – ohne Entwickler-Hilfe.

## 1. Einloggen ins Admin-Panel

Geh auf:

**https://travel2rescue.de/keystatic/**

Klick auf **Log in with GitHub** und melde dich mit deinem GitHub-Account an. Beim ersten Mal musst du der App noch erlauben, in unserem Repo Änderungen zu speichern – einfach den Anweisungen folgen.

Bist du drin, siehst du links eine Liste mit allen Bereichen, die du bearbeiten kannst.

## 2. Was kannst du bearbeiten?

| Bereich im Admin | Was du dort änderst |
|---|---|
| 🐾 **Hunde zur Adoption** | Neue Hunde anlegen, Steckbriefe schreiben, Fotos hochladen, "Verfügbar" abhaken wenn vermittelt |
| 🏗️ **Projekte** | Projekttexte, Wirkung, Fotos, Status |
| 📣 **Aktuelles (News)** | Neue Beiträge schreiben, mit Foto und Datum |
| ⚙️ **Statistiken & Kontakt** | Die großen Zahlen (Kastrationen, Futter, Hunde), PayPal-Link, Telefonnummer |
| 🏠 **Startseite** | Hero-Überschrift, Was-wir-tun-Karten, FAQs |
| 🎯 **Mission-Seite** | Die 4 Säulen, Problem-Block, Vision, Zitat |
| 💝 **Helfen-Seite** | Spendenbeträge, Volunteer-Block, FAQs |
| 🤝 **Patenschaft-Seite** | Patenschafts-Pakete, Vorteile, Formular-Texte |
| 🐕 **Adoptions-Seite** | Hero, 6-7-Monate-Block, Zeitstrahl, Vorteile |
| 📖 **Über-uns-Seite** | Hero, Geschichts-Kapitel, Team-Texte |
| 🏗️ **Projekte-Seite** | Hero + Abschluss-Block der Projekte-Seite |
| 👥 **Team – Bios & Fotos** | Eure beiden Profile, Bios, Fotos |
| 🔗 **Linktree-Seite** | Spruch + die ganze Linkliste |
| 🌐 **Footer & Allgemein** | Footer-Text + das wiederkehrende "Wir brauchen Deine Hilfe"-Banner |

**Was du NICHT bearbeiten kannst** (mit Absicht – das ist rechtlich oder technisch sensibel):
- Impressum, Datenschutz (rechtlich heikel – frag bitte den Entwickler)
- Bankverbindung im Footer
- Navigationspunkte oben (die 5 Hauptlinks)
- Die ~30 Fragen im langen Adoptionsformular
- Symbole/Icons auf Karten (die bleiben an ihrer Stelle, du änderst nur den Text drumherum)

## 3. Texte ändern – wichtige Regeln

### Mehrzeilige Überschriften

Wenn du in einer Überschrift einen **Zeilenumbruch** brauchst (also wo der Text in zwei Zeilen umbrechen soll), drücke einfach **Enter** im Textfeld. Wir verwandeln das automatisch in einen Umbruch auf der Website.

Beispiel:
```
Den Kreislauf
durchbrechen.
```

### Überschriften mit farbigem Teil

Viele Überschriften haben einen normalen Teil und einen farbigen (grünen/rosa) Teil – zum Beispiel "Was deine Spende **konkret bewirkt.**" – das fett markierte ist farbig.

Im Admin sind das immer **zwei Felder**:
- "Überschrift" (der normale Teil)
- "Überschrift farbiger Teil" (der farbige Teil)

Schreib in beide getrennt, was gehört wo. Auf der Website setzen wir sie wieder zusammen.

### Anführungszeichen

Schreib `"einfache"` Anführungszeichen oder `„deutsche"`. Beides geht. Für Zitate setzen wir auf einigen Seiten automatisch die deutschen Anführungszeichen drumherum.

### Listen / Karten

Wenn du z.B. die "4 Säulen" auf der Mission-Seite oder die "Drei Wege" auf der Helfen-Seite änderst:
- Reihenfolge: kannst du per Drag-and-Drop ändern
- Karten hinzufügen / löschen: ja, geht
- **Aber:** die Symbole/Icons auf den Karten bleiben in der ursprünglichen Reihenfolge stehen. Wenn du z.B. bei "Drei Wege" die "Spenden"-Karte rausschmeißt und durch was anderes ersetzt, behält die erste Karte trotzdem das Herz-Icon. Frag im Zweifel Danny.

## 4. Fotos hochladen

Bei jedem Foto-Feld kannst du direkt auf "Choose file" klicken und ein Bild von deinem Handy oder Rechner aussuchen. Die Datei landet automatisch in unserem Bilder-Ordner.

**Tipp:** Verwende JPG-Dateien, nicht HEIC (iPhone). Falls deine Fotos zu groß sind (>5 MB), reduziere sie vorher – z.B. mit der iPhone-App "Image Size" oder online auf https://tinypng.com. Faustregel: 1500–2000 Pixel breit ist genug.

## 5. Einen neuen Hund anlegen

1. Im Admin → **🐾 Hunde zur Adoption** → **Create new dog**
2. Felder ausfüllen:
   - **Name**: z.B. "Charlie 🐶" (Emojis erlaubt!)
   - **URL-Kürzel**: wird automatisch erzeugt – muss klein und ohne Sonderzeichen sein (z.B. "charlie")
   - **Alter**: "1 Jahr, 8 Monate" oder "ca. 2 Jahre"
   - **Rasse**: meistens "Mischling"
   - **Kurzbeschreibung**: ein Slogan, eine Zeile – z.B. "Sanfter Riese mit Hundeblick"
   - **Geschichte**: 2–4 Sätze, wie ihr ihn gefunden habt, wie er heute ist
   - **Foto**: hochladen
   - **Verfügbar zur Adoption**: Haken setzen (entfernst du erst, wenn vermittelt)
   - **Status-Tag** (optional): "Sucht Zuhause", "Welpe", "Aktiver Hund"
3. Oben rechts auf **Save** klicken.

Innerhalb von ~30 Sekunden ist der neue Hund live auf der Website.

## 6. Einen Hund als "vermittelt" markieren

1. Im Admin → **🐾 Hunde zur Adoption** → den Hund anklicken
2. Den Haken bei **Verfügbar zur Adoption** entfernen
3. Optional: **Status-Tag** auf "Vermittelt" setzen
4. **Save**

Der Hund verschwindet damit von der Startseite und von der Adoptionsseite, sein Profil bleibt aber erreichbar (für Suchmaschinen und alte Links).

## 7. Einen neuen Aktuelles-Beitrag schreiben

1. Im Admin → **📣 Aktuelles (News)** → **Create new article**
2. Felder:
   - **Titel**: z.B. "Wing NGO Sumatra – Update Juni 2026"
   - **Datum**: heute oder das Datum, das oben stehen soll
   - **Anriss**: 1–2 Sätze, die in der Übersicht angezeigt werden
   - **Text**: der vollständige Artikel – Leerzeilen werden automatisch zu Absätzen
   - **Titelbild**: hochladen
   - **Entwurf**: solange aktiv, sieht ihn niemand außer dir. Haken entfernen wenn er online soll.
3. **Save**

## 8. Was passiert, wenn ich Mist baue?

Keine Panik. Jede Änderung erzeugt automatisch einen "Commit" auf GitHub – wir können also jeden Stand wiederherstellen. Wenn du dich unsicher bist:
1. Mach **Save** trotzdem (man kann nichts kaputtmachen, was nicht zurückzuholen ist)
2. Schreib Danny eine kurze Nachricht ("Ich habe X gemacht und es sieht komisch aus")
3. Wir kommen innerhalb von Minuten an den vorigen Stand zurück

## 9. Was, wenn der Login nicht funktioniert?

Häufigste Ursachen:
- **"Authorization failed"** nach dem Login → der GitHub-App hängt etwas. Den Tab schließen, Cookies löschen für github.com, neu probieren. Wenn das nicht hilft, Danny anpingen.
- **Du siehst nur eine weiße Seite** → einmal Strg+Shift+R (Hard Reload) drücken.
- **Du siehst irgendwo "404"** → die Seite ist gerade vermutlich beim Bauen. 1 Minute warten, neu laden.

## 10. Wer hilft mir?

Danny Visnak (kontakt@visnakovs.de) ist der Entwickler. Schick einfach eine Nachricht mit:
- Was wolltest du machen?
- Was hast du erwartet?
- Was passiert stattdessen?
- (Wenn möglich: ein Screenshot)

Dann finden wir das gemeinsam.

---

Viel Erfolg! 🐾
