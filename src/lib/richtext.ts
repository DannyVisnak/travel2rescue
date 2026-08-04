/**
 * Rendering für CMS-Fließtexte.
 *
 * Eileen hat zwei Wege, einen Absatz zu schreiben, und beide landen hier:
 *
 *  1. `fields.array(fields.markdoc.inline())` — die neuen „Absätze"-Felder.
 *     Jeder Eintrag ist EIN Absatz mit fett/kursiv/Link, gespeichert als
 *     Markdown-String direkt in der JSON-Datei (kein separates .mdoc — wichtig
 *     für das `includeFiles`-Bundling, siehe CLAUDE.md Quirk 0). Der Reader
 *     liefert `{ node }` mit dem Markdoc-AST.
 *
 *  2. Ein einfaches `fields.text({ multiline: true })` (Alt-Felder + alle
 *     Inline-Fallbacks im Template). Hier gilt: LEERZEILE = NEUER ABSATZ,
 *     einzelner Zeilenumbruch = <br/>. Damit kann Eileen auch in unveränderten
 *     Feldern einen Absatz einfügen, ohne dass am Schema etwas geändert wurde.
 *
 * Beide Formen ergeben dieselbe Ausgabe: eine Liste fertiger <p>-Innen-HTMLs.
 * Ein leerer Wert fällt auf den Fallback zurück — das ist die Invariante, die
 * verhindert, dass ein geleertes CMS-Feld eine Sektion leer rendert.
 */

type MarkdocNode = {
  type: string;
  attributes?: Record<string, unknown>;
  children?: MarkdocNode[];
};

/** Was der Keystatic-Reader für die verschiedenen Feldtypen liefert. */
export type RichTextValue =
  | string
  | null
  | undefined
  | ReadonlyArray<{ node: MarkdocNode } | string | null | undefined>;

export type RichTextOptions = {
  /** CSS-Klassen für <a>-Tags im Fließtext. */
  linkClass?: string;
};

const DEFAULT_LINK_CLASS = 'text-amber-500 underline underline-offset-2 hover:text-amber-400';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Nur Ziele zulassen, die im Browser harmlos sind. Inhalte kommen zwar aus dem
 * eigenen CMS, aber `javascript:` würde hier sonst ungeprüft durchrutschen.
 */
function safeHref(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const href = raw.trim();
  if (!href) return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith('/') || href.startsWith('#')) return href;
  return null;
}

function renderNodes(nodes: MarkdocNode[] | undefined, opts: RichTextOptions): string {
  if (!nodes?.length) return '';
  return nodes.map((node) => renderNode(node, opts)).join('');
}

function renderNode(node: MarkdocNode, opts: RichTextOptions): string {
  switch (node.type) {
    case 'text': {
      const content = node.attributes?.content;
      return typeof content === 'string' ? escapeHtml(content) : '';
    }
    case 'strong':
      return `<strong>${renderNodes(node.children, opts)}</strong>`;
    case 'em':
      return `<em>${renderNodes(node.children, opts)}</em>`;
    case 's':
      return `<s>${renderNodes(node.children, opts)}</s>`;
    case 'code': {
      const content = node.attributes?.content;
      return `<code>${typeof content === 'string' ? escapeHtml(content) : renderNodes(node.children, opts)}</code>`;
    }
    case 'link': {
      const href = safeHref(node.attributes?.href);
      const inner = renderNodes(node.children, opts);
      if (!href) return inner;
      const linkClass = opts.linkClass ?? DEFAULT_LINK_CLASS;
      const external = /^https?:/i.test(href) && !href.includes('travel2rescue.de');
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(href)}" class="${escapeHtml(linkClass)}"${rel}>${inner}</a>`;
    }
    case 'hardbreak':
    case 'softbreak':
      return '<br/>';
    // document / paragraph / inline und alles Unbekannte: Kinder durchreichen.
    default:
      return renderNodes(node.children, opts);
  }
}

