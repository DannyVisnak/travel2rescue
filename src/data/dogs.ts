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

export const DOGS: Dog[] = [
  {
    id: 'flummi',
    name: 'Flummi',
    age: '1 Jahr',
    breed: 'Mischling',
    character: 'Kleiner Wirbelwind',
    story:
      'Sie kam als winziger Welpe mit Motorradfahrern von Jakarta nach Lombok – über 1.000 km auf zwei Rädern. Kaum auf der Insel angekommen, wurde sie größer, aktiver, verspielter – und plötzlich war sie "zu viel". Die Leute, die sie mitgenommen hatten, wollten sie nicht mehr. Jetzt wartet Flummi auf ein Zuhause, das ihrer Energie gewachsen ist.',
    image: '/images/IMG_0991.jpg',
    available: true,
    tag: 'Vermittlungsbereit',
  },
  {
    id: 'luna',
    name: 'Luna',
    age: '5 Jahre',
    breed: 'Labrador-Mix',
    character: 'Ruhige Seele',
    story:
      'Luna ist das Gegenteil von Chaos. Sie sucht einen gemütlichen Platz auf dem Sofa, ein paar ruhige Spaziergänge und Menschen, die einfach da sind. Stubenrein, verträglich mit anderen Tieren, hundert Prozent verlässlich. Luna ist bereit für ihr erstes echtes Zuhause.',
    image: '/images/IMG_2198.jpg',
    available: true,
    tag: 'Sofort verfügbar',
  },
  {
    id: 'max',
    name: 'Max',
    age: '2 Jahre',
    breed: 'Border Collie-Mix',
    character: 'Aktiver Abenteurer',
    story:
      'Max braucht Beschäftigung – geistig und körperlich. Er lernt schnell, er liebt Herausforderungen und er wird dich auf Trab halten. Ideal für Menschen, die Sport treiben, viel wandern oder einfach einen Hund wollen, der wirklich dabei ist. Kein Couch-Hund – ein Lebenspartner.',
    image: '/images/IMG_2371.jpg',
    available: true,
    tag: 'Aktiver Hund',
  },
];

export const ADOPTION_STEPS = [
  {
    nummer: '01',
    title: 'Deinen Favoriten finden',
    desc: 'Stöbere durch unsere Profile und lerne die Geschichten unserer Hunde kennen.',
  },
  {
    nummer: '02',
    title: 'Formular ausfüllen',
    desc: 'Kurze Fragen zu deinem Alltag und deinen Vorstellungen – damit wir sehen, ob es passt.',
  },
  {
    nummer: '03',
    title: 'Videocall mit Eileen',
    desc: 'Wir sprechen offen über deine Lebenssituation und den Hund. Kein Tribunal – ein echtes Gespräch.',
  },
  {
    nummer: '04',
    title: 'Der Hund reist nach Deutschland',
    desc: 'Nach Tollwut-Titer-Test und 6–7 Monaten Vorbereitung startet dein Hund das größte Abenteuer seines Lebens.',
  },
];
