/**
 * Brücke zwischen dem Tina-Admin und den bestehenden Seiten.
 *
 * Tina ist als VERGLEICHS-Oberfläche zum Keystatic-Admin eingebaut: Eileen
 * soll beide ausprobieren und selbst entscheiden (siehe docs/tina-setup.md).
 * Der Unterschied ist die Live-Vorschau — sie klickt den Text auf der Seite
 * an und sieht die Änderung sofort, statt zu speichern und zu warten.
 *
 * Damit das ohne Risiko für die echte Seite geht, gilt hier eine harte Regel:
 *
 *   Für normale Besucher passiert NICHTS. Die Seite liest ihre Inhalte
 *   weiterhin über den Keystatic-Reader. Nur wenn die Anfrage aus dem
 *   Tina-Admin-Iframe kommt, wird zusätzlich über Tina geladen — und selbst
 *   dann fällt bei jedem Fehler alles stumm auf den normalen Weg zurück.
 *
 * Deshalb ist der Tina-Client dynamisch importiert und alles in try/catch:
 * Fehlen die generierten Dateien oder die Tina-Cloud-Zugangsdaten, rendert
 * die Seite exakt wie vorher, statt einen Fehler zu werfen.
 */

export type TinaPreview<T> = {
  /** Die Daten für die Seite (Tina im Edit-Modus, sonst der übergebene Wert). */
  data: T;
  /** true, wenn die Anfrage aus dem Tina-Admin kommt. */
  editing: boolean;
  /**
   * Liefert den `data-tina-field`-Wert für ein Feld — oder undefined, wenn
   * gerade nicht editiert wird. Astro lässt Attribute mit undefined weg, das
   * ausgelieferte HTML bleibt für Besucher also unverändert.
   */
  field: (name: string) => string | undefined;
};

/** Kein Edit-Modus: Fallback-Daten unverändert durchreichen. */
function passthrough<T>(data: T): TinaPreview<T> {
  return { data, editing: false, field: () => undefined };
}

/**
 * Lädt ein Tina-Dokument, wenn die Anfrage aus dem Admin-Iframe kommt.
 *
 * @param request    die eingehende Anfrage (Astro.request)
 * @param query      Name der generierten Query, z.B. 'home'
 * @param variables  Query-Variablen, z.B. { relativePath: 'home.json' }
 * @param fallback   die normal geladenen Daten (Keystatic)
 */
export async function tinaPreview<T>(
  request: Request,
  query: string,
  variables: Record<string, unknown>,
  fallback: T,
): Promise<TinaPreview<T>> {
  try {
    const { isEditMode } = await import('@tinacms/astro/is-edit-mode');
    if (!isEditMode(request)) return passthrough(fallback);

    const [{ requestWithMetadata, tinaField }, clientModule] = await Promise.all([
      import('@tinacms/astro'),
      import('../../tina/__generated__/client'),
    ]);

    const client: any = (clientModule as any).client ?? (clientModule as any).default;
    const result: any = await requestWithMetadata(client.queries[query](variables));
    const doc = result?.data?.[query];
    if (!doc) return passthrough(fallback);

    return {
      // Tina liefert leere Felder als null — der `|| fallback`-Vertrag der
      // Seiten erwartet aber '' bzw. fehlende Schlüssel. null würde sonst
      // dieselbe Wirkung haben, ist also unkritisch; wir reichen es durch.
      data: doc as T,
      editing: true,
      field: (name: string) => {
        try {
          return tinaField(doc, name as never);
        } catch {
          return undefined;
        }
      },
    };
  } catch {
    // Tina nicht eingerichtet / nicht gebaut / Netzwerkfehler — die Seite
    // rendert normal weiter. Das ist der wichtigste Pfad hier.
    return passthrough(fallback);
  }
}
