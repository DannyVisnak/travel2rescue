import { config, collection, fields, singleton } from '@keystatic/core';

// ─── Reusable field helpers ────────────────────────────────────────────────

// Fließtext als Absatz-LISTE: jeder Eintrag ist genau EIN Absatz. Damit kann
// Eileen Absätze hinzufügen, löschen und per Drag & Drop sortieren — das war
// mit den alten festen Feldern (…Text1 / …Text2) nicht möglich.
//
// Technisch wichtig: fields.markdoc.inline ist ein 'assets'-Feld, KEIN
// 'content'-Feld. Der Absatz wird deshalb als Markdown-String direkt in die
// JSON-Datei geschrieben und NICHT in eine separate .mdoc-Datei ausgelagert.
// Separate Content-Dateien würden am `includeFiles`-Bundling vorbeilaufen und
// in der Produktion leer ankommen (siehe CLAUDE.md Quirk 0).
//
// Bewusst NICHT freigeschaltet: Überschriften, Bilder, Trennlinien, Tabellen,
// Code. Die Typografie der Seite soll aus dem Design kommen, nicht aus dem
// Editor — freigegeben sind nur fett, kursiv und Links.
const richParagraphs = (label: string, description?: string) =>
  fields.array(
    fields.markdoc.inline({
      label: 'Absatz',
      options: {
        bold: true,
        italic: true,
        link: true,
        strikethrough: false,
        code: false,
        heading: false,
        blockquote: false,
        orderedList: false,
        unorderedList: false,
        table: false,
        image: false,
        divider: false,
        codeBlock: false,
      },
    }),
    {
      label,
      description:
        description ??
        'Jeder Eintrag ist ein Absatz. Mit „+" einen Absatz hinzufügen, am Griff ziehen zum Sortieren. Text markieren für fett, kursiv oder einen Link.',
    },
  );

// Textposition im Hero. Genau Eileens Wunsch: „Nehmen wir an ich will den Text
// auf Startseite nach rechts positionieren damit man mich auf dem Bild sieht."
// Der Abdunkel-Verlauf hinter dem Text wird automatisch mitgespiegelt.
const heroTextPositionField = (defaultValue: 'links' | 'mitte' | 'rechts' = 'links') =>
  fields.select({
    label: 'Hero – Textposition',
    description:
      'Wo steht der Text über dem Foto? „Rechts" schiebt den Text nach rechts – gut, wenn links im Foto etwas zu sehen sein soll.',
    options: [
      { label: 'Links', value: 'links' },
      { label: 'Mitte', value: 'mitte' },
      { label: 'Rechts', value: 'rechts' },
    ],
    defaultValue,
  });

// Bildausschnitt. „Automatisch" behält den handgesetzten Ausschnitt der Seite —
// nur wenn Eileen aktiv etwas anderes wählt, ändert sich der Bildausschnitt.
const imageFocusField = (label = 'Bildausschnitt') =>
  fields.select({
    label,
    description:
      'Welcher Teil des Fotos soll zu sehen sein, wenn es beschnitten wird? Hilft, wenn Köpfe abgeschnitten werden.',
    options: [
      { label: 'Automatisch (wie bisher)', value: 'auto' },
      { label: 'Mitte', value: 'mitte' },
      { label: 'Links', value: 'links' },
      { label: 'Rechts', value: 'rechts' },
      { label: 'Oben', value: 'oben' },
      { label: 'Unten', value: 'unten' },
      { label: 'Links oben', value: 'links-oben' },
      { label: 'Rechts oben', value: 'rechts-oben' },
    ],
    defaultValue: 'auto',
  });

// Sektion ein-/ausblenden, ohne dass Inhalt verloren geht.
const showSectionField = (label: string) =>
  fields.checkbox({
    label,
    defaultValue: true,
    description: 'Haken entfernen, um diese Sektion auf der Seite auszublenden. Die Texte bleiben erhalten.',
  });

