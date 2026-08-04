/**
 * Layout-Optionen, die Eileen im Admin auswählen kann.
 *
 * Bewusst Presets statt freier Werte: Sie soll den Text verschieben und den
 * Bildausschnitt korrigieren können, ohne dass das Design kaputtgehen kann.
 *
 * WICHTIG für Tailwind v4: Die Klassennamen müssen als VOLLSTÄNDIGE Strings
 * im Quelltext stehen. Niemals `object-${wert}` o.ä. zusammenbauen — solche
 * Klassen landen nicht im generierten CSS und die Option bliebe wirkungslos.
 */

// ─── Textposition im Hero ───────────────────────────────────────────────────

export type HeroTextPosition = 'links' | 'mitte' | 'rechts';

type HeroLayout = {
  /** Zusatzklassen für den Textblock (Breite kommt von der Seite). */
  box: string;
  /** Ausrichtung der Button-Reihe. */
  buttons: string;
  /** Richtung des Abdunkel-Verlaufs hinter dem Text. */
  gradientDirection: string;
};

// ACHTUNG `mr-0` / `ml-0`: Auf vier der fünf Seiten sitzt die Textbox auf
// demselben Element wie `container-x`, und das setzt `margin-inline: auto`.
// `ml-auto` allein bestätigt dann nur margin-left:auto — margin-right bleibt
// auto und der Block steht weiter mittig. Ohne das Gegenstück verschiebt sich
// der Text nicht, während der Verlauf schon kippt: die Option sähe für Eileen
// schlicht kaputt aus.
const HERO_LAYOUTS: Record<HeroTextPosition, HeroLayout> = {
  // Standard = die bisherige Position der jeweiligen Seite. Bewusst ohne
  // eigene Margin-Klasse: die vier Unterseiten zentrieren ihren Textblock über
  // `container-x` (mx-auto), und genau so sah der Hero dort schon immer aus.
  links: { box: '', buttons: '', gradientDirection: 'bg-gradient-to-r' },
  // Mitte: symmetrisch, deshalb kein gerichteter Verlauf (siehe heroOverlay).
  mitte: { box: 'mx-auto text-center', buttons: 'justify-center', gradientDirection: '' },
  // Rechts: Text rechts, Verlauf gespiegelt — sonst steht heller Text auf
  // hellem Foto. Genau dieser Fall ist Eileens Wunsch („damit man mich auf
  // dem Bild sieht").
  rechts: { box: 'ml-auto mr-0', buttons: '', gradientDirection: 'bg-gradient-to-l' },
};

export function heroLayout(position: HeroTextPosition | null | undefined): HeroLayout {
  return HERO_LAYOUTS[position as HeroTextPosition] ?? HERO_LAYOUTS.links;
}

/**
 * Overlay-Klassen für den Hero.
 *
 * @param position  gewählte Textposition
 * @param stops     Farbstopps der Seite, z.B. 'from-black/90 via-black/60 to-black/20'
 * @param centered  Overlay, wenn der Text mittig steht (gleichmässig dunkel)
 */
export function heroOverlay(
  position: HeroTextPosition | null | undefined,
  stops: string,
  centered = 'bg-black/70',
): string {
  const { gradientDirection } = heroLayout(position);
  return gradientDirection ? `${gradientDirection} ${stops}` : centered;
}

/** Text-Ausrichtung für den Untertext (mittig braucht mx-auto). */
export function heroSubClass(position: HeroTextPosition | null | undefined): string {
  return position === 'mitte' ? 'mx-auto' : '';
}

// ─── Bildausschnitt ─────────────────────────────────────────────────────────

export type ImageFocus =
  | 'auto'
  | 'mitte'
  | 'links'
  | 'rechts'
  | 'oben'
  | 'unten'
  | 'links-oben'
  | 'rechts-oben';

const IMAGE_FOCUS_CLASSES: Record<Exclude<ImageFocus, 'auto'>, string> = {
  mitte: 'object-center',
  links: 'object-left',
  rechts: 'object-right',
  oben: 'object-top',
  unten: 'object-bottom',
  'links-oben': 'object-left-top',
  'rechts-oben': 'object-right-top',
};

/**
 * Welcher Bildausschnitt soll gezeigt werden?
 *
 * `auto` (Standard) behält den handgesetzten Ausschnitt der Seite bei — so
 * sieht jede Seite exakt aus wie vorher, solange Eileen nichts umstellt.
 */
export function imageFocusClass(focus: string | null | undefined, fallback = 'object-center'): string {
  if (!focus || focus === 'auto') return fallback;
  return IMAGE_FOCUS_CLASSES[focus as Exclude<ImageFocus, 'auto'>] ?? fallback;
}

// ─── Sektionen der Startseite ───────────────────────────────────────────────

/**
 * Reihenfolge der verschiebbaren Startseiten-Sektionen. Hero, Trust-Leiste,
 * Statistiken und das Spenden-Banner bleiben fest verankert.
 */
export const HOME_SECTIONS = [
  'mission',
  'services',
  'projects',
  'dogs',
  'story',
  'quote',
  'faq',
] as const;

export type HomeSection = (typeof HOME_SECTIONS)[number];

/**
 * Bereinigt die im CMS gespeicherte Reihenfolge:
 * Unbekanntes raus, Duplikate raus, fehlende Sektionen hinten anhängen.
 *
 * Ohne das Anhängen würde eine veraltete Liste (gespeichert bevor eine neue
 * Sektion existierte) diese Sektion stillschweigend von der Seite entfernen.
 */
export function resolveSectionOrder(
  saved: ReadonlyArray<string | null | undefined> | null | undefined,
): HomeSection[] {
  const seen = new Set<HomeSection>();
  const order: HomeSection[] = [];

  for (const key of saved ?? []) {
    if (!key) continue;
    const section = key as HomeSection;
    if (!HOME_SECTIONS.includes(section) || seen.has(section)) continue;
    seen.add(section);
    order.push(section);
  }

  for (const section of HOME_SECTIONS) {
    if (!seen.has(section)) order.push(section);
  }

  return order;
}
