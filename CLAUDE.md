# CLAUDE.md — Travel2Rescue e.V. Website

## Project

Static Astro 5 site for **Travel2Rescue e.V.**, a German-registered nonprofit (Selb, Bavaria) run by Fynn Otter & Eileen Medved from Lombok, Indonesia. They rescue, treat, and rehome street dogs (and cats). Conversion goal: donations (PayPal) + adoption inquiries. German language throughout.

**Live site**: `https://travel2rescue.de`  
**GitHub repo**: `https://github.com/DannyVisnak/travel2rescue`  
**CMS admin**: `https://travel2rescue.de/keystatic/`

## Commands

```bash
npm run dev      # Astro dev on http://localhost:4321
npm run build    # Static + Vercel SSR bundle to dist/
npm run preview  # Preview built site
```

No test suite, no linter. TypeScript errors surface in `npm run build`.

## Tech Stack

| | |
|---|---|
| **Astro 5** | `trailingSlash: 'always'`, `build.format: 'directory'` |
| **Tailwind CSS v4** | via `@tailwindcss/vite` — no PostCSS config |
| **`@astrojs/vercel`** | SSR adapter (v8.x, Astro 5 compatible) |
| **Keystatic CMS** | `@keystatic/core` ^0.5.x + `@keystatic/astro` ^5.x |
| **`@astrojs/react`** | Required by Keystatic admin UI |
| **`@/*` alias** | → `src/*` |

Design tokens in `src/styles/global.css` under `@theme`. Accent color is coral `#F25C3A` (overrides `--color-amber-500` / `--color-amber-400`). Use `text-amber-500`, `bg-amber-500`, etc. — they resolve to coral. Do **not** use accent on large backgrounds.

**Tailwind v4 rule**: Never `@apply` a custom component class inside another custom class — causes "unknown utility" error. Inline all utilities instead.

## Site Structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/index.astro` | Home — hero, stats, about, projects, dogs, quote, FAQ |
| `/mission/` | `src/pages/mission.astro` | 50k problem + 4 pillars (reads `missionContent`) |
| `/projekte/` | `src/pages/projekte.astro` | Projects (reads Keystatic) |
| `/adoptieren/` | `src/pages/adoptieren/index.astro` | Dog profiles + process + FAQ |
| `/adoptieren/[id]/` | `src/pages/adoptieren/[id].astro` | Individual dog detail (dynamic) |
| `/adoptieren/formular/` | `src/pages/adoptieren/formular.astro` | 39-question adoption form → Web3Forms |
| `/helfen/` | `src/pages/helfen.astro` | Donate/volunteer/adopt funnels + FAQ |
| `/ueber-uns/` | `src/pages/ueber-uns.astro` | Team bios (reads Keystatic) + origin story |
| `/linktree/` | `src/pages/linktree.astro` | Social link hub (Instagram traffic) |
| `/impressum/` | `src/pages/impressum.astro` | Legal — keep verbatim |
| `/datenschutz/` | `src/pages/datenschutz.astro` | Privacy — keep verbatim |

## Data Layer

### Keystatic CMS (primary content source)

All content Eileen edits goes through Keystatic at `https://travel2rescue.de/keystatic/`.

**Reader instance**: `src/lib/keystatic.ts` → `reader` singleton used by all pages.

| Reader call | Content | JSON file |
|---|---|---|
| `reader.collections.dogs.all()` | Dog profiles | `content/dogs/*.json` |
| `reader.collections.projects.all()` | Projects | `content/projects/*.json` |
| `reader.singletons.settings.read()` | Stats + PayPal URL + phone | `content/settings.json` |
| `reader.singletons.homeContent.read()` | Whole home page: hero, story, services, dogs teaser, quote, FAQs | `content/pages/home.json` |
| `reader.singletons.missionContent.read()` | Whole mission page: hero, problems, quote, pillars, cats, vision | `content/pages/mission.json` |
| `reader.singletons.helpContent.read()` | Whole helfen page: hero, donation tiers, ways, volunteer, adopt steps, FAQs | `content/pages/help.json` |
| `reader.singletons.adoptionContent.read()` | Whole adoptieren page: hero, commitment, timeline, benefits, form intro | `content/pages/adoption.json` |
| `reader.singletons.aboutContent.read()` | Über-uns page: hero, story chapters, team/reality headings, contact | `content/pages/about.json` |
| `reader.singletons.projectsPage.read()` | Projekte page hero + outro (project entries stay in the collection) | `content/pages/projects.json` |
| `reader.singletons.linktreeContent.read()` | Linktree tagline + link list | `content/pages/linktree.json` |
| `reader.singletons.siteContent.read()` | Footer tagline + recurring CTA-band headline/sub | `content/site.json` |
| `reader.singletons.team.read()` | Eileen & Fynn bios + photo filenames | `content/team.json` |

