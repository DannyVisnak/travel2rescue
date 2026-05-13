export interface Project {
  id: string;
  nummer: number;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  impact: string;
  image: string;
  status: 'aktiv' | 'abgeschlossen' | 'geplant';
}

export const PROJECTS: Project[] = [
  {
    id: 'hundehuetten',
    nummer: 1,
    title: 'Hundehütten am Tanjung Aan',
    subtitle: 'Sicherheit statt Asphalt',
    location: 'Tanjung Aan, Lombok',
    description:
      'Am Strand von Tanjung Aan leben Dutzende Straßenhunde ohne Schutz vor Sonne, Regen und Autos. Wir bauen stabile Holzhütten, die den Hunden einen sicheren Rückzugsort bieten – nachts, bei Sturm und nach Verletzungen. Jede Hütte ist ein kleines Stück Würde in einem Leben voller Entbehrungen.',
    impact:
      'Sichere Schlafplätze für über 30 Hunde. Weniger Unfälle durch klar definierte Aufenthaltsbereiche. Fester Anlaufpunkt für unsere täglichen Fütterungsrunden.',
    image: '/images/IMG_2820.jpg',
    status: 'aktiv',
  },
  {
    id: 'muellhaide',
    nummer: 2,
    title: 'Projekt Müllhaide',
    subtitle: 'Rettung aus dem Nichts',
    location: 'Müllhalde, Lombok',
    description:
      'Die Müllhalde am Stadtrand ist ein Ort des Grauens – und gleichzeitig die letzte Zuflucht für viele Hunde, die dort nach Essbarem suchen. Vergiftungen durch Plastikreste, tiefe Schnittwunden durch Scherben, schwere Infektionen. Wir sind regelmäßig vor Ort, versorgen Wunden, behandeln Vergiftungen und kastrieren die Hunde direkt an Ort und Stelle.',
    impact:
      'Wöchentliche Versorgungsrunden. Über 60 kastrierte Hunde direkt auf der Müllhalde. Zahlreiche Notfallrettungen und Vergiftungsbehandlungen.',
    image: '/images/IMG_2977.jpg',
    status: 'aktiv',
  },
  {
    id: 'wing-ngo-sumatra',
    nummer: 3,
    title: 'Wing NGO – 200 Katzen Sumatra',
    subtitle: 'Partnerschaft über Grenzen hinweg',
    location: 'Sumatra, Indonesien',
    description:
      'In Zusammenarbeit mit der Wing NGO auf Sumatra unterstützen wir eine massive Kastrationsaktion für über 200 Straßenkatzen. Katzen werden in Indonesien oft toleriert, aber selten versorgt – sie leiden still. Unsere Partnerschaft bringt medizinisches Know-how, Equipment und finanzielle Mittel dorthin, wo sonst niemand hinschaut.',
    impact:
      'Kastration von über 200 Katzen geplant. Medizinische Grundversorgung für alle behandelten Tiere. Erste internationale Kooperation von Travel2Rescue.',
    image: '/images/IMG_5371.jpg',
    status: 'aktiv',
  },
];
