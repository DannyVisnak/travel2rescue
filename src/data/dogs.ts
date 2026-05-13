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
    name: 'Flummi 🎾',
    age: '1 Jahr',
    breed: 'Mischling',
    character: 'Kleiner Wirbelwind',
    story:
      'Er kam als winziger Welpe mit Motorradfahrern von Jakarta nach Lombok – über 1.000 km auf zwei Rädern. Kaum auf der Insel angekommen, wurde er größer, aktiver, verspielter – und plötzlich war er „zu viel". Jetzt wartet Flummi auf ein Zuhause, das seiner Energie gewachsen ist.',
    image: '/images/IMG_0991.jpeg',
    available: true,
    tag: 'Vermittlungsbereit',
  },
  {
    id: 'minnie',
    name: 'Minnie 🐭',
    age: '2 Jahre',
    breed: 'Mischling',
    character: 'Neugierige Seele',
    story:
      'Minnie hat die Straße von innen kennengelernt – hungrig, allein, misstrauisch. Bei uns hat sie gelernt, dass Menschen auch gut sein können. Sie ist vorsichtig, aber wenn sie Vertrauen fasst, gibt sie alles.',
    image: '/images/DSCF2189.jpeg',
    available: true,
    tag: 'Sucht Zuhause',
  },
  {
    id: 'molly',
    name: 'Molly 🍭',
    age: '8 Monate',
    breed: 'Mischling',
    character: 'Süße Träumerin',
    story:
      'Molly wurde als kleiner Welpe von uns aufgenommen, als ihre Mutter nicht mehr für sie sorgen konnte. Sie ist aufgeweckt, verspielt und liebt es zu kuscheln. Ein Hund für Menschen, die von Anfang an dabei sein wollen.',
    image: '/images/IMG_2027.jpeg',
    available: true,
    tag: 'Welpe',
  },
  {
    id: 'milka',
    name: 'Milka 🍫',
    age: '3 Jahre',
    breed: 'Mischling',
    character: 'Charmante Persönlichkeit',
    story:
      'Milka ist ein Hund mit Charakter. Sie weiß genau was sie will – aber sobald sie dich mag, wirst du ihr Lieblingsmensch für immer. Erfahrung mit Hunden ist von Vorteil, Herz ist Pflicht.',
    image: '/images/IMG_2793.jpeg',
    available: true,
    tag: 'Sucht Zuhause',
  },
  {
    id: 'jack',
    name: 'Jack 🩵',
    age: '2 Jahre',
    breed: 'Mischling',
    character: 'Freigeist & Abenteurer',
    story:
      'Jack liebt Bewegung, Wasser und das Leben. Er wurde am Strand gefunden, halb verhungert – aber mit einem Funken in den Augen, der nie erloschen ist. Für aktive Menschen, die einen echten Lebenspartner suchen.',
    image: '/images/DSCF2220.jpeg',
    available: true,
    tag: 'Aktiver Hund',
  },
  {
    id: 'linus',
    name: 'Linus 🖤',
    age: '4 Jahre',
    breed: 'Mischling',
    character: 'Ruhige Stärke',
    story:
      'Linus ist der Ruhepol unter unseren Hunden. Er hat viel durchgemacht – man merkt es ihm kaum an. Er sucht ein ruhiges Zuhause mit Menschen, die ihm Zeit lassen. Dann zeigt er, wer er wirklich ist.',
    image: '/images/IMG_2205.jpeg',
    available: true,
    tag: 'Sofort verfügbar',
  },
  {
    id: 'freddy',
    name: 'Freddy 💚',
    age: '1,5 Jahre',
    breed: 'Mischling',
    character: 'Sonnenschein auf vier Pfoten',
    story:
      'Freddy ist das, was man einen People Dog nennt. Er liebt Menschen bedingungslos. Er wurde von uns gerettet, aufgepäppelt und ist jetzt bereit, sein Leben mit einer Familie zu teilen.',
    image: '/images/IMG_8636.jpeg',
    available: true,
    tag: 'Familienfreundlich',
  },
  {
    id: 'kiki',
    name: 'Kiki 🧡',
    age: '10 Monate',
    breed: 'Mischling',
    character: 'Freches Energiebündel',
    story:
      'Kiki wurde als kleiner Welpe gerettet. Seitdem hat sie nichts von ihrer Energie verloren. Sie braucht ein aktives Zuhause mit viel Auslauf – dafür bekommst du einen Hund, der jeden Tag zum Abenteuer macht.',
    image: '/images/IMG_8309.jpeg',
    available: true,
    tag: 'Junghund',
  },
  {
    id: 'pinki',
    name: 'Pinki 🩷',
    age: '3 Jahre',
    breed: 'Mischling',
    character: 'Sanfte Seele',
    story:
      'Pinki war sehr scheu, als sie zu uns kam. Mit viel Geduld und Liebe hat sie gelernt, sich zu öffnen. Sie sucht ein erfahrenes Zuhause, das ihr den Raum gibt, der ihr gebührt – und belohnt dich mit unbedingter Treue.',
    image: '/images/IMG_9452.jpeg',
    available: true,
    tag: 'Besondere Fürsorge',
  },
];

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