Always add `?? fallback` when using singleton values — `read()` returns `null` if the file doesn't exist. **Every page keeps its original copy as an inline fallback**, so a missing/empty JSON field renders identically to before. Multi-line headings/paragraphs are stored with `\n` and rendered through `src/components/Lines.astro` (splits on `\n` → `<br/>`). Headings with a coloured accent are split into `…Title` + `…TitleAccent`/`…Accent` fields that the template recomposes — this preserves the design while keeping both parts editable.

**Image field note**: Dog and project `image` fields use `fields.image({ directory: 'public/images', publicPath: '/images/' })`. JSON stores just the filename (e.g., `IMG_0991.jpeg`). The reader prepends `/images/` automatically. When migrating existing entries with `/images/filename` paths, strip the prefix.

### Static fallbacks

`src/data/site.ts` — `SITE` object (name, url, email, phone, address, social links, bank details, OG image). Used as fallback when Keystatic singletons are null. Also exports `NAV`, `NAV_CTA`.

`src/data/dogs.ts` — `ADOPTION_STEPS` array (4 steps for the adoptieren page). Dog profiles are now in Keystatic, not here.

`src/data/projects.ts` — `Project` interface only. Project data is in Keystatic.

### Key static data

```ts
// From src/data/site.ts:
email:    'travel2rescue@gmail.com'
phone:    '+62 853-5380-7785'
paypal:   'https://www.paypal.com/donate/?hosted_button_id=AYZRLZ6YJ7SNA'
iban:     'DE83 7805 0000 0223 2368 37'
bank:     'Sparkasse Hochfranken'
register: 'VR 200625 · Vereinsregister Hof'
instagram: 'https://www.instagram.com/travel2rescue'
tiktok:   'https://www.tiktok.com/@travel2rescue?_t=8hlW78pdQ49&_r=1'
```

## Components

- `BaseLayout.astro` — SEO meta (title, description, canonical, og:image), Organization JSON-LD, Inter from rsms.me, TopBar + Header + Footer
- `Header.astro` — fixed nav, mobile hamburger (`aria-expanded`), logo (h-16), PayPal CTA
- `Footer.astro` — 4-col grid, social icons (Instagram, Facebook, PayPal, TikTok)
- `StatsBand.astro` — reads `reader.singletons.settings` directly; use `<StatsBand />` without props
- `CTABand.astro` — accepts `headline`, `sub`, `primary`, `secondary` props; `headline`/`sub` default to `siteContent` CMS values
- `Lines.astro` — renders a CMS string's `\n` as `<br/>`; used for all CMS-managed headings/paragraphs
- `ProjectCard.astro` — project card with image + status badge
- `DogCard.astro` — adoption card linking to `/adoptieren/[dog.id]/`
- `FAQItem.astro` — `<details>/<summary>` accordion
- `ContactForm.astro` — Web3Forms POST, `role="alert"` result, accepts `subject` prop

**Use these CSS classes** from `global.css` — never rebuild them inline: `container-x`, `card`, `btn-primary`, `btn-ghost`, `btn-large`, `pill`, `eyebrow`, `section-heading`, `section-subheading`, `stat-number`, `stat-label`, `prose-dark`, `input-field`, `form-label`

## Keystatic CMS Setup

### What Eileen can edit

Eileen can now edit **essentially every visible text and most images** across the public pages. Each page has its own admin entry:

| Section in admin | What changes |
|---|---|
| 🐾 Hunde | Add dogs, update stories, upload photos directly, mark as vermittelt |
| 🏗️ Projekte | Update descriptions, impacts, upload photos |
| ⚙️ Statistiken & Kontakt | Kastrationen/Futter/Hunde numbers, PayPal link, WhatsApp number |
| 🏠 Startseite | Hero, trust strip, story teaser, "Was wir tun" cards, dogs teaser, founder quote, FAQs |
| 🎯 Mission-Seite | Hero, problem cards, quote, the 4 pillars, cats section, vision |
| 💝 Helfen-Seite | Hero, donation tiers, 3 ways, volunteer, adoption steps, all FAQs (helfen + adoptieren) |
| 🐕 Adoptions-Seite | Hero, 6–7-month commitment block, timeline, benefits, form intro |
| 📖 Über-uns-Seite (Texte) | Hero, 4 story chapters, team/reality section copy, contact heading |
| 👥 Team – Bios & Fotos | Eileen & Fynn: subtitles, 2-paragraph bios, profile photos |
| 🏗️ Projekte-Seite (Texte) | Projects page hero + closing block (project cards live in 🏗️ Projekte) |
| 🔗 Linktree-Seite | Tagline + the full list of links (label, description, URL, icon, highlight) |
| 🌐 Footer & Allgemein | Footer tagline + the recurring "Wir brauchen Deine Hilfe" donation banner |

