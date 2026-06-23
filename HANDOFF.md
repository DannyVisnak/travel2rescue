# HANDOFF — Travel2Rescue e.V. website

Written for a fresh session with **zero prior context**. Read `CLAUDE.md` next — it
is the deep reference; this file is the orientation + current state.

## GOAL

Static **Astro 5** marketing site for **Travel2Rescue e.V.**, a German nonprofit
(Selb, Bavaria) run by Fynn Otter & Eileen Medved that rescues street dogs (and
cats) on Lombok, Indonesia. German language. Conversion goals: **donations
(PayPal)** + **adoption inquiries**. Content is editable by Eileen through
**Keystatic CMS** (`/keystatic/`), which commits JSON to this repo.

- Live: `https://travel2rescue.de` · Repo: `github.com/DannyVisnak/travel2rescue`
- Host: **Vercel** (push to `main` → auto-deploy). Git is canonical; Vercel is the
  runtime. **This project does NOT need a VPS** — no always-on/cron/watcher
  process, no long-lived tokens (Resend/Keystatic/Sheets all run inside Vercel
  serverless functions). Clone it anywhere to edit; deploy via git.

## STATE

**Latest work is on branch `claude/compassionate-keller-j5gxap` → open PR #5 into `main`.**
Working tree clean, branch pushed. `main` itself is behind this branch.

### Done (in PR #5, not yet merged)
- **CRITICAL prod fix**: site runs `output: 'server'` (for the password lock), so
  pages render in the Vercel function — the Keystatic `content/**/*.json` files
  are now force-bundled via `vercel({ includeFiles })` in `astro.config.mjs`.
  Without it the reader returns empty collections/null singletons in prod (no
  dogs, no projects, CMS edits invisible). Don't remove.
- Brown/pink/beige redesign sitewide (palette remapped in `src/styles/global.css`
  `@theme`); homepage restructured to mirror the nav.
- Dogs: Steckbrief fields, `/adoptieren/hunde/` full grid, `/adoptieren/` 6-dog
  teaser, card CTA → prefilled form.
- Mission 4 problem cards; 9 projects; über-uns/helfen section splits; linktree
  shrunk; Patenschaft + Aktuelles/News removed.
- New `/medical-report/` (English, photos required, client-compressed) + API.
- Adoption form → Google Sheet export; GTM dataLayer events; contact + medical
  confirmation emails to submitter.
- All content image values migrated to `/images/...` full-path format (bare
  filenames broke the Keystatic admin).
- `.github/workflows/deploy-cms-commits.yml`: triggers a Vercel deploy hook for
  CMS commits (Hobby plan won't auto-build non-owner commits).
- Merged in Eileen's 10 Keystatic commits (8 new dogs).

### Concrete next actions
1. **Merge PR #5 into `main`** (this deploys everything above + activates the
   deploy-hook workflow, which only runs once it exists on `main`).
2. In Vercel set **`GOOGLE_SHEETS_WEBHOOK_URL`** (+ optional `_SECRET`) — script
   template in `scripts/google-sheets-webhook.gs`. Until then the sheet export
   is a silent no-op (email still works).
3. Repo secret **`VERCEL_DEPLOY_HOOK_URL`** was added by Danny; verify a Keystatic
   save triggers a build under the repo's Actions tab after merge.
4. Eileen's stuck Startseite draft: discard (Reset) → reload `/keystatic/` → redo
   the edits (caused by the old bare-filename image bug, now fixed).
5. Verify the linktree **YouTube URL** (currently a guess: `youtube.com/@travel2rescue`).
6. Decide on **Resend domain + inbound**: verify root `travel2rescue.de` (not a
   subdomain); add plain email forwarding for `kontakt@` → gmail (Resend
   "receiving" is webhooks, not a mailbox — not what you want).

### Not started / parked
- Adoption-form questions are intentionally hardcoded in `formular.astro`
  (battle-tested screening). Eileen-editable labels = ~1 day if requested; full
  dynamic builder discouraged (fragile, breaks the Sheet columns).
- Adoption form collects no email, so it can't send the submitter a confirmation
  (contact + medical-report do). Add an email field only if wanted.

## KEY DECISIONS & CONTEXT (non-obvious)

- **`||` not `??` for CMS text fallbacks.** Keystatic returns `''` (empty string),
  not `null`, for missing/blanked text fields; `??` doesn't catch `''` and blanked
  whole homepage sections once. Booleans keep `??` (e.g. `entry.kastriert ?? true`).
