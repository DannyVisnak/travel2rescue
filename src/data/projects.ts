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
