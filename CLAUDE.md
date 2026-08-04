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

Design tokens in `src/styles/global.css` under `@theme`. Accent color is pastel pink `#F77AB4` (overrides `--color-amber-500` / `--color-amber-400`). Use `text-amber-500`, `bg-amber-500`, etc. — they resolve to pink. Do **not** use accent on large backgrounds.

**Palette (Juni 2026)**: warm browns + pink + beige — Eileen's reference is the "Was dich erwartet" section on /adoptieren/. The old gray/black neutrals are remapped in `@theme`: `--color-black` → `#1A1410` (dark brown, body bg + `text-black` on light sections), `--color-gray-dark` → `#241A13` (lighter brown, cards + alternate sections), `--color-gray-mid` → `#3A2C20` (light brown). `bg-black` / `bg-gray-dark` / `text-black` therefore render **brown** sitewide — don't "fix" them back. Light sections use `bg-beige` with `text-black` headings.

**Tailwind v4 rule**: Never `@apply` a custom component class inside another custom class — causes "unknown utility" error. Inline all utilities instead.

## Site Structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/index.astro` | Home — hero, stats, about, services, dogs, quote, FAQ |
| `/mission/` | `src/pages/mission.astro` | 50k problem + 4 pillars (reads `missionContent`) |
| `/projekte/` | `src/pages/projekte.astro` | Projects (reads Keystatic) |
| `/adoptieren/` | `src/pages/adoptieren/index.astro` | Adoption funnel: process, 6-dog teaser, FAQ |
| `/adoptieren/hunde/` | `src/pages/adoptieren/hunde.astro` | Full dog collection grid (all dogs, auto-grows with Keystatic) |
| `/adoptieren/[id]/` | `src/pages/adoptieren/[id].astro` | Individual dog detail with Steckbrief (on-demand SSR, emits Article JSON-LD) |
| `/adoptieren/formular/` | `src/pages/adoptieren/formular.astro` | 39-question adoption form → POSTs to `/api/adoption` (Resend) |
| `/helfen/` | `src/pages/helfen.astro` | Donate/volunteer/adopt funnels + FAQ |
| `/ueber-uns/` | `src/pages/ueber-uns.astro` | Team bios (reads Keystatic) + origin story |
| `/linktree/` | `src/pages/linktree.astro` | Social link hub (Instagram traffic) |
| `/danke/` | `src/pages/danke.astro` | Thank-you page (noindex, `?typ=kontakt|adoption` switches copy) |
| `/404` | `src/pages/404.astro` | Branded 404 (noindex) |
| `/impressum/` | `src/pages/impressum.astro` | Legal — keep verbatim |
| `/datenschutz/` | `src/pages/datenschutz.astro` | Privacy — keep verbatim |
| `/medical-report/` | `src/pages/medical-report.astro` | English emergency report form (rebuilt Google Form) — required photos, client-side compression |
| `/api/contact` | `src/pages/api/contact.ts` | Resend handler for ContactForm — JSON for fetch, 303 → /danke/ for native form submits; sends confirmation email to submitter |
| `/api/adoption` | `src/pages/api/adoption.ts` | Resend handler for adoption form (same pattern); also appends all answers to a Google Sheet (see env vars) |
| `/api/medical-report` | `src/pages/api/medical-report.ts` | Emergency report handler — emails Eileen with photo attachments + confirmation to reporter |
| `/api/keystatic/[...params]` | `src/pages/api/keystatic/[...params].ts` | Keystatic auth callbacks (overrides the auto-injected route to fix Astro cookie handling) |

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

Always add `|| fallback` (NOT `??`) when using singleton **text** values — `read()` returns `null` if the file doesn't exist, but returns `''` (empty string) for text fields that are missing from the JSON or emptied in the admin, and `??` doesn't catch `''` (this once rendered whole homepage sections blank). Keep `??` only for booleans (e.g. `entry.kastriert ?? true`). **Every page keeps its original copy as an inline fallback**, so a missing/empty JSON field renders identically to before. Multi-line **headings** are stored with `\n` and rendered through `src/components/Lines.astro` (splits on `\n` → `<br/>`). **Body copy** is no longer plain strings — it moved to paragraph lists rendered by `RichText.astro`; see "Rich text (paragraph lists)" below. Headings with a coloured accent are split into `…Title` + `…TitleAccent`/`…Accent` fields that the template recomposes — this preserves the design while keeping both parts editable.