const faqArray = (label: string) =>
  fields.array(
    fields.object({
      question: fields.text({ label: 'Frage' }),
      answer: richParagraphs(
        'Antwort',
        'Die Antwort. Mehrere Absätze möglich – und du kannst Wörter verlinken (z.B. auf Instagram).',
      ),
    }),
    {
      label,
      itemLabel: (props) => props.fields.question.value || 'Frage',
    },
  );

// Jede Singleton-Seite bekommt ihr eigenes Upload-Verzeichnis. Vorher teilten
// sich alle Seiten public/images/ — Keystatic kanonisiert Dateien beim
// Speichern auf <directory>/<feldpfad>.<ext> und VERSCHIEBT sie dorthin.
// Mit geteiltem Verzeichnis hat das (a) Dateien umbenannt, die andere Seiten
// referenzieren (Juni 2026: Mission-Save zerbrach Projekt-/Helfen-Bilder),
// und (b) kollidierten gleichnamige Felder (home.heroImage vs mission.heroImage).
const sectionImage = (scope: string) => (label: string, description?: string) =>
  fields.image({
    label,
    directory: `public/images/${scope}`,
    publicPath: `/images/${scope}/`,
    description: description ?? 'Foto direkt hier hochladen – kein GitHub nötig',
  });

export default config({
  storage: process.env.NODE_ENV === 'production'
    ? { kind: 'github', repo: { owner: 'DannyVisnak', name: 'travel2rescue' } }
    : { kind: 'local' },

  // `url` isn't in the public Keystatic config type but is read at runtime
  // by the admin UI to build absolute links; cast keeps type checking quiet.
  ...({ url: process.env.NODE_ENV === 'production'
    ? 'https://travel2rescue.de'
    : 'http://localhost:4321' } as { url: string }),

  ui: {
    brand: { name: 'Travel2Rescue Admin' },
  },

  // ─── Singletons (einmalige Inhalte) ───────────────────────────────────────
  singletons: {
    settings: singleton({
      label: '⚙️ Statistiken & Kontakt',
      path: 'content/settings',
      format: { data: 'json' },
      schema: {
        statsKastrationen: fields.text({
          label: 'Statistik: Kastrationen',
          description: 'Anzahl der durchgeführten Kastrationen, z.B. 2.500+',
        }),
        statsFutter: fields.text({
          label: 'Statistik: Futter verteilt',
          description: 'Gesamtmenge, z.B. 3,7 t',
        }),
        statsOperiert: fields.text({
          label: 'Statistik: Hunde monatlich operiert',
          description: 'z.B. 100+',
        }),
        paypalUrl: fields.text({
          label: 'PayPal-Spendenlink',
          description: 'Vollständiger https://… Link aus deinem PayPal-Konto',
        }),
        phone: fields.text({
          label: 'WhatsApp / Telefon (öffentlich)',
          description: 'z.B. +62 853-5380-7785',
        }),
      },
    }),

    homeContent: singleton({
      label: '🏠 Startseite',
      path: 'content/pages/home',
      format: { data: 'json' },
      schema: {
        // Hero
        heroEyebrow: fields.text({
          label: 'Hero – kleine Zeile oben',
          description: 'Die kleine Zeile über der grossen Überschrift',
        }),
        heroTitleTop: fields.text({ label: 'Hero – Überschrift Zeile 1', description: 'z.B. 50.000' }),
        heroTitleAccent: fields.text({ label: 'Hero – Überschrift farbige Zeile', description: 'z.B. Straßenhunde.' }),
        heroTitleBottom: fields.text({ label: 'Hero – Überschrift Zeile 3', description: 'z.B. Nur wir sehen hin.' }),
        heroSub: fields.text({
          label: 'Hero – Untertext',
          multiline: true,
          description: 'Text unter der Überschrift',
        }),
        heroImage: sectionImage('home')('Hero – Hintergrundbild'),
        heroTextPosition: heroTextPositionField(),
        heroImageFocus: imageFocusField('Hero – Bildausschnitt'),

        // Trust strip
        trustItems: fields.array(fields.text({ label: 'Eintrag' }), {
          label: 'Vertrauens-Leiste (kleine Punkte unter dem Hero)',
          itemLabel: (props) => props.value || 'Eintrag',
        }),

        // Mission-Teaser
        missionEyebrow: fields.text({ label: 'Mission-Teaser – kleine Zeile' }),
        missionHeadline: fields.text({ label: 'Mission-Teaser – Überschrift', multiline: true }),
        missionBody: richParagraphs('Mission-Teaser – Absätze'),
        missionImage: sectionImage('home')('Mission-Teaser – Foto (rechte Seite)'),

        // Projekte-Teaser
        projectsEyebrow: fields.text({ label: 'Projekte-Teaser – kleine Zeile' }),
        projectsHeadline: fields.text({ label: 'Projekte-Teaser – Überschrift', multiline: true }),
        projectsSub: fields.text({ label: 'Projekte-Teaser – Untertext', multiline: true }),

        // Über-uns Teaser
        storyEyebrow: fields.text({ label: 'Geschichte – kleine Zeile' }),
        storyHeadline: fields.text({ label: 'Geschichte – Überschrift', multiline: true }),
        storyBody: richParagraphs('Geschichte – Absätze'),
        storyImage: sectionImage('home')('Geschichte – Foto'),
        storyPostcard: fields.text({ label: 'Geschichte – Postkarten-Text (auf dem Foto)', multiline: true }),

        // Was wir tun
        servicesEyebrow: fields.text({ label: 'Was wir tun – kleine Zeile' }),
        servicesHeadline: fields.text({ label: 'Was wir tun – Überschrift', multiline: true }),
        services: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          {
            label: 'Was wir tun – Karten (4 Stück, Symbole bleiben fest)',
            itemLabel: (props) => props.fields.title.value || 'Karte',
          },
        ),

        // Adoptions-Teaser
        dogsEyebrow: fields.text({ label: 'Hunde-Teaser – kleine Zeile' }),
        dogsHeadline: fields.text({ label: 'Hunde-Teaser – Überschrift' }),
        dogsSub: fields.text({ label: 'Hunde-Teaser – Untertext', multiline: true }),
        dogsImage: sectionImage('home')('Hunde-Teaser – grosses Hintergrundfoto'),

        // Zitat
        quoteImage: sectionImage('home')('Zitat – Hintergrundfoto'),
        founderQuote: fields.text({
          label: 'Gründer-Zitat',
          multiline: true,
          description: 'Das grosse Zitat. Anführungszeichen werden automatisch gesetzt.',
        }),

        // FAQ
        faqEyebrow: fields.text({ label: 'FAQ – kleine Zeile' }),
        faqHeadline: fields.text({ label: 'FAQ – Überschrift' }),
        homeFaqs: faqArray('FAQ-Einträge (Startseite)'),

        // ─── Aufbau der Seite ────────────────────────────────────────────
        // Reihenfolge und Sichtbarkeit der Sektionen. Hero, Vertrauens-Leiste,
        // Statistiken und das Spenden-Banner bleiben bewusst fest verankert.
        sectionOrder: fields.array(
          fields.select({
            label: 'Sektion',
            options: [
              { label: 'Mission-Teaser', value: 'mission' },
              { label: 'Was wir tun', value: 'services' },
              { label: 'Projekte-Teaser', value: 'projects' },
              { label: 'Hunde-Teaser', value: 'dogs' },
              { label: 'Geschichte-Teaser', value: 'story' },
              { label: 'Gründer-Zitat', value: 'quote' },
              { label: 'FAQ', value: 'faq' },
            ],
            defaultValue: 'mission',
          }),
          {
            label: 'Reihenfolge der Sektionen',
            description:
              'Am Griff ziehen, um die Reihenfolge auf der Startseite zu ändern. Nicht aufgeführte Sektionen erscheinen automatisch am Ende.',
            itemLabel: (props) => props.value || 'Sektion',
          },
        ),
        showMission: showSectionField('Mission-Teaser anzeigen'),
        showServices: showSectionField('„Was wir tun" anzeigen'),
        showProjects: showSectionField('Projekte-Teaser anzeigen'),
        showDogs: showSectionField('Hunde-Teaser anzeigen'),
        showStory: showSectionField('Geschichte-Teaser anzeigen'),
        showQuote: showSectionField('Gründer-Zitat anzeigen'),
        showFaq: showSectionField('FAQ anzeigen'),
      },
    }),

    missionContent: singleton({
      label: '🎯 Mission-Seite',
      path: 'content/pages/mission',
      format: { data: 'json' },
      schema: {
        heroEyebrow: fields.text({ label: 'Hero – kleine Zeile' }),
        heroTitle: fields.text({ label: 'Hero – Überschrift', multiline: true }),
        heroTitleAccent: fields.text({ label: 'Hero – Überschrift farbiger Teil' }),
        heroSub: fields.text({ label: 'Hero – Untertext', multiline: true }),
        heroImage: sectionImage('mission')('Hero – Hintergrundbild'),
        heroTextPosition: heroTextPositionField('mitte'),
        heroImageFocus: imageFocusField('Hero – Bildausschnitt'),

        introEyebrow: fields.text({ label: 'Intro – kleine Zeile' }),
        introHeadline: fields.text({ label: 'Intro – Überschrift', multiline: true }),
        introBody: richParagraphs(
          'Intro – Absätze',
          'Freier Text direkt vor den Problem-Karten — hier kannst du in eigenen Worten erzählen, worum es geht. Beliebig viele Absätze.',
        ),

        problemEyebrow: fields.text({ label: 'Problem – kleine Zeile' }),
        problemHeadline: fields.text({ label: 'Problem – Überschrift', multiline: true }),
        problems: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
            solution: fields.text({ label: 'Unsere Lösung', multiline: true }),
            image: sectionImage('mission')('Foto'),
          }),
          {
            label: 'Problem – Karten',
            itemLabel: (props) => props.fields.title.value || 'Karte',
          },
        ),

        quote: fields.text({ label: 'Zitat', multiline: true }),
        quoteAuthor: fields.text({ label: 'Zitat – Autor' }),

        pillarsEyebrow: fields.text({ label: 'Säulen – kleine Zeile' }),
        pillarsHeadline: fields.text({ label: 'Säulen – Überschrift', multiline: true }),
        pillarsSub: fields.text({ label: 'Säulen – Untertext', multiline: true }),
        pillars: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
            stat: fields.text({ label: 'Statistik-Zahl' }),
            statLabel: fields.text({ label: 'Statistik-Bezeichnung' }),
            image: sectionImage('mission')('Foto'),
          }),
          {
            label: 'Die vier Säulen',
            itemLabel: (props) => props.fields.title.value || 'Säule',
          },
        ),

        catsEyebrow: fields.text({ label: 'Katzen – kleine Zeile' }),
        catsHeadline: fields.text({ label: 'Katzen – Überschrift', multiline: true }),
        catsBody: richParagraphs('Katzen – Absätze'),
        catsLinkLabel: fields.text({ label: 'Katzen – Button-Text' }),
        catsImage: sectionImage('mission')('Katzen – Foto'),

        visionEyebrow: fields.text({ label: 'Vision – kleine Zeile' }),
        visionHeadline: fields.text({ label: 'Vision – Überschrift', multiline: true }),
        visionBody: richParagraphs('Vision – Absätze'),
        visionButton: fields.text({ label: 'Vision – Button-Text' }),
      },
    }),

    helpContent: singleton({
      label: '💝 Helfen-Seite',
      path: 'content/pages/help',
      format: { data: 'json' },
      schema: {
        heroEyebrow: fields.text({ label: 'Hero – kleine Zeile' }),
        heroTitle: fields.text({ label: 'Hero – Überschrift', multiline: true }),
        heroTitleAccent: fields.text({ label: 'Hero – Überschrift farbiger Teil' }),
        heroSub: fields.text({ label: 'Hero – Untertext', multiline: true }),
        heroImage: sectionImage('help')('Hero – Hintergrundbild'),
        heroTextPosition: heroTextPositionField(),
        heroImageFocus: imageFocusField('Hero – Bildausschnitt'),

        tiersEyebrow: fields.text({ label: 'Spenden-Beträge – kleine Zeile' }),
        tiersHeadline: fields.text({ label: 'Spenden-Beträge – Überschrift', multiline: true }),
        tiersSub: fields.text({ label: 'Spenden-Beträge – Untertext', multiline: true }),
        donationTiers: fields.array(
          fields.object({
            amount: fields.integer({ label: 'Betrag in €' }),
            impact: fields.text({ label: 'Wirkung', multiline: true }),
          }),
          {
            label: 'Spenden-Beträge (Karten)',
            itemLabel: (props) => (props.fields.amount.value ? `€${props.fields.amount.value}` : 'Betrag'),
          },
        ),

        waysEyebrow: fields.text({ label: 'Drei Wege – kleine Zeile' }),
        waysHeadline: fields.text({ label: 'Drei Wege – Überschrift', multiline: true }),
        ways: fields.array(
          fields.object({
            label: fields.text({ label: 'Nummer/Label, z.B. 01 · Spenden' }),
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
            image: sectionImage('help')('Foto'),
          }),
          {
            label: 'Drei Wege (Karten)',
            itemLabel: (props) => props.fields.title.value || 'Karte',
          },
        ),

        volunteerEyebrow: fields.text({ label: 'Volunteer – kleine Zeile' }),
        volunteerHeadline: fields.text({ label: 'Volunteer – Überschrift', multiline: true }),
        volunteerBody: richParagraphs('Volunteer – Absätze'),
        volunteerTasks: fields.array(fields.text({ label: 'Aufgabe' }), {
          label: 'Volunteer – Aufgaben (Symbole bleiben fest)',
          itemLabel: (props) => props.value || 'Aufgabe',
        }),
        volunteerImage: sectionImage('help')('Volunteer – Foto'),

        adoptStepsEyebrow: fields.text({ label: 'Adoptions-Weg – kleine Zeile' }),
        adoptStepsHeadline: fields.text({ label: 'Adoptions-Weg – Überschrift', multiline: true }),
        adoptStepsAccent: fields.text({ label: 'Adoptions-Weg – Überschrift farbiger Teil' }),
        adoptSteps: fields.array(fields.text({ label: 'Schritt' }), {
          label: 'Adoptions-Weg – Schritte',
          itemLabel: (props) => props.value || 'Schritt',
        }),
        adoptStepsImage: sectionImage('help')('Adoptions-Weg – Foto'),

        faqEyebrow: fields.text({ label: 'FAQ – kleine Zeile' }),
        faqHeadline: fields.text({ label: 'FAQ – Überschrift' }),
        helpFaqs: faqArray('FAQ Helfen-Seite'),
        adoptionFaqs: faqArray('FAQ Adoptions-Seite'),
      },
    }),

    adoptionContent: singleton({
      label: '🐕 Adoptions-Seite',
      path: 'content/pages/adoption',
      format: { data: 'json' },
      schema: {
        heroEyebrow: fields.text({ label: 'Hero – kleine Zeile' }),
        heroTitle: fields.text({ label: 'Hero – Überschrift', multiline: true }),
        heroTitleAccent: fields.text({ label: 'Hero – Überschrift farbiger Teil' }),
        heroSub: fields.text({ label: 'Hero – Untertext', multiline: true }),
        heroImage: sectionImage('adoption')('Hero – Hintergrundbild'),
        heroTextPosition: heroTextPositionField(),
        heroImageFocus: imageFocusField('Hero – Bildausschnitt'),

        commitmentEyebrow: fields.text({ label: 'Dauer-Block – kleine Zeile' }),
        commitmentText: fields.text({ label: 'Dauer-Block – grosser Text', multiline: true }),
        commitmentAccent: fields.text({ label: 'Dauer-Block – farbiger Teil, z.B. 6–7 Monate.' }),
        commitmentSub: fields.text({ label: 'Dauer-Block – Untertext', multiline: true }),
        commitmentBadge: fields.text({ label: 'Dauer-Block – Hinweis-Badge', multiline: true }),
        timeline: fields.array(
          fields.object({
            nummer: fields.text({ label: 'Nummer, z.B. 01' }),
            title: fields.text({ label: 'Titel' }),
            duration: fields.text({ label: 'Zeitraum, z.B. Wochen 1–2' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          {
            label: 'Zeitstrahl (4 Schritte)',
            itemLabel: (props) => props.fields.title.value || 'Schritt',
          },
        ),

        dogsEyebrow: fields.text({ label: 'Hunde – kleine Zeile' }),
        dogsHeadline: fields.text({ label: 'Hunde – Überschrift', multiline: true }),
        dogsHeadlineAccent: fields.text({ label: 'Hunde – Überschrift farbiger Teil' }),
        dogsSub: fields.text({ label: 'Hunde – Untertext', multiline: true }),

        benefitsEyebrow: fields.text({ label: 'Vorteile – kleine Zeile' }),
        benefitsHeadline: fields.text({ label: 'Vorteile – Überschrift', multiline: true }),
        benefitsHeadlineAccent: fields.text({ label: 'Vorteile – Überschrift farbiger Teil' }),
        benefitsSub: fields.text({ label: 'Vorteile – Untertext', multiline: true }),
        benefitsImage: sectionImage('adoption')('Vorteile – Foto'),
        benefits: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          {
            label: 'Vorteile (Punkte)',
            itemLabel: (props) => props.fields.title.value || 'Punkt',
          },
        ),

        formEyebrow: fields.text({ label: 'Anfrage – kleine Zeile' }),
        formHeadline: fields.text({ label: 'Anfrage – Überschrift', multiline: true }),
        formHeadlineAccent: fields.text({ label: 'Anfrage – Überschrift farbiger Teil' }),
        formSub: fields.text({ label: 'Anfrage – Untertext', multiline: true }),
      },
    }),

    aboutContent: singleton({
      label: '📖 Über-uns-Seite (Texte)',
      path: 'content/pages/about',
      format: { data: 'json' },
      schema: {
        heroEyebrow: fields.text({ label: 'Hero – kleine Zeile' }),
        heroTitle: fields.text({ label: 'Hero – Überschrift', multiline: true }),
        heroTitleAccent: fields.text({ label: 'Hero – Überschrift farbiger Teil' }),
        heroSub: fields.text({ label: 'Hero – Untertext', multiline: true }),
        heroImage: sectionImage('about')('Hero – Hintergrundbild'),
        heroTextPosition: heroTextPositionField(),
        heroImageFocus: imageFocusField('Hero – Bildausschnitt'),

        storyEyebrow: fields.text({ label: 'Geschichte – kleine Zeile' }),
        storyHeadline: fields.text({ label: 'Geschichte – Überschrift', multiline: true }),
        storyChapters: fields.array(
          fields.object({
            title: fields.text({ label: 'Kapitel-Titel' }),
            text: richParagraphs('Text'),
            image: sectionImage('about')('Foto'),
          }),
          {
            label: 'Geschichte – Kapitel',
            itemLabel: (props) => props.fields.title.value || 'Kapitel',
          },
        ),

        teamEyebrow: fields.text({ label: 'Team – kleine Zeile' }),
        teamHeadline: fields.text({ label: 'Team – Überschrift', multiline: true }),
        teamSub: fields.text({ label: 'Team – Untertext', multiline: true }),

        realityEyebrow: fields.text({ label: 'Realität – kleine Zeile' }),
        realityHeadline: fields.text({ label: 'Realität – Überschrift', multiline: true }),
        realityImage: sectionImage('about')('Realität – Foto'),
        realityPoints: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
          }),
          {
            label: 'Realität – Punkte',
            itemLabel: (props) => props.fields.title.value || 'Punkt',
          },
        ),

        contactEyebrow: fields.text({ label: 'Kontakt – kleine Zeile' }),
        contactHeadline: fields.text({ label: 'Kontakt – Überschrift', multiline: true }),
      },
    }),

    team: singleton({
      label: '👥 Team – Bios & Fotos',
      path: 'content/team',
      format: { data: 'json' },
      schema: {
        eileenRole: fields.text({
          label: 'Eileens Untertitel',
          description: 'z.B. Die unermüdliche Hundemama',
        }),
        eileenBody: richParagraphs('Eileens Bio – Absätze'),
        eileenImage: fields.image({
          label: 'Eileens Profilfoto',
          directory: 'public/images/team',
          publicPath: '/images/team/',
          description: 'Foto direkt hier hochladen – kein GitHub nötig',
        }),
        fynnRole: fields.text({
          label: 'Fynns Untertitel',
          description: 'z.B. Der Ruhepol & Baumeister',
        }),
        fynnBody: richParagraphs('Fynns Bio – Absätze'),
        fynnImage: fields.image({
          label: 'Fynns Profilfoto',
          directory: 'public/images/team',
          publicPath: '/images/team/',
          description: 'Foto direkt hier hochladen – kein GitHub nötig',
        }),

        // Team-Showcase — erscheint auf /ueber-uns/ UND /mission/
        showcaseEyebrow: fields.text({ label: 'Team-Showcase – kleine Zeile' }),
        showcaseHeadline: fields.text({ label: 'Team-Showcase – Überschrift', multiline: true }),
        showcaseBody: richParagraphs(
          'Team-Showcase – Absätze',
          'Text über das ganze Team (Tierärzte, Helfer, Pflegestellen …). Erscheint auf der Über-uns- und der Mission-Seite.',
        ),
        showcaseImage: fields.image({
          label: 'Team-Showcase – Foto vom ganzen Team',
          directory: 'public/images/team',
          publicPath: '/images/team/',
          description: 'Gruppenfoto direkt hier hochladen',
        }),
      },
    }),

    projectsPage: singleton({
      label: '🏗️ Projekte-Seite (Texte)',
      path: 'content/pages/projects',
      format: { data: 'json' },
      schema: {
        heroEyebrow: fields.text({ label: 'Hero – kleine Zeile' }),
        heroTitle: fields.text({ label: 'Hero – Überschrift', multiline: true }),
        heroTitleAccent: fields.text({ label: 'Hero – Überschrift farbiger Teil' }),
        heroSub: fields.text({ label: 'Hero – Untertext', multiline: true }),
        heroImage: sectionImage('projekte-seite')('Hero – Hintergrundbild'),

        outroEyebrow: fields.text({ label: 'Abschluss – kleine Zeile' }),
        outroHeadline: fields.text({ label: 'Abschluss – Überschrift', multiline: true }),
        outroText: fields.text({ label: 'Abschluss – Text', multiline: true }),
        outroButton: fields.text({ label: 'Abschluss – Button-Text' }),
      },
    }),

    linktreeContent: singleton({
      label: '🔗 Linktree-Seite',
      path: 'content/pages/linktree',
      format: { data: 'json' },
      schema: {
        tagline: fields.text({ label: 'Spruch unter dem Logo', multiline: true }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung' }),
            href: fields.text({ label: 'Link (URL oder /pfad/)' }),
            icon: fields.select({
              label: 'Symbol',
              options: [
                { label: 'Herz', value: 'heart' },
                { label: 'Haus', value: 'home' },
                { label: 'Formular', value: 'clipboard-list' },
                { label: 'Kamera (Instagram)', value: 'camera' },
                { label: 'Musik (TikTok)', value: 'music' },
                { label: 'Personen (Facebook)', value: 'users' },
                { label: 'Bank', value: 'landmark' },
                { label: 'Pfote', value: 'paw-print' },
                { label: 'Hammer', value: 'hammer' },
                { label: 'Helfende Hand', value: 'hand-helping' },
                { label: 'Brief', value: 'mail' },
              ],
              defaultValue: 'heart',
            }),
            primary: fields.checkbox({ label: 'Hervorheben (farbig)', defaultValue: false }),
          }),
          {
            label: 'Links',
            itemLabel: (props) => props.fields.label.value || 'Link',
          },
        ),
      },
    }),

    siteContent: singleton({
      label: '🌐 Footer & Allgemein',
      path: 'content/site',
      format: { data: 'json' },
      schema: {
        footerTagline: fields.text({
          label: 'Footer – Beschreibung',
          multiline: true,
          description: 'Der kurze Text im Footer unter dem Logo',
        }),
        ctaHeadline: fields.text({
          label: 'Spenden-Banner – Überschrift',
          description: 'Das wiederkehrende „Wir brauchen Deine Hilfe."-Banner',
        }),
        ctaSub: fields.text({ label: 'Spenden-Banner – Untertext', multiline: true }),
      },
    }),
  },

  // ─── Collections (wiederholende Inhalte) ──────────────────────────────────
  collections: {
    dogs: collection({
      label: '🐾 Hunde zur Adoption',
      slugField: 'name',
      path: 'content/dogs/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({
          name: { label: 'Name (Emojis ok, z.B. Flummi 🎾)' },
          slug: { label: 'URL-Kürzel', description: 'Wird automatisch generiert – keine Emojis' },
        }),
        age: fields.text({
          label: 'Alter',
          description: 'z.B. 1 Jahr, 8 Monate',
        }),
        geschlecht: fields.text({
          label: 'Geschlecht',
          description: 'z.B. Hündin oder Rüde — leer lassen, wenn unbekannt',
        }),
        breed: fields.text({
          label: 'Rasse',
          description: 'z.B. Mischling',
        }),
        groesse: fields.text({
          label: 'Größe (optional)',
          description: 'z.B. ca. 45 cm Schulterhöhe oder mittelgroß',
        }),
        gewicht: fields.text({
          label: 'Gewicht (optional)',
          description: 'z.B. ca. 12 kg',
        }),
        character: fields.text({
          label: 'Kurzbeschreibung (1 Zeile)',
          description: 'Slogan, z.B. Kleiner Wirbelwind',
        }),
        kastriert: fields.checkbox({
          label: 'Kastriert',
          defaultValue: true,
        }),
        geimpft: fields.checkbox({
          label: 'Geimpft',
          defaultValue: true,
        }),
        gechipt: fields.checkbox({
          label: 'Gechipt',
          defaultValue: true,
        }),
        story: richParagraphs(
          'Geschichte',
          'Die Lebensgeschichte des Hundes. Jeder Eintrag ist ein Absatz – erzähl ruhig ausführlich, das ist der Text, der Menschen zur Adoption bewegt.',
        ),
        image: fields.image({
          label: 'Foto',
          directory: 'public/images',
          publicPath: '/images/',
          description: 'Foto direkt hochladen – kein GitHub-Wissen nötig',
        }),
        imageFocus: imageFocusField('Bildausschnitt des Fotos'),
        available: fields.checkbox({
          label: 'Verfügbar zur Adoption',
          defaultValue: true,
          description: 'Haken entfernen wenn der Hund vermittelt wurde',
        }),
        tag: fields.text({
          label: 'Status-Tag (optional)',
          description: 'z.B. Sucht Zuhause, Welpe, Aktiver Hund, Vermittelt',
        }),
      },
    }),

    projects: collection({
      label: '🏗️ Projekte',
      slugField: 'title',
      path: 'content/projects/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({
          name: { label: 'Projekttitel' },
          slug: { label: 'URL-Kürzel', description: 'Wird automatisch generiert' },
        }),
        nummer: fields.integer({
          label: 'Reihenfolge (1 = zuerst anzeigen)',
          validation: { isRequired: true, min: 1, max: 99 },
        }),
        subtitle: fields.text({
          label: 'Untertitel',
          description: 'z.B. Sicherheit statt Asphalt',
        }),
        location: fields.text({
          label: 'Standort',
          description: 'z.B. Tanjung Aan, Lombok',
        }),
        description: fields.text({
          label: 'Beschreibung',
          multiline: true,
        }),
        impact: fields.text({
          label: 'Konkrete Wirkung',
          multiline: true,
          description: 'Was hat das Projekt konkret erreicht?',
        }),
        image: fields.image({
          label: 'Projektbild',
          directory: 'public/images',
          publicPath: '/images/',
          description: 'Foto direkt hochladen',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Aktiv', value: 'aktiv' },
            { label: 'Abgeschlossen', value: 'abgeschlossen' },
            { label: 'Geplant', value: 'geplant' },
          ],
          defaultValue: 'aktiv',
        }),
      },
    }),
  },
});
