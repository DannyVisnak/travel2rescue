# TODO — Travel2Rescue Website

## Critical (do before launch)

- [ ] **Web3Forms key** — replace `REPLACE_WITH_WEB3FORMS_KEY` in:
  - `src/components/ContactForm.astro` (line 16)
  - `src/pages/adoptieren/formular.astro` (line ~10)
  - Sign up at web3forms.com, get access key, add to both files

- [ ] **Dog photos & stories** — current dog profiles use placeholder stories. Eileen should provide:
  - Real stories for: Minnie, Molly, Milka, Jack, Linus, Freddy, Kiki, Pinki (Flummi has real story)
  - Real portrait photos per dog — currently using best-match photos from the media folder
  - Correct ages, genders, and any medical status info

- [ ] **Adoption form email** — verify Web3Forms sends to `travel2rescue@gmail.com`
  - Set the redirect/notification email in Web3Forms dashboard

## Content

- [ ] **Dog availability** — when a dog gets adopted, update `available: false` in `src/data/dogs.ts`
  - Consider adding a "Vermittelt" badge and hiding from available list

- [ ] **Real adoption photo for `/adoptieren/`** hero — currently uses `fynneileen dogs.jpeg`. Replace with a specific adoption-context shot if Eileen has one.

- [ ] **Projekte page** — project details (impact numbers, descriptions) are currently generic. Update `src/data/projects.ts` with real stats.

- [ ] **Über uns page** — portrait photos `fynn portrait.jpeg` and `eileen portraig .jpeg` — note the typo in Eileen's filename (`portraig`). Rename if it causes issues: `mv "public/images/eileen portraig .jpeg" "public/images/eileen portrait.jpeg"` and update `ueber-uns.astro`.

- [ ] **Stats** — update if numbers change: `src/data/site.ts` → `stats` object (kastrationen, futter, operiert)

## Features

- [ ] **Dog detail page photos** — `/adoptieren/[id]/` currently shows one photo. Could add a small gallery if multiple photos exist per dog.

- [ ] **Adoption form pre-selection** — the formular page could pre-select a dog when navigating from `/adoptieren/flummi/` via URL query param (`?hund=Flummi+🎾`). Currently not implemented — the form just loads blank.

- [ ] **"Vermittelt" page** — a gallery of successfully adopted dogs for social proof

- [ ] **Instagram feed embed** — basic embed or link to latest posts on homepage

## Technical

- [ ] **OG image** — currently uses `fynn eileen dogs horizontal.jpg`. Create a proper 1200×630 branded OG image.

- [ ] **Favicon** — current favicon is `travel2rescue favicon.png`. Verify it looks good at 16×16 and 32×32.

- [ ] **Deploy** — site is on GitHub at `DannyVisnak/travel2rescue`. Connect to Netlify or Cloudflare Pages. Set `https://www.travel2rescue.de` as custom domain.

- [ ] **DNS** — point `travel2rescue.de` and `www.travel2rescue.de` to hosting provider.

- [ ] **`PUBLIC_WEB3FORMS_KEY` env var** — optionally move the hardcoded key to an env var: `import.meta.env.PUBLIC_WEB3FORMS_KEY`

## Nice-to-have

- [ ] **Betterplace** — user asked to remove it (done). If they get a Betterplace account later, add back to `SITE.social` and helfen page.

- [ ] **Spendenquittung** — Eileen mentioned steuerliche Absetzbarkeit is only via Überweisung. Consider adding note about this to PayPal card.

- [ ] **WhatsApp link** — add WhatsApp direct link (phone number: +62 853-5380-7785) to linktree and helfen page contact section.

- [ ] **YouTube** — if they start posting there, add to footer + linktree.

- [ ] **Cookie banner** — currently no cookies/tracking, so none needed. If Google Analytics is added later, add a banner (DSGVO).

## Known image filenames with spaces (handle carefully in HTML)

Files with spaces in name — always quote in shell, already correctly referenced in HTML:
- `fynn eileen dogs horizontal.jpg`
- `fynn eileen dogs horizontal-2.jpeg`
- `fynn eileen walking.jpeg`
- `fynneileen dogs.jpeg`
- `eileen portraig .jpeg` (trailing space + typo — consider renaming)
- `eileen portrait.jpeg` (after rename, update ueber-uns.astro)
