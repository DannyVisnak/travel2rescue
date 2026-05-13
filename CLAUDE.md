# CLAUDE.md — Travel2Rescue e.V. Website

## Project

Static website for **Travel2Rescue e.V.** — a German nonprofit (Selb, Bavaria) run by Fynn Otter & Eileen Medved from Lombok, Indonesia. They rescue, treat, and rehome street dogs (and cats). Conversion goal: donations (PayPal) and adoption inquiries. German language throughout.

## Commands

```bash
npm run dev      # Astro dev server on http://localhost:4321
npm run build    # Static output to dist/
npm run preview  # Preview built site
```

No test suite, no linter, no formatter. TypeScript errors surface during `npm run build`.

## Tech Stack

- **Astro 5** static site, `trailingSlash: 'always'`, `build.format: 'directory'`
- **Tailwind CSS v4** via `@tailwindcss/vite` — NO PostCSS config
- **TypeScript strict** (`astro/tsconfigs/strict`)
- **`@/*` alias** → `src/*`
- **`@astrojs/sitemap`** — site URL: `https://www.travel2rescue.de`
- **No React** — pure Astro components only
- **Web3Forms** for contact/adoption form submission (key placeholder: `REPLACE_WITH_WEB3FORMS_KEY`)
- **Fonts**: Inter from rsms.me + Clash Display from fontshare CDN

## Site Structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/index.astro` | Home — hero, stats, about, projects, dogs, donate CTA |
| `/mission/` | `src/pages/mission.astro` | 50k street dogs problem + 4 pillars |
| `/projekte/` | `src/pages/projekte.astro` | 3 projects (Hundehütten, Müllhaide, Wing NGO) |
| `/adoptieren/` | `src/pages/adoptieren/index.astro` | All dog profiles + process |
| `/adoptieren/[id]/` | `src/pages/adoptieren/[id].astro` | Individual dog page (dynamic) |
| `/adoptieren/formular/` | `src/pages/adoptieren/formular.astro` | Full 39-field adoption form |
| `/helfen/` | `src/pages/helfen.astro` | Donate/volunteer/adopt funnels |
| `/ueber-uns/` | `src/pages/ueber-uns.astro` | Fynn & Eileen origin story |
| `/linktree/` | `src/pages/linktree.astro` | Social link hub (12 links) |
| `/impressum/` | `src/pages/impressum.astro` | Legal — keep verbatim |
| `/datenschutz/` | `src/pages/datenschutz.astro` | Privacy policy — keep verbatim |

## Data Layer

All content is typed TypeScript in `src/data/` — never MDX/markdown:

- **`src/data/site.ts`** — `SITE` (name, url, email, phone, address, social links incl. PayPal + TikTok, bankverbindung, stats, og), `NAV`, `NAV_CTA`
- **`src/data/dogs.ts`** — `Dog` interface + `DOGS` array (9 real dogs: Flummi, Minnie, Molly, Milka, Jack, Linus, Freddy, Kiki, Pinki) + `ADOPTION_STEPS`
- **`src/data/projects.ts`** — `Project` interface + `PROJECTS` array (3 projects)

## Key Data Values

```ts
// PayPal donate link (do NOT change without updating everywhere)
paypal: 'https://www.paypal.com/donate/?hosted_button_id=AYZRLZ6YJ7SNA'

// TikTok
tiktok: 'https://www.tiktok.com/@travel2rescue?_t=8hlW78pdQ49&_r=1'

// Instagram
instagram: 'https://www.instagram.com/travel2rescue'

// Facebook
facebook: 'https://www.facebook.com/travel2rescue'

// Bank
iban: 'DE83 7805 0000 0223 2368 37'
bank: 'Sparkasse Hochfranken'
empfaenger: 'Travel2Rescue e.V.'

// Vereinsregister
VR 200625 · Vereinsregister Hof
```

## Design System

Tokens live in `src/styles/global.css` under `@theme`:
- `--color-black: #0D0D0D` — page background
- `--color-forest: #1A3D2B` — secondary sections
- `--color-amber: #F59313` — primary accent (CTAs, highlights)
- `--color-gray-dark: #1A1A1A` — card backgrounds
- `--color-gray-mid: #2D2D2D` — nested cards

Component classes to use (never re-implement inline):
`container-x`, `card`, `btn-primary`, `btn-ghost`, `btn-large`, `pill`, `eyebrow`, `section-heading`, `section-subheading`, `stat-number`, `stat-label`, `prose-dark`, `input-field`, `form-label`

**Tailwind v4 rule**: Never `@apply` a custom component class inside another custom class — causes "unknown utility" error. Inline all utilities instead.

## Components

- `Header.astro` — fixed nav, mobile hamburger (aria-expanded toggles), PayPal CTA opens `target="_blank"`
- `Footer.astro` — 4-col grid, social icons (Instagram, Facebook, PayPal, TikTok)
- `StatsBand.astro` — 4 stats (2.500+ Kastrationen, 3,7 t Futter, 100+ operiert, 0€ Verwaltungskosten)
- `CTABand.astro` — reusable CTA strip with `headline`, `sub`, `primary`, `secondary` props
- `ProjectCard.astro` — project card with image, status badge, impact facts
- `DogCard.astro` — adoption dog card, links to `/adoptieren/[dog.id]/`
- `FAQItem.astro` — `<details>/<summary>` accordion
- `ContactForm.astro` — Web3Forms POST, `role="alert"` on result
- `ContactForm.astro` — accepts `subject` prop

## Images

All images live in `public/images/`. Key assignments:

| Section | Image |
|---|---|
| Home hero | `fynn eileen dogs horizontal.jpg` |
| Rettung tile | `IMG_4737.jpeg` (Eileen on motorcycle with rescued puppy) |
| Medizin tile | `IMG_2106.jpeg` (vet operating at beach) |
| Kastration tile | `IMG_7449.jpeg` (2000 Kastrationen celebration) |
| Fütterung tile | `IMG_2337.jpeg` (Eileen feeding multiple dogs) |
| Flummi | `IMG_0991.jpeg` |
| Minnie | `DSCF2189.jpeg` |
| Molly | `IMG_2027.jpeg` |
| Milka | `IMG_2793.jpeg` |
| Jack | `DSCF2220.jpeg` |
| Linus | `IMG_2205.jpeg` |
| Freddy | `IMG_8636.jpeg` |
| Kiki | `IMG_8309.jpeg` |
| Pinki | `IMG_9452.jpeg` |

## Conventions

- German UI copy throughout. `lang="de"`, `og:locale="de_DE"`
- All internal hrefs end with trailing slash
- PayPal CTA always opens `target="_blank" rel="noopener noreferrer"`
- No Betterplace — removed. Donation options: PayPal (primary) + Überweisung with real IBAN
- WCAG: skip link in BaseLayout, `aria-expanded` on hamburger, `aria-label` on all `<nav>`, `role="alert"` on form results
- `overflow-x: hidden` on body (mobile overflow fix)
- No Betterplace references anywhere

## GitHub

Remote: `https://github.com/DannyVisnak/travel2rescue`  
Branch: `main`