**Image field note**: Image values in content JSON MUST be stored as full public paths (`/images/<file>` — for collection entries the admin writes `/images/<slug>/<field>.jpeg`). That's the format the Keystatic admin itself writes and the only one it can resolve when re-opening an entry. ⚠️ Bare filenames (`IMG_0991.jpeg`) break the admin: it shows the field as empty, silently REMOVES the image on the next save (this happened to Flummi), and can fail saves with a GraphQL "path requested for deletion" error. All values were migrated in Juni 2026. The `reader` returns values verbatim; keep wrapping with `img()` from `src/lib/img.ts` (`img(entry.image, '/images/fallback.jpg')`) — it passes `/...` through and still rescues any stray bare filename.

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
| 🐾 Hunde | Add dogs (appear automatically on /adoptieren/ + home), full Steckbrief (Geschlecht, Größe, Gewicht, kastriert/geimpft/gechipt), stories, photos, mark as vermittelt |
| 🏗️ Projekte | Update descriptions, impacts, upload photos |
| ⚙️ Statistiken & Kontakt | Kastrationen/Futter/Hunde numbers, PayPal link, WhatsApp number |
| 🏠 Startseite | Hero, trust strip, mission teaser, "Was wir tun" cards, projects teaser, dogs teaser (+ background photo), story teaser, founder quote, FAQs |
| 🎯 Mission-Seite | Hero, free intro text (before problem cards), 4 problem cards, quote, the 4 pillars, cats section, vision |
| 💝 Helfen-Seite | Hero, donation tiers, 3 ways, volunteer, adoption steps, all FAQs (helfen + adoptieren) |
| 🐕 Adoptions-Seite | Hero, 6–7-month commitment block, timeline, benefits, form intro |
| 📖 Über-uns-Seite (Texte) | Hero, 4 story chapters, team/reality section copy, contact heading |
| 👥 Team – Bios & Fotos | Eileen & Fynn: subtitles, bios (paragraph lists), profile photos |
| 🏗️ Projekte-Seite (Texte) | Projects page hero + closing block (project cards live in 🏗️ Projekte) |
| 🔗 Linktree-Seite | Tagline + the full list of links (label, description, URL, icon, highlight) |
| 🌐 Footer & Allgemein | Footer tagline + the recurring "Wir brauchen Deine Hilfe" donation banner |

**Still hardcoded (intentionally):** legal pages (Impressum/Datenschutz — keep verbatim), nav labels & bank details (`src/data/site.ts`), the adoption form's ~30 screening questions (`formular.astro` — battle-tested, change with a developer), decorative SVG icons, and the `StatsBand` labels (the numbers are editable in ⚙️). Icons on cards/links stay fixed by position — editing card text keeps the matching icon.

### Layout controls Eileen can change (August 2026)

Added after her feedback that she could edit words but "nicht deren Position oder einen kleinen Absatz hinzufügen":

| Control | Where | Notes |
|---|---|---|
| **Absätze** (paragraph lists) | All body copy — see rich text below | Add / delete / drag-reorder paragraphs, plus **bold, italic, links** |
| **Hero – Textposition** | All 5 hero pages | `links` / `mitte` / `rechts`. Picking `rechts` mirrors the darkening gradient automatically, otherwise light text lands on a bright photo |
| **Bildausschnitt** | Every hero image + **per dog** | `auto` keeps each page's hand-tuned crop (`object-[40%_center]` on home, `object-[center_40%]` on ueber-uns) — the page renders byte-identically until she picks something else |
| **Reihenfolge der Sektionen** | 🏠 Startseite | Drag-list over the 7 movable homepage sections. Hero, trust strip, StatsBand and CTABand stay fixed |
| **Sektion anzeigen** | 🏠 Startseite | One checkbox per section; hiding never deletes content |

`src/lib/layout.ts` owns all of this. **Tailwind v4 rule:** every class must appear as a complete literal string there — `object-${value}` would never reach the generated CSS and the option would silently do nothing. There's one shared stylesheet, so a build-time grep for `.object-left` / `.bg-gradient-to-l` is a valid check.

