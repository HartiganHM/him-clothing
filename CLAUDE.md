# HIM Clothing — Claude Context

A single-page archival site memorializing HIM Clothing — a handmade men's accessories brand that operated roughly 2014–2018. Built as an ode for the owner (Hugh Hartigan) to share with friends and anyone who'd find the brand story interesting.

**This file exists so every Claude session starts with full context.** Read it before touching any code.

---

## What This Is

Single-page Astro 5 static site at `himclothing.com`. Three sections in a curated top-to-bottom scroll: **Story → Worn At → Archive**. One additional dynamic route at `/products/<slug>` for per-product deep-links. No backend, no auth, no interactivity beyond browsing.

The site is **not** a store. Nothing is for sale. It is an "ode" — closer to a museum retrospective than a brand relaunch.

**Key documents:**

- Design spec: `docs/superpowers/specs/2026-06-17-him-clothing-ode-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-17-him-clothing-implementation.md`
- Build progress ledger (from the implementation session): `.git/sdd/progress.md` (durable but local-only)

---

## Status (as of 2026-06-17)

**Deployed** to `https://him-clothing.pages.dev` (Cloudflare Pages, connected to `main`).

**Custom domain `himclothing.com` not yet attached** — gated on the Cloudflare registrar transfer from Squarespace completing. See issue #5.

**Content is placeholder.** All real content (story copy, product photos, wedding gallery) is authored via the issues backlog. The site renders with one sample product and one sample wedding, both prefixed `_sample-` so they sort first and are obvious to remove.

**Build is green** locally and in CI.

---

## Project Structure

```
him-clothing/
├── astro.config.mjs
├── package.json                       # pnpm, Astro 5, Tailwind 4, MDX, Vitest
├── tsconfig.json                      # strict + noUncheckedIndexedAccess + verbatimModuleSyntax
├── docs/
│   └── superpowers/
│       ├── specs/                     # design specs
│       └── plans/                     # implementation plans
├── public/
│   └── brand/                         # logos / favicon (owner uploads)
├── scripts/
│   ├── generate-product-stubs.ts      # YAML stubs from JSON input
│   └── upload-photos.ts               # bulk upload to Cloudflare Images
├── src/
│   ├── content/
│   │   ├── config.ts                  # Zod schemas (Astro 5 Content Layer)
│   │   ├── products/*.yaml            # 1 file per product, filename = slug
│   │   ├── weddings/*.yaml            # 1 file per wedding
│   │   └── story/*.mdx                # 6 ordered sections
│   ├── components/                    # Nav, Hero, Footer, Photo, StorySection,
│   │                                  # WornAtCard, WornAtSection, ProductCard,
│   │                                  # LineGroup, ArchiveSection, Credits
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── cloudflare-images.ts       # URL builder for image variants
│   │   ├── copy.ts                    # CHROME_COPY — all chrome strings
│   │   └── group-by.ts                # tiny grouping utility
│   ├── pages/
│   │   ├── index.astro                # the single-scroll page
│   │   └── products/[slug].astro      # dynamic per-product route
│   └── styles/global.css              # Tailwind 4 + design tokens
└── .github/workflows/ci.yml           # build + lychee link check
```

---

## Running Locally

Prerequisites: pnpm (`npm install -g pnpm`).

```bash
pnpm install
echo "PUBLIC_CF_IMAGES_HASH=temp" > .env       # only needed once; gitignored
pnpm dev                                       # http://localhost:4321
```

Other scripts:

```bash
pnpm check                                     # astro check + tsc
pnpm test                                      # vitest run (10 tests today)
pnpm build                                     # produces dist/
pnpm stubs <input.json>                        # generate product YAML stubs
pnpm upload <directory>                        # bulk upload images to CF Images
```

---

## Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Astro 5 | Content-heavy static site sweet spot; zero JS by default; Cloudflare Pages deploy in one click |
| Content layer | Astro 5 `loader: glob(...)` | Modern API; type-safe via Zod; do NOT use legacy `type: "content"/"data"` |
| Render API | `import { render } from "astro:content"` + `await render(entry)` | `entry.render()` is deprecated in Astro 5 |
| Styling | Tailwind 4 with CSS-first config | `@theme {}` block in `global.css`; arbitrary-property syntax (`bg-(--color-paper)/85`) |
| Image storage | Cloudflare Images | URLs only in content frontmatter — repo stays tiny; on-the-fly variants in dashboard |
| Hosting | Cloudflare Pages | Connected to GitHub; auto-deploys on push to `main` |
| Type safety | TypeScript strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` | Catches array-access bugs at compile time |
| Casts | **No `as` casts** — use Zod `safeParse`, type guards, `if (!x) throw` narrowing | `as const` IS allowed (it's a type-narrowing assertion, not a cast) |
| Copy | All chrome strings in `src/lib/copy.ts` as `CHROME_COPY` | No hardcoded customer-facing strings in JSX; product/wedding fields are data not copy |
| Package manager | pnpm | Matches owner's other projects |

---

## Conventions

### Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`
- Push directly to `main` is fine for content edits and small fixes (this is a personal project, no PR ceremony required — but a PR is still a good idea for substantive changes)
- Don't force-push to `main` without explicit user instruction

### Code

- TypeScript strict mode + `noUncheckedIndexedAccess` everywhere
- Array element access: narrow with `if (!firstPhoto) throw new Error(...)`, never `!` or `as`
- Empty state strings live in `CHROME_COPY.sections.*.empty`
- All catch blocks must log or rethrow with context — no silent `catch {}`

### Content authoring

- **Convention:** filename stem === entry id === reference target. The `slug` field is for URL routing only.
- Real product files use plain slugs (`cthulhu-calls.yaml`); sample files use `_sample-` prefix that intentionally diverges from the slug field, so they're easy to spot and remove before/at launch.
- All photos via Cloudflare Images IDs; no local `public/photos/` directory.

### Tests

- Vitest for script logic + the URL builder
- **No tests for content rendering** — site is content, not logic
- Test mocks of `fetch` use `vi.fn<typeof fetch>` + real `Response` constructors (NO `as unknown as typeof fetch`)

---

## What Claude Can Own

- All application code (components, pages, layouts, lib, scripts)
- Astro / Tailwind / Vitest / TypeScript configs
- Content schemas (`src/content/config.ts`)
- CI workflow (`.github/workflows/ci.yml`)
- Documentation under `docs/`

## What Claude Must NOT Touch Without Approval

- Real story copy in `src/content/story/*.mdx` — that's the owner's voice; Claude can help draft but never publish without sign-off
- `.env` files or any file containing secrets
- The Cloudflare account / Pages dashboard (it's the owner's account)
- Customer wedding data — privacy matters; only the owner decides what gets published

---

## Open Issues (as of 2026-06-17)

See https://github.com/HartiganHM/him-clothing/issues for the full list. Rough priority:

**Unblockers:**
- #5 Attach `himclothing.com` (blocked on registrar transfer)
- #3 Replace placeholder `PUBLIC_CF_IMAGES_HASH`
- #4 Define Cloudflare Images variants in dashboard

**Brand foundation:**
- #14 Upload original logo / favicon
- #6 Pick + upload hero anchor photo
- #10 Pick a display headline font

**Content (the bulk):**
- #11 Archive — all ~40 products
- #7 Worn At — customer weddings
- #8 Story copy + credits

**Cleanup (blocked on real content existing):**
- #13 Remove `_sample-*` fixture files
- #9 Wire or remove unused `thumbnail` PhotoVariant

**Future:**
- #12 Guestbook (deferred, sketch only)

---

## Resuming a Session

1. `gh issue list --repo HartiganHM/him-clothing --state open` to see what's pending
2. Read this file (you're doing it now)
3. Pick an issue, read its body for the steps, work it
4. Local commands: `pnpm dev` to preview, `pnpm check` + `pnpm test` + `pnpm build` before pushing
5. Push to `main` — Cloudflare Pages auto-deploys
