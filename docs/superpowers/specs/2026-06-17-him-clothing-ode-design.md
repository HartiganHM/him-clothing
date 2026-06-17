# HIM Clothing — Ode Site Design

**Status:** Design approved, pending implementation
**Date:** 2026-06-17
**Repo:** `~/Projects/him-clothing` → GitHub `HartiganHM/him-clothing` (public)
**Production URL:** `himclothing.com` (registrar transfer to Cloudflare in progress; DNS already on Cloudflare)

---

## What this is

A single-page archival site memorializing HIM Clothing — a handmade men's accessories brand (handmade neckties, bow ties, pocket squares, lapel flowers, wooden tie bars, cork wallets) that operated on Shopify roughly 2014–2018.

The audience is two-sided:

- **Friends who helped build the business** — should recognize themselves, products they touched, weddings they attended. Named credits matter.
- **People unfamiliar with HIM** — should come away understanding what the brand was, what it valued, and what it looked like — the way one would after reading a thoughtful portfolio case study.

The site is **not** a store. Nothing is for sale. It is, in the owner's words, "an ode" — closer to a museum retrospective than a brand relaunch.

## Form

Single scrolling page, top to bottom: **Story → Worn At — → Archive**. Sticky lightweight nav with three anchor links. One additional route per product (`/products/<slug>`) so individual items are deep-linkable.

No auth, no server logic, no interactivity beyond browsing in v1. Pure static.

## Aesthetic direction

**Modernized homage, content-forward.** The design is a frame for the photography and the product names — never the star. Subtle nods to the original brand DNA, but unmistakably a 2026 piece of design.

- **Palette:** Black and white primary. No accent color in v1 (the original brand was mostly B&W; pure B&W also reads "archival" cleanly). Revisit during implementation if a single restrained accent emerges naturally from the photography.
- **Typography:** Sans-serif throughout. A slightly characterful sans for headlines (candidates: Söhne Breit, Founders Grotesk, Editorial New Sans — picked during implementation), a clean restrained grotesk for body (candidates: Neue Haas Grotesk, Inter, Söhne). Product names get hero-scale typographic treatment.
- **Photography:** Abundant — the owner has many product, model, and customer wedding shots. Full-bleed where it earns it. Editorial spacing.

## Information architecture

### 1. Hero

Wordmark **HIM Clothing**, descriptor **Handmade Outfitter**, original tagline **"Classically Constructed, Vintage Inspired, Contemporary Designed."** One strong anchor photo. Sticky nav above with anchors to Story / Worn At / Archive.

### 2. Story (six sub-sections, ~1000 words total)

