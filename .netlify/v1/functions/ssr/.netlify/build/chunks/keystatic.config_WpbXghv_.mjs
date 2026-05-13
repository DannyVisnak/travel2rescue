import { config as config$1, collection, fields } from '@keystatic/core';

const config = config$1({
  // Local mode for dev (no OAuth needed).
  // For production on Netlify, switch to:
  //   storage: { kind: 'github', repo: { owner: 'DannyVisnak', name: 'travel2rescue' } }
  // and set env vars: KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET, KEYSTATIC_SECRET
  storage: {
    kind: "local"
  },
  ui: {
    brand: { name: "Travel2Rescue Admin" }
  },
  collections: {
    dogs: collection({
      label: "Hunde zur Adoption",
      slugField: "name",
      path: "content/dogs/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({
          name: { label: "Name (z.B. Flummi 🎾)" },
          slug: { label: "URL-Slug (z.B. flummi, keine Emojis)", description: "Wird automatisch aus dem Namen generiert" }
        }),
        age: fields.text({ label: "Alter", description: "z.B. 1 Jahr, 8 Monate" }),
        breed: fields.text({ label: "Rasse", description: "z.B. Mischling" }),
        character: fields.text({ label: "Charakterbeschreibung (kurz)", description: "Einzeiliger Slogan, z.B. Kleiner Wirbelwind" }),
        story: fields.text({ label: "Geschichte", multiline: true, description: "Die Lebensgeschichte des Hundes, 2–4 Sätze" }),
        image: fields.text({ label: "Foto-Pfad", description: "z.B. /images/IMG_0991.jpeg — Bild erst auf GitHub hochladen, dann Pfad hier eingeben" }),
        available: fields.checkbox({ label: "Verfügbar zur Adoption", defaultValue: true, description: "Haken entfernen wenn der Hund vermittelt wurde" }),
        tag: fields.text({ label: "Status-Tag (optional)", description: "z.B. Sucht Zuhause, Welpe, Aktiver Hund" })
      }
    }),
    projects: collection({
      label: "Projekte",
      slugField: "title",
      path: "content/projects/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: { label: "Projekttitel" },
          slug: { label: "URL-Slug", description: "Wird automatisch generiert" }
        }),
        nummer: fields.integer({ label: "Reihenfolge (1, 2, 3…)", validation: { isRequired: true, min: 1, max: 99 } }),
        subtitle: fields.text({ label: "Untertitel" }),
        location: fields.text({ label: "Standort", description: "z.B. Tanjung Aan, Lombok" }),
        description: fields.text({ label: "Beschreibung", multiline: true }),
        impact: fields.text({ label: "Wirkung/Impact", multiline: true }),
        image: fields.text({ label: "Foto-Pfad", description: "z.B. /images/IMG_2820.jpg" }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Aktiv", value: "aktiv" },
            { label: "Abgeschlossen", value: "abgeschlossen" },
            { label: "Geplant", value: "geplant" }
          ],
          defaultValue: "aktiv"
        })
      }
    })
  }
});

export { config as c };
