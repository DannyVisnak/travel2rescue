#!/usr/bin/env node
/**
 * Einmal-Migration: alte Text-Felder → neue Absatz-Listen.
 *
 * Hintergrund: Die Fließtext-Felder waren feste Einzelfelder (…Text1/…Text2,
 * Bio1/Bio2, story, FAQ-Antwort). Eileen konnte darin keinen dritten Absatz
 * anlegen. Sie sind jetzt `fields.array(fields.markdoc.inline())` — eine Liste,
 * in der jeder Eintrag ein Absatz mit fett/kursiv/Link ist.
 *
 * Gespeichert wird pro Absatz ein Markdown-STRING (markdoc.inline ist ein
 * 'assets'-Feld, kein 'content'-Feld) — es entstehen also keine .mdoc-Dateien
 * und das `includeFiles`-Bundling bleibt unverändert.
 *
 * Das Skript ist idempotent: bereits migrierte Felder (schon ein Array) werden
 * übersprungen. Ohne `--write` läuft es als Trockenlauf.
 *
 *   node scripts/migrate-richtext.mjs           # zeigt nur an, was passieren würde
 *   node scripts/migrate-richtext.mjs --write   # schreibt die Dateien
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const WRITE = process.argv.includes('--write');
const CONTENT = 'content';

/**
 * Klartext → Markdown-String.
 *
 * Der Altbestand ist reiner Text. Zeichen, die Markdown als Formatierung
 * liest (*, _, [, ], `, # am Zeilenanfang …), müssen escaped werden, sonst
 * wird aus „5 * 3" beim nächsten Öffnen im Admin kursiver Text.
 */
function escapeMarkdown(text) {
  return text
    .replace(/([\\`*_[\]<>])/g, '\\$1')
    .replace(/^(\s*)([#>+-]|\d+\.)(\s)/gm, '$1\\$2$3');
}

/** Ein Alt-String wird zu einer Absatz-Liste (Leerzeile trennt Absätze). */
function toParagraphs(...values) {
  return values
    .filter((value) => typeof value === 'string' && value.trim())
    .flatMap((value) => value.split(/\n\s*\n/))
    .map((block) => block.trim())
    .filter(Boolean)
    .map(escapeMarkdown);
}

/** Ist das Feld schon migriert? */
const isMigrated = (value) => Array.isArray(value);

const changes = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function saveJson(path, data, note) {
  changes.push(`${path} — ${note}`);
  if (WRITE) writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

/** Mehrere alte Felder zu einem neuen Absatz-Feld zusammenführen. */
function mergeFields(data, sources, target) {
  if (isMigrated(data[target])) return null;
  const present = sources.filter((key) => typeof data[key] === 'string' && data[key].trim());
  const paragraphs = toParagraphs(...sources.map((key) => data[key]));
  sources.forEach((key) => delete data[key]);
  if (!paragraphs.length) return present.length ? `${target}: geleert` : null;
  data[target] = paragraphs;
  return `${sources.join('+')} → ${target} (${paragraphs.length} Absätze)`;
}

/** Ein Feld an Ort und Stelle von String zu Absatz-Liste machen. */
function convertInPlace(container, key) {
  if (isMigrated(container[key])) return null;
  if (typeof container[key] !== 'string') return null;
  const paragraphs = toParagraphs(container[key]);
  if (!paragraphs.length) {
    delete container[key];
    return null;
  }
  container[key] = paragraphs;
  return `${key} (${paragraphs.length} Absätze)`;
}

// ─── Seiten-Singletons ──────────────────────────────────────────────────────
const singletonJobs = [
  {
    file: 'pages/home.json',
    merges: [
      [['missionText1', 'missionText2'], 'missionBody'],
      [['storyText1', 'storyText2'], 'storyBody'],
    ],
    faqKeys: ['homeFaqs'],
  },
  {
    file: 'pages/mission.json',
    merges: [
      [['introText'], 'introBody'],
      [['catsText1', 'catsText2'], 'catsBody'],
      [['visionText1', 'visionText2'], 'visionBody'],
    ],
  },
  {
    file: 'pages/help.json',
    merges: [[['volunteerText'], 'volunteerBody']],
    faqKeys: ['helpFaqs', 'adoptionFaqs'],
  },
  {
    file: 'team.json',
    merges: [
      [['eileenBio1', 'eileenBio2'], 'eileenBody'],
      [['fynnBio1', 'fynnBio2'], 'fynnBody'],
      [['showcaseText'], 'showcaseBody'],
    ],
  },
];

for (const job of singletonJobs) {
  const path = join(CONTENT, job.file);
  if (!existsSync(path)) continue;
  const data = readJson(path);
  const notes = [];

  for (const [sources, target] of job.merges) {
    const note = mergeFields(data, sources, target);
    if (note) notes.push(note);
  }

  for (const faqKey of job.faqKeys ?? []) {
    if (!Array.isArray(data[faqKey])) continue;
    let converted = 0;
    for (const entry of data[faqKey]) {
      if (entry && convertInPlace(entry, 'answer')) converted += 1;
    }
    if (converted) notes.push(`${faqKey}: ${converted} Antworten`);
  }

  if (notes.length) saveJson(path, data, notes.join(', '));
}

// ─── Über-uns: Kapitel-Texte ────────────────────────────────────────────────
const aboutPath = join(CONTENT, 'pages/about.json');
if (existsSync(aboutPath)) {
  const data = readJson(aboutPath);
  let converted = 0;
  for (const chapter of data.storyChapters ?? []) {
    if (chapter && convertInPlace(chapter, 'text')) converted += 1;
  }
  if (converted) saveJson(aboutPath, data, `storyChapters: ${converted} Kapitel-Texte`);
}

// ─── Hunde-Geschichten ──────────────────────────────────────────────────────
const dogsDir = join(CONTENT, 'dogs');
if (existsSync(dogsDir)) {
  for (const file of readdirSync(dogsDir).filter((f) => f.endsWith('.json'))) {
    const path = join(dogsDir, file);
    const data = readJson(path);
    const note = convertInPlace(data, 'story');
    if (note) saveJson(path, data, note);
  }
}

// ─── Ergebnis ───────────────────────────────────────────────────────────────
if (!changes.length) {
  console.log('Nichts zu tun — alle Felder sind bereits migriert.');
} else {
  console.log(`${changes.length} Datei(en)${WRITE ? ' migriert' : ' würden migriert'}:\n`);
  for (const change of changes) console.log('  ' + change);
  if (!WRITE) console.log('\nTrockenlauf. Mit --write ausführen, um zu schreiben.');
}