- **Palette is intentionally remapped.** `bg-black`/`bg-gray-dark`/`text-black`
  render **brown** sitewide (tokens overridden in `@theme`). Don't "fix" them back
  to neutral. Cards use `--color-card` (a lighter brown) so they stand out.
  Accent `text-amber-*`/`bg-amber-*` resolve to **pink** `#F77AB4`.
- **Keystatic image values must be `/images/<file>` full paths** (collection
  uploads: `/images/<slug>/<field>.jpeg`). Bare filenames break the admin (drops
  images on save, GraphQL "path requested for deletion" error). Always read image
  values through `img()` from `src/lib/img.ts`.
- **Keystatic needs a GitHub App, NOT a classic OAuth App**, and it must be
  **public** ("Any account") or collaborators (Eileen) get a 404 on login.
- **Vercel Hobby + private repo only builds the owner's commits** → Eileen's CMS
  commits are skipped; the deploy-hook workflow is the fix.
- Site is currently behind a password (`SITE_PASSWORD` set in Vercel,
  "under construction"). `src/middleware.ts` gates everything except
  `/keystatic`, `/api/keystatic`, `/api/health`, `/.well-known`.
- Astro route-collision **warning** for `/api/keystatic/[...params]` is expected
  (our override wins) — not an error.

## HOW TO RUN / TEST

```bash
npm install
npm run dev      # http://localhost:4321  (Keystatic uses local filesystem here)
npm run build    # static + Vercel SSR bundle; this is the only "test" (TS errors surface here)
npm run preview  # preview the build
node scripts/optimize-images.mjs   # re-run after new photo uploads (recursive, ≥10% smaller only)
```

No test suite, no linter. **Always `npm run build` before pushing** — it's the
correctness gate. Forms need `RESEND_API_KEY` to actually send (they return 500
locally without it; that's expected).

## ENV / SECRETS (names only — see `.env.example`)

All live in **Vercel → Project → Settings → Environment** in production.
For local dev, copy `.env.example` → `.env.local` (only Resend/Plausible matter locally).

| Name | Required | Source |
|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | prod (CMS) | GitHub App settings page |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | prod (CMS) | GitHub App → Client secrets |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | prod (CMS) | GitHub App URL slug |
| `KEYSTATIC_SECRET` | prod (CMS) | `openssl rand -base64 32` (internal only) |
| `RESEND_API_KEY` | forms | resend.com; verify `travel2rescue.de` sending domain |
| `RESEND_FROM` / `RESEND_TO` | optional | defaults in `src/lib/email.ts` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | optional | Apps Script `/exec` URL (template in `scripts/`) |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | optional | shared secret = `SECRET` in the Apps Script |
| `PUBLIC_PLAUSIBLE_DOMAIN` / `PUBLIC_PLAUSIBLE_SRC` | optional | Plausible analytics |
| `SITE_PASSWORD` | optional | the under-construction lock; unset to go public |
| `VERCEL_DEPLOY_HOOK_URL` | GitHub **repo secret** (not app env) | Vercel → Settings → Git → Deploy Hooks |

No secret values are stored in the repo. Keystatic GitHub App: see CLAUDE.md
"GitHub App (NOT a classic OAuth App)".

## MCP SERVERS USED

`claude mcp list` → **"No MCP servers configured."** There is **no `.mcp.json`** in
this repo and nothing to bootstrap on another machine. The MCP tools used this
session (GitHub: PR/commits; Vercel: deployments/logs) were **hosted connectors
provided by the cloud agent environment (claude.ai/FleetView)**, classified as
**remote/OAuth connectors**, NOT stdio/local servers tied to this project. On a
fresh local/VPS session they simply won't be present — use the `gh`/`vercel` CLIs
or the dashboards instead. The project itself needs **zero MCP servers** to build
or run.

## OPEN THREADS / GOTCHAS

- PR #5 is open and unmerged — everything above ships on merge.
- After merge, the password lock is still on until `SITE_PASSWORD` is removed in Vercel.
- Adoption form has no email field (no submitter confirmation) — by design.
- Linktree YouTube URL is unverified.
- Resend domain verification + `kontakt@` inbound forwarding still pending (see next actions).
- `og-image.png` is still a placeholder/sized incorrectly (pre-existing TODO in CLAUDE.md).
