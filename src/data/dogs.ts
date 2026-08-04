import type { RichTextValue } from '@/lib/richtext';

export interface Dog {
  id: string;
  name: string;
  age: string;
  breed: string;
  character: string;
  // Seit der Absatz-Migration eine Liste von Absätzen (fields.array +
  // markdoc.inline); Alt-Einträge können noch ein einfacher String sein.
  story: RichTextValue;
  // Keystatic image fields are optional, so the bare filename can be null;
  // always pipe through src/lib/img.ts before rendering.
  image: string | null;
  available: boolean;
  tag?: string;
  // Steckbrief-Felder (optional — ältere Einträge haben sie noch nicht)
  geschlecht?: string;
  groesse?: string;
  gewicht?: string;
  kastriert?: boolean;
  geimpft?: boolean;
  gechipt?: boolean;
}

export const ADOPTION_STEPS = [
  {
    nummer: '01',
    title: 'Formular ausfüllen',
    desc: 'Erzähl uns von dir und deinem Alltag – damit wir sehen, ob es passt.',
  },
  {
    nummer: '02',
    title: 'Videocall mit Eileen',
    desc: 'Kein Tribunal – ein echtes Gespräch. Offen, ehrlich, auf Augenhöhe.',
  },
  {
    nummer: '03',
    title: 'Match bestätigt',
    desc: 'Wenn alles passt, beginnt die Ausreisevorbereitung deines Hundes.',
  },
  {
    nummer: '04',
    title: 'Der Hund reist nach Deutschland',
    desc: 'Nach Tollwut-Titer-Test und 6–7 Monaten Vorbereitung beginnt das größte Abenteuer.',
  },
];
