export interface Project {
  id: string;
  nummer: number;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  impact: string;
  // Keystatic image field is optional, so pipe through src/lib/img.ts.
  image: string | null;
  status: 'aktiv' | 'abgeschlossen' | 'geplant';
}