`resolveSectionOrder()` drops unknown/duplicate keys and **appends missing sections at the end** — without that, an order list saved before a new section existed would silently delete it from the page. Visibility reads with `??` (not `||`), because `false` must survive.

/admin-hilfe/ is a German cheat-sheet page for Eileen (noindex, filtered out of the sitemap) explaining these controls and which admin entry edits which page.

### Rich text (paragraph lists)

Body copy is `fields.array(fields.markdoc.inline())` via the `richParagraphs()` helper — a list where each item is one paragraph supporting **bold, italic and links**. Headings, images, dividers, tables and code are deliberately disabled so typography stays with the design.

⚠️ **Use `markdoc.inline`, never `fields.document` or block `fields.markdoc`.** Inline is an `'assets'` field: it stores the paragraph as a plain **markdown string inside the entry's JSON**, and the reader returns it synchronously. The block variants are `'content'` fields that write **separate `.mdoc` files**, which would bypass the `includeFiles` bundling and arrive empty in production (Quirk 0). `fields.document` is also deprecated upstream.

Converted: home (mission/story teasers, FAQs), mission (intro, cats, vision), helfen (volunteer, both FAQ lists), ueber-uns (chapters, both bios), team showcase, and dog stories.

Rendering goes through `src/components/RichText.astro` + `src/lib/richtext.ts`, which accept **both** shapes:
- a paragraph list from the CMS, and
- a plain multiline string (all inline template fallbacks, plus any field not yet converted) where **a blank line starts a new paragraph** and a single `\n` becomes `<br/>`.

So the `|| fallback` invariant still holds: an emptied field renders the original hardcoded copy. Anywhere plain text is required (FAQ JSON-LD in `FaqSchema.astro`, `<meta name="description">`, the DogCard teaser) use `richTextToPlain()` — never interpolate the raw value, or you'll print `[object Object]`.

