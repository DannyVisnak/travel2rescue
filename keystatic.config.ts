import { config, collection, fields, singleton } from '@keystatic/core';

// ─── Reusable field helpers ────────────────────────────────────────────────
const faqArray = (label: string) =>
  fields.array(
    fields.object({
      question: fields.text({ label: 'Frage' }),
      answer: fields.text({ label: 'Antwort', multiline: true }),
    }),
    {
      label,
      itemLabel: (props) => props.fields.question.value || 'Frage',
    },
  );

const sectionImage = (label: string, description?: string) =>
  fields.image({
    label,
    directory: 'public/images',
    publicPath: '/images/',
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
        heroImage: sectionImage('Hero – Hintergrundbild'),

        // Trust strip
        trustItems: fields.array(fields.text({ label: 'Eintrag' }), {
          label: 'Vertrauens-Leiste (kleine Punkte unter dem Hero)',
          itemLabel: (props) => props.value || 'Eintrag',
        }),

        // Mission-Teaser
        missionEyebrow: fields.text({ label: 'Mission-Teaser – kleine Zeile' }),
        missionHeadline: fields.text({ label: 'Mission-Teaser – Überschrift', multiline: true }),
        missionText1: fields.text({ label: 'Mission-Teaser – Absatz 1', multiline: true }),
        missionText2: fields.text({ label: 'Mission-Teaser – Absatz 2', multiline: true }),
        missionImage: sectionImage('Mission-Teaser – Foto (rechte Seite)'),

        // Projekte-Teaser
        projectsEyebrow: fields.text({ label: 'Projekte-Teaser – kleine Zeile' }),
        projectsHeadline: fields.text({ label: 'Projekte-Teaser – Überschrift', multiline: true }),
        projectsSub: fields.text({ label: 'Projekte-Teaser – Untertext', multiline: true }),

        // Helfen-Teaser
        helfenEyebrow: fields.text({ label: 'Helfen-Teaser – kleine Zeile' }),
        helfenHeadline: fields.text({ label: 'Helfen-Teaser – Überschrift', multiline: true }),
        helfenSub: fields.text({ label: 'Helfen-Teaser – Untertext', multiline: true }),

        // Über-uns Teaser
        storyEyebrow: fields.text({ label: 'Geschichte – kleine Zeile' }),
        storyHeadline: fields.text({ label: 'Geschichte – Überschrift', multiline: true }),
        storyText1: fields.text({ label: 'Geschichte – Absatz 1', multiline: true }),
        storyText2: fields.text({ label: 'Geschichte – Absatz 2', multiline: true }),
        storyImage: sectionImage('Geschichte – Foto'),
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
        dogsImage: sectionImage('Hunde-Teaser – grosses Hintergrundfoto'),

        // Zitat
        founderQuote: fields.text({
          label: 'Gründer-Zitat',
          multiline: true,
          description: 'Das grosse Zitat. Anführungszeichen werden automatisch gesetzt.',
        }),

        // FAQ
        faqEyebrow: fields.text({ label: 'FAQ – kleine Zeile' }),
        faqHeadline: fields.text({ label: 'FAQ – Überschrift' }),
        homeFaqs: faqArray('FAQ-Einträge (Startseite)'),
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
        heroImage: sectionImage('Hero – Hintergrundbild'),

        introEyebrow: fields.text({ label: 'Intro – kleine Zeile' }),
        introHeadline: fields.text({ label: 'Intro – Überschrift', multiline: true }),
        introText: fields.text({
          label: 'Intro – Absatz',
          multiline: true,
          description: 'Freier Text direkt vor den Problem-Karten — hier kannst du in eigenen Worten erzählen, worum es geht.',
        }),

        problemEyebrow: fields.text({ label: 'Problem – kleine Zeile' }),
        problemHeadline: fields.text({ label: 'Problem – Überschrift', multiline: true }),
        problems: fields.array(
          fields.object({
            title: fields.text({ label: 'Titel' }),
            desc: fields.text({ label: 'Beschreibung', multiline: true }),
            solution: fields.text({ label: 'Unsere Lösung', multiline: true }),
            image: sectionImage('Foto'),
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
            image: sectionImage('Foto'),
          }),
          {
            label: 'Die vier Säulen',
            itemLabel: (props) => props.fields.title.value || 'Säule',
          },
        ),

        catsEyebrow: fields.text({ label: 'Katzen – kleine Zeile' }),
        catsHeadline: fields.text({ label: 'Katzen – Überschrift', multiline: true }),
        catsText1: fields.text({ label: 'Katzen – Absatz 1', multiline: true }),
        catsText2: fields.text({ label: 'Katzen – Absatz 2', multiline: true }),
        catsLinkLabel: fields.text({ label: 'Katzen – Button-Text' }),
        catsImage: sectionImage('Katzen – Foto'),

        visionEyebrow: fields.text({ label: 'Vision – kleine Zeile' }),
        visionHeadline: fields.text({ label: 'Vision – Überschrift', multiline: true }),
        visionText1: fields.text({ label: 'Vision – Absatz 1', multiline: true }),
        visionText2: fields.text({ label: 'Vision – Absatz 2', multiline: true }),
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
        heroImage: sectionImage('Hero – Hintergrundbild'),

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
            image: sectionImage('Foto'),
          }),
          {
            label: 'Drei Wege (Karten)',
            itemLabel: (props) => props.fields.title.value || 'Karte',
          },
        ),

        volunteerEyebrow: fields.text({ label: 'Volunteer – kleine Zeile' }),
        volunteerHeadline: fields.text({ label: 'Volunteer – Überschrift', multiline: true }),
        volunteerText: fields.text({ label: 'Volunteer – Text', multiline: true }),
        volunteerTasks: fields.array(fields.text({ label: 'Aufgabe' }), {
          label: 'Volunteer – Aufgaben (Symbole bleiben fest)',
          itemLabel: (props) => props.value || 'Aufgabe',
        }),
        volunteerImage: sectionImage('Volunteer – Foto'),

        adoptStepsEyebrow: fields.text({ label: 'Adoptions-Weg – kleine Zeile' }),
        adoptStepsHeadline: fields.text({ label: 'Adoptions-Weg – Überschrift', multiline: true }),
        adoptStepsAccent: fields.text({ label: 'Adoptions-Weg – Überschrift farbiger Teil' }),
        adoptSteps: fields.array(fields.text({ label: 'Schritt' }), {
          label: 'Adoptions-Weg – Schritte',
          itemLabel: (props) => props.value || 'Schritt',
        }),
        adoptStepsImage: sectionImage('Adoptions-Weg – Foto'),

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
        heroImage: sectionImage('Hero – Hintergrundbild'),

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
        benefitsImage: sectionImage('Vorteile – Foto'),
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
        heroImage: sectionImage('Hero – Hintergrundbild'),

        storyEyebrow: fields.text({ label: 'Geschichte – kleine Zeile' }),
        storyHeadline: fields.text({ label: 'Geschichte – Überschrift', multiline: true }),
        storyChapters: fields.array(
          fields.object({
            title: fields.text({ label: 'Kapitel-Titel' }),
            text: fields.text({ label: 'Text', multiline: true }),
            image: sectionImage('Foto'),
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
        realityImage: sectionImage('Realität – Foto'),
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
        eileenBio1: fields.text({ label: 'Eileens Bio – 1. Absatz', multiline: true }),
        eileenBio2: fields.text({ label: 'Eileens Bio – 2. Absatz', multiline: true }),
        eileenImage: fields.image({
          label: 'Eileens Profilfoto',
          directory: 'public/images',
          publicPath: '/images/',
          description: 'Foto direkt hier hochladen – kein GitHub nötig',
        }),
        fynnRole: fields.text({
          label: 'Fynns Untertitel',
          description: 'z.B. Der Ruhepol & Baumeister',
        }),
        fynnBio1: fields.text({ label: 'Fynns Bio – 1. Absatz', multiline: true }),
        fynnBio2: fields.text({ label: 'Fynns Bio – 2. Absatz', multiline: true }),
        fynnImage: fields.image({
          label: 'Fynns Profilfoto',
          directory: 'public/images',
          publicPath: '/images/',
          description: 'Foto direkt hier hochladen – kein GitHub nötig',
        }),

        // Team-Showcase — erscheint auf /ueber-uns/ UND /mission/
        showcaseEyebrow: fields.text({ label: 'Team-Showcase – kleine Zeile' }),
        showcaseHeadline: fields.text({ label: 'Team-Showcase – Überschrift', multiline: true }),
        showcaseText: fields.text({
          label: 'Team-Showcase – Text',
          multiline: true,
          description: 'Text über das ganze Team (Tierärzte, Helfer, Pflegestellen …). Erscheint auf der Über-uns- und der Mission-Seite.',
        }),
        showcaseImage: fields.image({
          label: 'Team-Showcase – Foto vom ganzen Team',
          directory: 'public/images',
          publicPath: '/images/',
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
        heroImage: sectionImage('Hero – Hintergrundbild'),

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
        story: fields.text({
          label: 'Geschichte',
          multiline: true,
          description: 'Die Lebensgeschichte des Hundes, 2–4 Sätze',
        }),
        image: fields.image({
          label: 'Foto',
          directory: 'public/images',
          publicPath: '/images/',
          description: 'Foto direkt hochladen – kein GitHub-Wissen nötig',
        }),
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
