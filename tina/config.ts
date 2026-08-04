import { defineConfig } from 'tinacms';

/**
 * TinaCMS — Vergleichs-Variante zum Keystatic-Admin.
 *
 * Zweck: Eileen soll BEIDE Bedienoberflächen ausprobieren und selbst
 * entscheiden. Der Unterschied ist nicht, was sie ändern kann, sondern WIE:
 *
 *   Keystatic (/keystatic/) — Formular. Speichern, ~1 Minute warten, ansehen.
 *   Tina      (/admin/)     — sie klickt den Text direkt auf der Seite an und
 *                             sieht die Änderung sofort, noch beim Tippen.
 *
 * ⚠️ Beide Systeme lesen und schreiben DIESELBEN Dateien unter content/.
 * Das Schema hier bildet `content/pages/home.json` deshalb VOLLSTÄNDIG ab.
 * Tina schreibt beim Speichern nur die Felder, die es kennt — ein fehlendes
 * Feld würde beim ersten Speichern still aus der Datei fliegen. Wer hier ein
 * Feld ergänzt, muss es auch in keystatic.config.ts ergänzen (und umgekehrt).
 *
 * Die Absatz-Listen (missionBody, storyBody, FAQ-Antworten) sind in beiden
 * Systemen dieselbe Struktur: eine Liste von Markdown-Strings. In Keystatic
 * bearbeitet sie ein Rich-Text-Feld, hier ein einfaches Textfeld pro Absatz —
 * Hinzufügen, Löschen und Sortieren geht in beiden.
 */

const branch =
  process.env.TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

// Absatz-Liste: identische Speicherform wie bei Keystatic (Markdown-Strings).
const paragraphList = (name: string, label: string, description?: string) => ({
  type: 'string' as const,
  name,
  label,
  list: true,
  description:
    description ??
    'Ein Eintrag = ein Absatz. Über „Add" einen Absatz ergänzen, am Griff ziehen zum Sortieren.',
  ui: { component: 'textarea' as const },
});

const heroTextPosition = {
  type: 'string' as const,
  name: 'heroTextPosition',
  label: 'Hero – Textposition',
  description: 'Wo der Text über dem Foto steht. „Rechts" macht links im Foto Platz.',
  options: [
    { value: 'links', label: 'Standard' },
    { value: 'mitte', label: 'Mitte' },
    { value: 'rechts', label: 'Rechts' },
  ],
};

const imageFocus = (name = 'heroImageFocus', label = 'Hero – Bildausschnitt') => ({
  type: 'string' as const,
  name,
  label,
  description: 'Welcher Teil des Fotos sichtbar bleibt, wenn es beschnitten wird.',
  options: [
    { value: 'auto', label: 'Automatisch (wie bisher)' },
    { value: 'mitte', label: 'Mitte' },
    { value: 'links', label: 'Links' },
    { value: 'rechts', label: 'Rechts' },
    { value: 'oben', label: 'Oben' },
    { value: 'unten', label: 'Unten' },
    { value: 'links-oben', label: 'Links oben' },
    { value: 'rechts-oben', label: 'Rechts oben' },
  ],
});

