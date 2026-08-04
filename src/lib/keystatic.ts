import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

export const reader = createReader(process.cwd(), config);

/**
 * Hunde lesen, ohne dass ein einzelner Alt-Eintrag die Seite abschiesst.
 *
 * Hintergrund: Das Hunde-Schema wurde verschärft (`story` ist jetzt eine
 * Absatz-Liste statt eines Strings). Der Keystatic-Reader validiert streng und
 * `all()` isoliert Fehler NICHT — eine einzige Datei im Altformat lässt den
 * gesamten Aufruf werfen und damit Startseite, /adoptieren/ und
 * /adoptieren/hunde/ mit 500 antworten.
 *
 * Genau das kann im Alltag passieren: Eileen speichert im laufenden Betrieb
 * über den Live-Admin (noch mit dem alten Schema) einen Hund, während dieser
 * Branch noch nicht deployt ist. Nach dem Deploy liegt eine Datei im Altformat
 * im Repo, die die Migration nie gesehen hat.
 *
 * Deshalb: bei einem Fehler Eintrag für Eintrag lesen und die kaputten aus der
 * Rohdatei nachziehen. Lieber ein Hund mit unformatierter Geschichte als eine
 * Seite, die gar nicht lädt.
 */
export async function readDogs() {
  try {
    return await reader.collections.dogs.all();
  } catch {
    const slugs = await reader.collections.dogs.list();
    const entries: Array<{ slug: string; entry: any }> = [];

    for (const slug of slugs) {
      try {
        entries.push({ slug, entry: await reader.collections.dogs.read(slug) });
      } catch {
        const rescued = await rescueLegacyDog(slug);
        if (rescued) entries.push({ slug, entry: rescued });
        else console.warn(`[dogs] Eintrag "${slug}" konnte nicht gelesen werden und wird übersprungen.`);
      }
    }

    return entries;
  }
}

/**
 * Einen einzelnen Hund lesen — mit derselben Toleranz wie readDogs().
 * Gibt null zurück, wenn es den Eintrag wirklich nicht gibt.
 */
export async function readDog(slug: string) {
  try {
    const entry = await reader.collections.dogs.read(slug);
    if (entry) return entry;
  } catch {
    // Validierungsfehler (Alt-Format) — unten aus der Rohdatei retten.
  }
  return rescueLegacyDog(slug);
}

/**
 * Rohes JSON eines Hundes lesen und ins aktuelle Format bringen.
 * Notfallpfad für readDogs()/readDog() — nicht direkt verwenden.
 */
async function rescueLegacyDog(slug: string) {
  try {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const raw = JSON.parse(
      await readFile(join(process.cwd(), 'content', 'dogs', `${slug}.json`), 'utf8'),
    );

    return {
      ...raw,
      name: raw.name ?? slug,
      // String → Absatz-Liste (Leerzeile trennt Absätze), wie in der Migration.
      story:
        typeof raw.story === 'string'
          ? raw.story.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)
          : Array.isArray(raw.story)
            ? raw.story
            : [],
      available: raw.available ?? true,
      image: raw.image ?? null,
      imageFocus: raw.imageFocus ?? 'auto',
    };
  } catch {
    return null;
  }
}