**Still hardcoded (intentionally):** legal pages (Impressum/Datenschutz — keep verbatim), nav labels & bank details (`src/data/site.ts`), the adoption form's ~30 screening questions (`formular.astro` — battle-tested, change with a developer), decorative SVG icons, and the `StatsBand` labels (the numbers are editable in ⚙️). Icons on cards/links stay fixed by position — editing card text keeps the matching icon.

### Env vars (all required in Vercel)

| Variable | Purpose | Notes |
|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub **App** client ID | From the App settings page (`github.com/settings/apps/<slug>`) |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App client secret | Generated under "Client secrets" on the App settings page; rotate if leaked |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | The App's URL slug | Used by the Keystatic admin UI to render the install button |
| `KEYSTATIC_SECRET` | Session-cookie signing secret (≥32 chars) | Generate: `openssl rand -base64 32`. Internal only — does not match anything external. |

### GitHub App (NOT a classic OAuth App)

Keystatic requires a **GitHub App**, not a classic OAuth App. Classic OAuth Apps don't issue refresh tokens, and Keystatic's token-response schema requires `refresh_token` + `expires_in` + `refresh_token_expires_in`. Pointing Keystatic at an OAuth App fails silently with "Authorization failed" after the callback.

Create at `https://github.com/settings/apps/new`:

- **Homepage URL**: `https://travel2rescue.de`
- **Callback URL**: `https://travel2rescue.de/api/keystatic/github/oauth/callback` (no trailing slash — Astro 308-redirects to add it)
- ☑️ **Request user authorization (OAuth) during installation**
- ☑️ **Expire user authorization tokens** ← critical, controls whether refresh tokens are issued
- Webhook → uncheck "Active"
- Repository permissions:
  - **Contents**: Read and write
  - **Metadata**: Read-only (mandatory, locked — may not appear as a separate row)
  - **Pull requests**: Read and write
- Where can this GitHub App be installed: Only on this account

After creating, install on `DannyVisnak/travel2rescue` (left sidebar → Install App → select the repo).

### Custom Keystatic API route — kept for cookie handling

