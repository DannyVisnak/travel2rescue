import { config, collection, fields, singleton } from '@keystatic/core';

export default config({
  storage: process.env.NODE_ENV === 'production'
    ? { kind: 'github', repo: { owner: 'DannyVisnak', name: 'travel2rescue' } }
    : { kind: 'local' },

  url: process.env.NODE_ENV === 'production'
    ? 'https://travel2rescue.de'
    : 'http://localhost:4321',

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
      label: '🏠 Startseite – Texte & FAQ',
      path: 'content/pages/home',
      format: { data: 'json' },
      schema: {
        heroHeadline: fields.text({
          label: 'Hero-Überschrift (grosse Schrift oben)',
          multiline: true,
          description: 'Der grosse Text auf dem Hintergrundbild. Zeilenumbrüche werden übernommen.',
        }),
        heroSub: fields.text({
          label: 'Hero-Untertext',
          multiline: true,
          description: 'Kleiner Text unter der Überschrift',
        }),
        founderQuote: fields.text({
          label: 'Gründer-Zitat',
          multiline: true,
          description: 'Das Zitat in der Mitte der Seite. Anführungszeichen werden automatisch gesetzt.',
        }),
        homeFaqs: fields.array(
          fields.object({
            question: fields.text({ label: 'Frage' }),
            answer: fields.text({ label: 'Antwort', multiline: true }),
          }),
          { label: 'FAQ-Einträge (Startseite)' },
        ),
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
        eileenBio1: fields.text({
          label: 'Eileens Bio – 1. Absatz',
          multiline: true,
        }),
        eileenBio2: fields.text({
          label: 'Eileens Bio – 2. Absatz',
          multiline: true,
        }),
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
        fynnBio1: fields.text({
          label: 'Fynns Bio – 1. Absatz',
          multiline: true,
        }),
        fynnBio2: fields.text({
          label: 'Fynns Bio – 2. Absatz',
          multiline: true,
        }),
        fynnImage: fields.image({
          label: 'Fynns Profilfoto',
          directory: 'public/images',
          publicPath: '/images/',
          description: 'Foto direkt hier hochladen – kein GitHub nötig',
        }),
      },
    }),

    helpContent: singleton({
      label: '💝 Helfen-Seite & Adoptions-FAQ',
      path: 'content/pages/help',
      format: { data: 'json' },
      schema: {
        helpFaqs: fields.array(
          fields.object({
            question: fields.text({ label: 'Frage' }),
            answer: fields.text({ label: 'Antwort', multiline: true }),
          }),
          { label: 'FAQ Helfen-Seite' },
        ),
        adoptionFaqs: fields.array(
          fields.object({
            question: fields.text({ label: 'Frage' }),
            answer: fields.text({ label: 'Antwort', multiline: true }),
          }),
          { label: 'FAQ Adoptions-Seite' },
        ),
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
        breed: fields.text({
          label: 'Rasse',
          description: 'z.B. Mischling',
        }),
        character: fields.text({
          label: 'Kurzbeschreibung (1 Zeile)',
          description: 'Slogan, z.B. Kleiner Wirbelwind',
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