`scripts/migrate-richtext.mjs` migrated the existing content (idempotent; dry-run without `--write`; escapes markdown-significant characters so existing prose can't be reinterpreted as formatting). Run it again if more fields are converted.

### Env vars

| Variable | Required? | Purpose | Notes |
|---|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | yes (CMS) | GitHub **App** client ID | From the App settings page (`github.com/settings/apps/<slug>`) |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | yes (CMS) | GitHub App client secret | Generated under "Client secrets" on the App settings page; rotate if leaked |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | yes (CMS) | The App's URL slug | Used by the Keystatic admin UI to render the install button |
| `KEYSTATIC_SECRET` | yes (CMS) | Session-cookie signing secret (≥32 chars) | Generate: `openssl rand -base64 32`. Internal only — does not match anything external. |
| `RESEND_API_KEY` | yes (forms) | Resend API key | From <https://resend.com>; without it both forms return 500 |
| `RESEND_FROM` | no | Sender address | Default: `Travel2Rescue <kontakt@travel2rescue.de>` |
| `RESEND_TO` | no | Recipient address | Default: `travel2rescue@gmail.com` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | no | Apps-Script web-app URL (ends in /exec) for the adoption-form → Google Sheet export | Script template: `scripts/google-sheets-webhook.gs`; without it the sheet export is a silent no-op |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | no | Shared secret checked by the Apps Script | Must match `SECRET` in the script |
| `PUBLIC_PLAUSIBLE_DOMAIN` | no | Plausible analytics domain | When set, `BaseLayout` emits the privacy-friendly Plausible `<script>` |
| `PUBLIC_PLAUSIBLE_SRC` | no | Plausible script src override | For self-hosted instances; defaults to `https://plausible.io/js/script.js` |

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
- Where can this GitHub App be installed: **Any account** (public). A private app ("Only on this account") returns a GitHub 404 to every user except the owner when they try to authorize it — collaborators like Eileen can't log in to Keystatic. Making the app public is safe: it stays installed only on this repo, the client secret stays private, and Keystatic still requires write access to the repo.

After creating, install on `DannyVisnak/travel2rescue` (left sidebar → Install App → select the repo).

### Custom Keystatic API route — kept for cookie handling

`src/pages/api/keystatic/[...params].ts` overrides Keystatic's auto-injected route to reproduce `@keystatic/astro`'s set-cookie logic via `context.cookies.set(...)` (otherwise Astro doesn't pick up the `Set-Cookie` headers Keystatic returns).

The original `req.url`-has-hostname-`localhost` workaround that lived here is no longer needed — `security.allowedDomains` in `astro.config.mjs` makes Astro trust `x-forwarded-host` and constructs `request.url` correctly. Don't reintroduce it.

### Troubleshooting Keystatic login

| Symptom | Cause | Fix |
|---|---|---|
| GitHub shows **404** right after clicking "Log in with GitHub" (but the app owner can log in fine) | The GitHub App is private ("Only on this account") — GitHub 404s the authorize page for everyone except the app owner | App settings (`github.com/settings/apps/<slug>`) → **Advanced** → **Make public**. Also verify the user accepted the repo collaborator invite (write access) and is logged into the invited GitHub account |
| "Authorization failed" after callback | Configured a classic OAuth App instead of a GitHub App — token response is missing `refresh_token` / `expires_in` and Keystatic's schema rejects it | Create a GitHub App (NOT an OAuth App) and check "Expire user authorization tokens"; update Vercel env vars |
| "Authorization failed" after callback (with a GitHub App) | `KEYSTATIC_SECRET` < 32 chars OR `KEYSTATIC_GITHUB_CLIENT_SECRET` doesn't match the App | Regenerate `KEYSTATIC_SECRET`, verify the client secret matches GitHub, redeploy |
| `403 Cross-site POST form submissions are forbidden` on `/api/keystatic/github/refresh-token/` | Astro CSRF check sees `context.url.origin` as `http://localhost` because `x-forwarded-host` isn't trusted | Ensure `security.allowedDomains` includes `travel2rescue.de` in `astro.config.mjs` |
| `redirect_uri=https://localhost/...` in GitHub error | `security.allowedDomains` not configured | Add `allowedDomains` to `astro.config.mjs` |
| "Bad verification code" | OAuth code expired (>10 min) or was already used | Restart the login flow |
| Admin loads but GitHub shows auth error | Callback URL mismatch in the GitHub App | Ensure callback is `https://travel2rescue.de/api/keystatic/github/oauth/callback` (no trailing slash) |
| Specific singleton/collection page hangs with "Failed to fetch" | An image field references a filename with weird chars (trailing space, etc.) — Keystatic UI fetches images via GitHub API and chokes on the encoded URL | Rename the file to something filesystem-clean and update the JSON reference |
| `[GraphQL] A path was requested for deletion which does not exist as of commit oid …` when saving | The entry's image value is a bare filename (or the draft is stale after earlier saves) — the admin computes a delete for a file path that was never committed | Reset the draft (Änderungen verwerfen), reload the admin, re-do the edit. Long-term: store image values as `/images/<file>` full paths (see Image field note) |

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

⚠️ **CMS commits by collaborators**: On Vercel Hobby with a PRIVATE repo, commits authored by non-owners were BLOCKED — even via Deploy Hook (Vercel attributes the head commit's author regardless of trigger; the deploy-hook workflow was removed as ineffective in Juli 2026). The repo is public now, which makes Vercel build Eileen's Keystatic commits natively. Do not make the repo private again without solving this.

**Do not commit** `.vercel/` directory.

## Known Quirks & Issues

0. **`output: 'server'` + content bundling (CRITICAL)** — The site runs fully SSR so the `SITE_PASSWORD` basic-auth middleware can gate every page during the under-construction window. Because pages render at request time inside the Vercel function, the Keystatic `content/**/*.json` files MUST be force-bundled via `vercel({ includeFiles })` in `astro.config.mjs` (the bundler doesn't trace fs reads). Without it the reader silently returns empty collections / null singletons in production: no dogs, no projects, all CMS edits invisible — pages "look fine" because of the `?? fallback` pattern. If a new content subfolder is added, it's picked up automatically (the list is globbed at config load). When the lock is no longer needed, the long-term plan is to go back to static prerendering.

1. **Astro route collision warning** — "The route `/api/keystatic/[...params]` is defined in both...". This is expected — our override file takes priority. Just a warning, not an error. Will become an error in a future Astro version; solution will be to configure the Keystatic integration to not inject the route.

2. **Node 24 / Vercel Node 22 warning** — Vercel serverless runs Node 22 locally but Node 24 is installed. No action needed.

3. **Resend mail integration** — Both forms POST to internal API routes (`/api/contact`, `/api/adoption`) which send via Resend (`src/lib/email.ts`). Requires `RESEND_API_KEY` in Vercel. Optional: `RESEND_FROM` (default `Travel2Rescue <kontakt@travel2rescue.de>`) and `RESEND_TO` (default `travel2rescue@gmail.com`). Sender domain `travel2rescue.de` must be verified in Resend (DNS records).

4. **`fields.image()` path format** — JSON stores filename only (not `/images/filename`). The reader returns it **bare** (no `publicPath` prepend), so consume it through `img()` from `src/lib/img.ts`. If you see broken images, check the value is wrapped in `img(...)` and that `content/*/[entry].json` has bare filenames.

5. **Image optimization** — All JPEGs in `public/images/` were batch-optimized (max 1920px, quality 78, mozjpeg, EXIF orientation baked in) via `node scripts/optimize-images.mjs` — run it again after Eileen uploads new phone photos through Keystatic (they arrive full-size, ~5MB). The script only overwrites a file when it gets ≥10% smaller and keeps filenames identical, so content JSON references stay valid.

## To-Do List

### Critical (broken / blocking)

- [ ] **Resend setup**: Set `RESEND_API_KEY` in Vercel and verify `travel2rescue.de` as sending domain in Resend dashboard. Without these, both forms return 500.

### Content (needs Eileen)

- [ ] **Real dog stories and photos** for 8 dogs (Minnie, Molly, Milka, Jack, Linus, Freddy, Kiki, Pinki) — current content is placeholder text
- [ ] **Real photos** via Keystatic admin (Eileen can upload directly from her phone)
- [ ] **Stats update** — verify Kastrationen/Futter/Operiert numbers are current (editable in Keystatic: ⚙️ Statistiken)
- [ ] **PayPal link** — verify the URL is correct and active (editable in Keystatic: ⚙️ Statistiken)

### Technical improvements

- [ ] **OG image** — Create a proper 1200×630 branded PNG (`public/og-image.png`). Currently using `fynn eileen dogs horizontal.jpg` which isn't sized correctly for social sharing.
- [ ] **Sitemap** — Verify all routes appear in `/sitemap-index.xml` after deploy
- [ ] **Google Search Console** — Submit sitemap, verify domain ownership

### CMS improvements (medium effort)

- [x] **Origin story chapters** (on Über uns page) — now a `fields.array()` in `aboutContent`.
- [x] **Mission page pillars** — the 4 pillar cards on `/mission/` are now in `missionContent`.
- [x] **Full page-text CMS** — every public page (home, mission, helfen, adoptieren, ueber-uns, projekte, linktree) plus footer/CTA now reads its copy from Keystatic singletons with inline fallbacks.
- [ ] **Adoption form questions** — See evaluation below. (Still the one deliberately-hardcoded text block.)
- [x] **Absätze + Layout-Kontrollen** (Aug 2026) — Eileen kann Absätze hinzufügen/sortieren/formatieren, die Hero-Textposition und den Bildausschnitt wählen sowie Startseiten-Sektionen sortieren und ausblenden. Siehe „Layout controls" oben.

### Nice to have (low priority)

- ~~Patenschaft page / Aktuelles (News)~~ — both removed on request (Juni 2026); git history has the implementations if they come back
- [ ] **Instagram feed embed** — Live feed from @travel2rescue on home page or linktree

---

## Adoption Form — CMS Evaluation

The adoption form (`/adoptieren/formular/`) has ~25 questions in 7 fieldsets. The "which dog" section already updates dynamically from Keystatic dogs.

**Option A — Label-only CMS** (~1 day work)  
Add a `formLabels` singleton to Keystatic with ~30 text fields (one per question label + section heading). The form logic (radio vs. text, required flags, option values) stays hardcoded. Covers ~90% of what Eileen might want to change.

**Option B — Full dynamic form** (~3 days work)  
A `formSections` collection where each section has an array of questions with type (radio/text/textarea), label, options, required flag. Requires a dynamic React form renderer. Completely flexible but complex.

**Recommendation: Do nothing for now.** The form questions are carefully curated screening criteria that should be reviewed by a developer before changing. They've been battle-tested. The one thing that already changes dynamically (which dogs appear) is already wired to Keystatic. If Eileen frequently requests question changes, implement Option A — it's the best effort/value trade-off.