`src/pages/api/keystatic/[...params].ts` overrides Keystatic's auto-injected route to reproduce `@keystatic/astro`'s set-cookie logic via `context.cookies.set(...)` (otherwise Astro doesn't pick up the `Set-Cookie` headers Keystatic returns).

The original `req.url`-has-hostname-`localhost` workaround that lived here is no longer needed — `security.allowedDomains` in `astro.config.mjs` makes Astro trust `x-forwarded-host` and constructs `request.url` correctly. Don't reintroduce it.

### Troubleshooting Keystatic login

| Symptom | Cause | Fix |
|---|---|---|
| "Authorization failed" after callback | Configured a classic OAuth App instead of a GitHub App — token response is missing `refresh_token` / `expires_in` and Keystatic's schema rejects it | Create a GitHub App (NOT an OAuth App) and check "Expire user authorization tokens"; update Vercel env vars |
| "Authorization failed" after callback (with a GitHub App) | `KEYSTATIC_SECRET` < 32 chars OR `KEYSTATIC_GITHUB_CLIENT_SECRET` doesn't match the App | Regenerate `KEYSTATIC_SECRET`, verify the client secret matches GitHub, redeploy |
| `403 Cross-site POST form submissions are forbidden` on `/api/keystatic/github/refresh-token/` | Astro CSRF check sees `context.url.origin` as `http://localhost` because `x-forwarded-host` isn't trusted | Ensure `security.allowedDomains` includes `travel2rescue.de` in `astro.config.mjs` |
| `redirect_uri=https://localhost/...` in GitHub error | `security.allowedDomains` not configured | Add `allowedDomains` to `astro.config.mjs` |
| "Bad verification code" | OAuth code expired (>10 min) or was already used | Restart the login flow |
| Admin loads but GitHub shows auth error | Callback URL mismatch in the GitHub App | Ensure callback is `https://travel2rescue.de/api/keystatic/github/oauth/callback` (no trailing slash) |
| Specific singleton/collection page hangs with "Failed to fetch" | An image field references a filename with weird chars (trailing space, etc.) — Keystatic UI fetches images via GitHub API and chokes on the encoded URL | Rename the file to something filesystem-clean and update the JSON reference |

## Images

All images in `public/images/`. Key images:

| Location | Filename |
|---|---|
| Home hero | `new_hero.jpeg` (Eileen on Müllhaide dump site) |
| Home "Fynn & Eileen" section | `fynn eileen walking.jpeg` |
| Home quote | `fynn eileen dogs horizontal.jpg` |
| Eileen portrait | `eileen-portrait.jpeg` |
| Fynn portrait | `fynn portrait.jpeg` |
| Dog photos | `IMG_0991.jpeg` (Flummi), `DSCF2189.jpeg` (Minnie), etc. — see content/dogs/*.json |

## Deployment

Push to `main` → Vercel auto-deploys (~30s build). All env vars are set in Vercel project settings.

**Do not commit** `.vercel/` directory.

## Known Quirks & Issues

1. **Astro route collision warning** — "The route `/api/keystatic/[...params]` is defined in both...". This is expected — our override file takes priority. Just a warning, not an error. Will become an error in a future Astro version; solution will be to configure the Keystatic integration to not inject the route.

2. **Node 24 / Vercel Node 22 warning** — Vercel serverless runs Node 22 locally but Node 24 is installed. No action needed.

3. **Web3Forms key placeholder** — `REPLACE_WITH_WEB3FORMS_KEY` in `src/components/ContactForm.astro` and `src/pages/adoptieren/formular.astro`. Replace with a real key from `https://web3forms.com/` before forms work.

4. **`fields.image()` path format** — JSON stores filename only (not `/images/filename`). The reader prepends `publicPath`. If you see broken images after editing, check that `content/*/[entry].json` has bare filenames, not full paths.

5. **Heavy portrait images (~6MB each)** — `eileen-portrait.jpeg` and `fynn portrait.jpeg` are ~3500px wide. Slow to fetch in Keystatic admin and on the live page. Consider downscaling to ~1200px / quality 80 (~300KB).

## To-Do List

### Critical (broken / blocking)

- [ ] **Web3Forms key**: Replace `REPLACE_WITH_WEB3FORMS_KEY` in `ContactForm.astro` and `formular.astro` — contact and adoption forms don't work without this

### Content (needs Eileen)

- [ ] **Real dog stories and photos** for 8 dogs (Minnie, Molly, Milka, Jack, Linus, Freddy, Kiki, Pinki) — current content is placeholder text
- [ ] **Real photos** via Keystatic admin (Eileen can upload directly from her phone)
- [ ] **Stats update** — verify Kastrationen/Futter/Operiert numbers are current (editable in Keystatic: ⚙️ Statistiken)
- [ ] **PayPal link** — verify the URL is correct and active (editable in Keystatic: ⚙️ Statistiken)

### Technical improvements

- [ ] **OG image** — Create a proper 1200×630 branded PNG (`public/og-image.png`). Currently using `fynn eileen dogs horizontal.jpg` which isn't sized correctly for social sharing.
- [ ] **Sitemap** — Verify all routes appear in `/sitemap-index.xml` after deploy
- [ ] **Google Search Console** — Submit sitemap, verify domain ownership
- [ ] **Patenschaft page** — FAQ on helfen page mentions Patenschaften but there's no dedicated page/flow for it

### CMS improvements (medium effort)

- [x] **Origin story chapters** (on Über uns page) — now a `fields.array()` in `aboutContent`.
- [x] **Mission page pillars** — the 4 pillar cards on `/mission/` are now in `missionContent`.
- [x] **Full page-text CMS** — every public page (home, mission, helfen, adoptieren, ueber-uns, projekte, linktree) plus footer/CTA now reads its copy from Keystatic singletons with inline fallbacks.
- [ ] **Adoption form questions** — See evaluation below. (Still the one deliberately-hardcoded text block.)

### Nice to have (low priority)

- [ ] **Patenschaft flow** — Monthly sponsorship for a specific dog (requires Stripe or external form)
- [ ] **News/Aktuelles section** — Keystatic collection for news posts (easy to add, needs design)
- [ ] **Instagram feed embed** — Live feed from @travel2rescue on home page or linktree

---

## Adoption Form — CMS Evaluation

The adoption form (`/adoptieren/formular/`) has ~25 questions in 7 fieldsets. The "which dog" section already updates dynamically from Keystatic dogs.

**Option A — Label-only CMS** (~1 day work)  
Add a `formLabels` singleton to Keystatic with ~30 text fields (one per question label + section heading). The form logic (radio vs. text, required flags, option values) stays hardcoded. Covers ~90% of what Eileen might want to change.

**Option B — Full dynamic form** (~3 days work)  
A `formSections` collection where each section has an array of questions with type (radio/text/textarea), label, options, required flag. Requires a dynamic React form renderer. Completely flexible but complex.

**Recommendation: Do nothing for now.** The form questions are carefully curated screening criteria that should be reviewed by a developer before changing. They've been battle-tested. The one thing that already changes dynamically (which dogs appear) is already wired to Keystatic. If Eileen frequently requests question changes, implement Option A — it's the best effort/value trade-off.