| # | Section | ~Words | Purpose |
|---|---------|--------|---------|
| 1 | Origin | 200 | How it started. The spark. Why "HIM Clothing." Why handmade men's accessories. |
| 2 | The making | 250 | Craft + materials (Pendleton wool, cork, chokecherry wood). Process. Who made things alongside the owner. |
| 3 | The collections | 200 | Denver Artist Series and the recurring product lines (Aspen, Baker Street, Bleu, Hawthorn, etc.). The naming sensibility. |
| 4 | In the wild | 150 | Brief bridge: people wore these. To weddings, to work. Sets up the gallery section. |
| 5 | Wind-down | 150 | What happened, why it ended. Matter-of-fact, no regret. (Optional — owner can drop in implementation if it doesn't feel right.) |
| 6 | Thanks | 100 | Intro to a structured credits list (specific people for specific contributions). |

Each section is set in confident, generous type. Full-bleed photo breaks between sections.

### 3. Worn At —

A gallery of real customer wedding photos. Customers were asked to send wedding pictures while the business was running; many did.

Each card carries: customer name (when given), year (when known), products worn (with hyperlinks to the product detail page), short caption when meaningful. Sectioned by year, descending. Visual rhythm over completeness.

### 4. Archive

All products from the original catalog, grouped by **product line** (the original collections — Aspen, Baker Street, Bleu, Chameau, Denver Artist Series, Hawthorn, etc.). Within each line:

- **Hero products** (hand-picked by the owner — small set, perhaps 8–12 across the whole archive) get full-bleed multi-photo treatment.
- **Long-tail products** sit in a clean compact grid below.

Each card links to `/products/<slug>`.

### 5. Product detail (`/products/<slug>`)

Per-product page: large photo carousel, name as hero, structured metadata block (line, category, year, materials, collaborators), short description if available, "Back to archive" link.

### 6. Footer

Year span ("2014–2018"), single-line dedication, optional GitHub source link if repo is public.

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | **Astro** with content collections |
| Language | TypeScript |
| Styling | Tailwind CSS + a small set of CSS-variable design tokens |
| Story copy | MDX (one file per story section) |
| Image storage | **Cloudflare Images** — URLs in content frontmatter, served from Cloudflare's CDN with on-the-fly variants |
| Hosting | **Cloudflare Pages**, connected to GitHub, auto-deploys on push to `main` |
| Custom domain | `himclothing.com` (attached once registrar transfer settles) |
| CMS | None — content authoring is code editor + commit + push |

Astro chosen for: content collections handle structured product data trivially, MDX handles story sections, ships zero JS by default (instant loads suit the museum aesthetic), Cloudflare Pages deploy is one config file.

Cloudflare Images chosen over local storage to keep the repo small (hundreds of photos) and over alternatives (R2 + Image Resizing, Cloudinary, Imgix) to stay inside the Cloudflare ecosystem already in use.

## Content model (content collections in `src/content/`)

### `products/<slug>.yaml`

```yaml
slug: cthulhu-calls          # URL slug, also display key
name: Cthulhu Calls          # display name
line: Denver Artist Series   # product line / collection
category: bow tie            # bow tie | necktie | pocket square | lapel flower | tie bar | wallet
year: 2016                   # year produced (approximate ok)
hero: true                   # gets full-bleed multi-photo treatment
materials:
  - Cotton
  - Hand-drawn pattern
description: |               # optional, 1-3 sentences
  A bow tie from the Denver Artist Series, patterned with a hand-drawn
  Cthulhu motif by a local Denver illustrator.
photos:                      # Cloudflare Images IDs
  - 8f3a2c1e-...
  - 9a4b3d2f-...
credits:                     # optional
  designer: Friend Name
  photographer: Friend Name
```

### `weddings/<slug>.yaml`

```yaml
slug: mike-and-sarah-boulder-2016
customerName: Mike & Sarah   # optional, owner-chosen anonymity ok
year: 2016
location: Boulder, CO        # optional
productsWorn:                # product slug references
  - cthulhu-calls
  - bluegrass-pocket-square
caption: |                   # optional, short
  Boulder wedding. Bow tie: Cthulhu Calls. Pocket square: Bluegrass.
photos:                      # Cloudflare Images IDs
  - a1b2c3d4-...
```

### `story/<NN>-<name>.mdx`

Six files, ordered by `NN` prefix. Frontmatter: `title`. Body: MDX with inline `<Photo />` components for full-bleed image breaks.

The final story file (`06-thanks.mdx`) carries structured credits in frontmatter:

```yaml
title: Thanks
credits:
  - name: Person A
    contribution: Hand-drew patterns for the Denver Artist Series
  - name: Person B
    contribution: Wedding photography across 2015–2017
```

Rendered as a definition list immediately below the section copy.

## Authoring workflow

**Story copy.** Owner edits MDX files directly. First pass written collaboratively (owner provides notes + voice; collaborator structures prose; owner edits to taste). After first pass, edits are `git commit + push`.

**Products.** Initial 40+ stub YAML files generated from the product names already pulled from the Wayback Machine capture (May 2014, April 2016, Feb 2018, plus the `collections/all` page). Owner fills in materials, year, hero flag, photo IDs. A helper script accepts a folder of consistently-named photos (e.g. `cthulhu-calls-1.jpg`, `cthulhu-calls-2.jpg`), uploads each to Cloudflare Images via the Images API, and writes the returned IDs back into the matching YAML.

**Worn At —.** Owner creates one YAML file per wedding as photos come in / are sorted. No fixed set.

**Photos.** Three upload paths depending on volume:
1. Cloudflare Images dashboard — one-off uploads
2. Bulk script — operator points it at a folder; it uploads + emits a JSON map of `filename → image_id` for paste into frontmatter
3. Direct creator upload URLs — issued via the Images API; useful if a tiny owner-only upload page is added later

**No CMS.** Editor + commit + push is faster than any CMS would be for this content size and authoring frequency.

## Out of scope for v1

- Guestbook / comments
- Search / filter
- Analytics (Cloudflare Web Analytics is a one-toggle add later)
- E-commerce reactivation
- Custom-domain email
- Internationalization
- Formal WCAG audit (basic semantic HTML + alt text are non-negotiable but not formally audited)

## Possible future expansions

Sketched only — not committed.

- **Guestbook.** Cloudflare Pages Function + D1 (or KV) for storage. Submit form → moderation → display on `/guestbook`. Roughly 200–400 LOC for a v2 weekend.
- **"I owned a HIM piece" submissions.** Same shape as guestbook but tied to a product slug; appears as a "submitted by readers" section on product detail pages.
- **Press / mentions page.** If HIM was covered anywhere, a small page archives it.
- **Print lookbook PDF.** Generate a printable lookbook from the catalog data.

## Quality bar

| Check | Target |
|-------|--------|
| Build | Cloudflare Pages must succeed (deploy gate) |
| Link check | `lychee` CI step; fails build on broken internal links or missing image refs |
| Lighthouse Performance | ≥ 95 informally |
| Lighthouse Accessibility | ≥ 95 informally |
| Unit tests | None — site is content, not logic |

## Timeline

None. Side project. Done when done. Concert Crawl remains the priority.

## Open questions

1. **Section 5 (Wind-down) inclusion.** Owner decides during story-copy drafting; structurally optional. (Deferred from design phase.)

---

## Next: implementation plan

After owner reviews this spec, the next step is to invoke the `writing-plans` skill to produce a task-by-task implementation plan covering Astro bootstrap, content collection schemas, Cloudflare Images integration, layout and component build-out, story authoring, Cloudflare Pages deploy wiring, and custom domain attachment.
