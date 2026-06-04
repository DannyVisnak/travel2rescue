// Generates a 1200×630 Open Graph share card at public/og-image.png.
// Run with: node scripts/generate-og.mjs
// Composites the brand wordmark + tagline over a darkened hero photo.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SRC = join(root, 'public/images/fynn eileen dogs horizontal.jpg');
const OUT = join(root, 'public/og-image.png');

const W = 1200;
const H = 630;
const ACCENT = '#6FA858'; // matches the live (main) sage-green accent

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>

  <!-- accent eyebrow -->
  <text x="80" y="430" font-family="Arial, Helvetica, sans-serif" font-size="26"
        font-weight="700" letter-spacing="6" fill="${ACCENT}">TRAVEL2RESCUE e.V. · LOMBOK</text>

  <!-- wordmark / headline -->
  <text x="78" y="510" font-family="Arial, Helvetica, sans-serif" font-size="78"
        font-weight="800" fill="#ffffff">50.000 Straßenhunde.</text>
  <text x="78" y="582" font-family="Arial, Helvetica, sans-serif" font-size="40"
        font-weight="600" fill="#ffffff" fill-opacity="0.85">Nur wir sehen hin. · travel2rescue.de</text>

  <!-- transparency chip -->
  <g>
    <rect x="80" y="64" width="290" height="48" rx="24" fill="#000000" fill-opacity="0.45"/>
    <circle cx="106" cy="88" r="6" fill="${ACCENT}"/>
    <text x="124" y="96" font-family="Arial, Helvetica, sans-serif" font-size="22"
          font-weight="600" fill="#ffffff">100% Spenden · 0% Verwaltung</text>
  </g>
</svg>`);

const base = await sharp(SRC)
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .toBuffer();

await sharp(base)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .png({ quality: 90 })
  .toFile(OUT);

console.log('Wrote', OUT);