/**
 * Ein Markdoc-Dokument kann mehrere Blöcke enthalten — jeden einzeln zurückgeben.
 *
 * Listen bekommen hier besondere Aufmerksamkeit: Keystatic escaped beim
 * Speichern kein „3." am Zeilenanfang, weshalb ein Satz wie „3. September
 * 2024: …" als nummerierte Liste zurückkommt. Würden wir nur die Kinder
 * durchreichen, verschwände die „3." (sie steckt im `start`-Attribut der Liste,
 * nicht im Text). Deshalb wird sie explizit mitgerendert.
 */
function paragraphsFromMarkdoc(node: MarkdocNode, opts: RichTextOptions): string[] {
  if (node.type === 'paragraph') {
    const html = renderNode(node, opts).trim();
    return html ? [html] : [];
  }

  if (node.type === 'list') {
    const ordered = node.attributes?.ordered === true;
    const start = Number(node.attributes?.start ?? 1);
    const items = (node.children ?? []).map((item) =>
      (item.children ?? [])
        .flatMap((child) => paragraphsFromMarkdoc(child, opts))
        .join('<br/>')
        .trim(),
    );
    const filled = items.filter(Boolean);
    if (!filled.length) return [];

    // Einzelner Eintrag ohne echte Aufzählungsabsicht — fast immer ein
    // fehlinterpretierter Satz („3. September 2024: …"). Als Absatz rendern
    // und die Zahl wieder voranstellen, damit der Text unverändert dasteht.
    if (ordered && filled.length === 1) {
      return [`${escapeHtml(String(start))}. ${filled[0]}`];
    }

    const tag = ordered ? 'ol' : 'ul';
    const startAttr = ordered && start !== 1 ? ` start="${escapeHtml(String(start))}"` : '';
    const listClass = ordered
      ? 'list-decimal list-outside pl-5 space-y-1'
      : 'list-disc list-outside pl-5 space-y-1';
    return [
      `<${tag}${startAttr} class="${listClass}">${filled.map((i) => `<li>${i}</li>`).join('')}</${tag}>`,
    ];
  }

  // Trennlinie: kein Text, aber auch kein Grund, den ganzen Absatz zu
  // verlieren (sonst fiele die Sektion still auf die Fallback-Copy zurück).
  if (node.type === 'hr') {
    return ['<span class="block h-px w-16 bg-white/20" role="presentation"></span>'];
  }

  if (node.children?.length) {
    const nested = node.children.flatMap((child) => paragraphsFromMarkdoc(child, opts));
    if (nested.length) return nested;
  }
  const html = renderNode(node, opts).trim();
  return html ? [html] : [];
}

/** Plain-Text-Feld: Leerzeile = neuer Absatz, einzelnes \n = <br/>. */
function paragraphsFromPlainText(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => escapeHtml(block).replace(/\n/g, '<br/>'));
}

/**
 * Normalisiert jeden CMS-Wert zu einer Liste von Absatz-HTMLs.
 * Ist der Wert leer, greift der Fallback (die Original-Copy aus dem Template).
 */
export function richTextToParagraphs(
  value: RichTextValue,
  fallback = '',
  opts: RichTextOptions = {},
): string[] {
  if (Array.isArray(value)) {
    const paragraphs = value.flatMap((item) => {
      if (!item) return [];
      if (typeof item === 'string') return paragraphsFromPlainText(item);
      if (typeof item === 'object' && 'node' in item && item.node) {
        return paragraphsFromMarkdoc(item.node, opts);
      }
      return [];
    });
    if (paragraphs.length) return paragraphs;
  } else if (typeof value === 'string' && value.trim()) {
    return paragraphsFromPlainText(value);
  }

  return fallback.trim() ? paragraphsFromPlainText(fallback) : [];
}

/**
 * Reiner Text ohne Markup — für JSON-LD (FAQPage), Meta-Descriptions und
 * überall dort, wo HTML nicht erlaubt ist.
 */
export function richTextToPlain(value: RichTextValue, fallback = ''): string {
  return richTextToParagraphs(value, fallback)
    .join('\n\n')
    .replace(/<br\/>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Hat das CMS-Feld überhaupt Inhalt? (Fallback-Entscheidungen im Template) */
export function hasRichText(value: RichTextValue): boolean {
  return richTextToParagraphs(value, '').length > 0;
}
