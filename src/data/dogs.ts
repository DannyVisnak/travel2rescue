export interface Dog {
  id: string;
  name: string;
  age: string;
  breed: string;
  character: string;
  story: string;
  image: string;
  available: boolean;
  tag?: string;
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
