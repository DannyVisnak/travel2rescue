import sharp from 'sharp';
import { readdirSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'public/images';
const MAX = 1920;       // genug für Full-Bleed-Hero auf üblichen Screens
const QUALITY = 78;

let saved = 0, processed = 0, skipped = 0;
for (const name of readdirSync(DIR)) {
  if (!/\.(jpe?g)$/i.test(name)) { continue; }
  const file = join(DIR, name);
  const before = statSync(file).size;
  const tmp = file + '.tmp';
  try {
    // .rotate() ohne Argumente wendet die EXIF-Orientierung physisch an,
    // bevor die Metadaten entfernt werden — sonst kippen Handyfotos um.
    await sharp(file)
      .rotate()
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(tmp);
    const after = statSync(tmp).size;
    if (after < before * 0.9) {
      renameSync(tmp, file);
      saved += before - after;
      processed++;
    } else {
      unlinkSync(tmp);
      skipped++;
    }
  } catch (e) {
    console.error('FEHLER', name, e.message);
    try { unlinkSync(tmp); } catch {}
  }
}
console.log(`optimiert: ${processed}, übersprungen: ${skipped}, gespart: ${(saved / 1048576).toFixed(1)} MB`);