export default defineConfig({
  branch,

  // Aus dem Tina-Cloud-Projekt (kostenlos, 2 Benutzer). Ohne diese Werte
  // läuft nur der lokale Modus — siehe docs/tina-setup.md.
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      // ─── Startseite ─────────────────────────────────────────────────────
      {
        name: 'home',
        label: '🏠 Startseite',
        path: 'content/pages',
        match: { include: 'home' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        fields: [
          // Hero
          { type: 'string', name: 'heroEyebrow', label: 'Hero – kleine Zeile oben' },
          { type: 'string', name: 'heroTitleTop', label: 'Hero – Überschrift Zeile 1' },
          { type: 'string', name: 'heroTitleAccent', label: 'Hero – Überschrift farbige Zeile' },
          { type: 'string', name: 'heroTitleBottom', label: 'Hero – Überschrift Zeile 3' },
          { type: 'string', name: 'heroSub', label: 'Hero – Untertext', ui: { component: 'textarea' } },
          { type: 'image', name: 'heroImage', label: 'Hero – Hintergrundbild' },
          heroTextPosition,
          imageFocus(),

          // Vertrauens-Leiste
          { type: 'string', name: 'trustItems', label: 'Vertrauens-Leiste', list: true },

          // Mission-Teaser
          { type: 'string', name: 'missionEyebrow', label: 'Mission-Teaser – kleine Zeile' },
          { type: 'string', name: 'missionHeadline', label: 'Mission-Teaser – Überschrift', ui: { component: 'textarea' } },
          paragraphList('missionBody', 'Mission-Teaser – Absätze'),
          { type: 'image', name: 'missionImage', label: 'Mission-Teaser – Foto' },

          // Projekte-Teaser
          { type: 'string', name: 'projectsEyebrow', label: 'Projekte-Teaser – kleine Zeile' },
          { type: 'string', name: 'projectsHeadline', label: 'Projekte-Teaser – Überschrift', ui: { component: 'textarea' } },
          { type: 'string', name: 'projectsSub', label: 'Projekte-Teaser – Untertext', ui: { component: 'textarea' } },

          // Geschichte-Teaser
          { type: 'string', name: 'storyEyebrow', label: 'Geschichte – kleine Zeile' },
          { type: 'string', name: 'storyHeadline', label: 'Geschichte – Überschrift', ui: { component: 'textarea' } },
          paragraphList('storyBody', 'Geschichte – Absätze'),
          { type: 'image', name: 'storyImage', label: 'Geschichte – Foto' },
          { type: 'string', name: 'storyPostcard', label: 'Geschichte – Postkarten-Text', ui: { component: 'textarea' } },

          // Was wir tun
          { type: 'string', name: 'servicesEyebrow', label: 'Was wir tun – kleine Zeile' },
          { type: 'string', name: 'servicesHeadline', label: 'Was wir tun – Überschrift', ui: { component: 'textarea' } },
          {
            type: 'object',
            name: 'services',
            label: 'Was wir tun – Karten (Symbole bleiben fest)',
            list: true,
            ui: { itemProps: (item: any) => ({ label: item?.title || 'Karte' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Titel' },
              { type: 'string', name: 'desc', label: 'Beschreibung', ui: { component: 'textarea' } },
            ],
          },

          // Hunde-Teaser
          { type: 'string', name: 'dogsEyebrow', label: 'Hunde-Teaser – kleine Zeile' },
          { type: 'string', name: 'dogsHeadline', label: 'Hunde-Teaser – Überschrift' },
          { type: 'string', name: 'dogsSub', label: 'Hunde-Teaser – Untertext', ui: { component: 'textarea' } },
          { type: 'image', name: 'dogsImage', label: 'Hunde-Teaser – Hintergrundfoto' },

          // Zitat
          { type: 'image', name: 'quoteImage', label: 'Zitat – Hintergrundfoto' },
          { type: 'string', name: 'founderQuote', label: 'Gründer-Zitat', ui: { component: 'textarea' } },

          // FAQ
          { type: 'string', name: 'faqEyebrow', label: 'FAQ – kleine Zeile' },
          { type: 'string', name: 'faqHeadline', label: 'FAQ – Überschrift' },
          {
            type: 'object',
            name: 'homeFaqs',
            label: 'FAQ-Einträge',
            list: true,
            ui: { itemProps: (item: any) => ({ label: item?.question || 'Frage' }) },
            fields: [
              { type: 'string', name: 'question', label: 'Frage' },
              paragraphList('answer', 'Antwort'),
            ],
          },

          // Aufbau der Seite
          {
            type: 'string',
            name: 'sectionOrder',
            label: 'Reihenfolge der Sektionen',
            list: true,
            description: 'Ziehen zum Sortieren. Nicht aufgeführte Sektionen erscheinen am Ende.',
            options: [
              { value: 'mission', label: 'Mission-Teaser' },
              { value: 'services', label: 'Was wir tun' },
              { value: 'projects', label: 'Projekte-Teaser' },
              { value: 'dogs', label: 'Hunde-Teaser' },
              { value: 'story', label: 'Geschichte-Teaser' },
              { value: 'quote', label: 'Gründer-Zitat' },
              { value: 'faq', label: 'FAQ' },
            ],
          },
          { type: 'boolean', name: 'showMission', label: 'Mission-Teaser anzeigen' },
          { type: 'boolean', name: 'showServices', label: '„Was wir tun" anzeigen' },
          { type: 'boolean', name: 'showProjects', label: 'Projekte-Teaser anzeigen' },
          { type: 'boolean', name: 'showDogs', label: 'Hunde-Teaser anzeigen' },
          { type: 'boolean', name: 'showStory', label: 'Geschichte-Teaser anzeigen' },
          { type: 'boolean', name: 'showQuote', label: 'Gründer-Zitat anzeigen' },
          { type: 'boolean', name: 'showFaq', label: 'FAQ anzeigen' },
        ],
      },

      // ─── Hunde ──────────────────────────────────────────────────────────
      {
        name: 'dogs',
        label: '🐾 Hunde zur Adoption',
        path: 'content/dogs',
        format: 'json',
        ui: {
          router: (props: any) => `/adoptieren/${props.document._sys.filename}/`,
        },
        fields: [
          { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true },
          { type: 'image', name: 'image', label: 'Foto' },
          imageFocus('imageFocus', 'Bildausschnitt des Fotos'),
          { type: 'string', name: 'character', label: 'Kurzbeschreibung (1 Zeile)' },
          { type: 'string', name: 'age', label: 'Alter' },
          { type: 'string', name: 'geschlecht', label: 'Geschlecht' },
          { type: 'string', name: 'breed', label: 'Rasse' },
          { type: 'string', name: 'groesse', label: 'Größe' },
          { type: 'string', name: 'gewicht', label: 'Gewicht' },
          { type: 'boolean', name: 'kastriert', label: 'Kastriert' },
          { type: 'boolean', name: 'geimpft', label: 'Geimpft' },
          { type: 'boolean', name: 'gechipt', label: 'Gechipt' },
          paragraphList('story', 'Geschichte'),
          { type: 'boolean', name: 'available', label: 'Verfügbar zur Adoption' },
          { type: 'string', name: 'tag', label: 'Status-Tag' },
        ],
      },
    ],
  },
});
