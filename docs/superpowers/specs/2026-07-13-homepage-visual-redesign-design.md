# Homepage Visual Redesign: Rust-Branded Technical

Status: approved (user gave explicit go-ahead 2026-07-13)
Date: 2026-07-13
Predecessor: `2026-07-13-homepage-redesign-design.md` (links/CTA/config work, shipped in PR #14). This spec restyles what that work built; it must not regress any of it.

## Problem

The homepage's visual layer is 100% stock VitePress: default hero, emoji
feature icons, default search styling. The user's verdict: "ugly", "no
thought put behind them". Functionality (links, progress CTA) is good;
the visual design was never designed.

## Decisions (all confirmed by user in brainstorm)

1. **Direction: Rust-Branded Technical.** Warm dark charcoal, rust-orange
   single accent, sharp corners, engineering-first. Selected from 4
   mockups (clicked 6 times; also typed).
2. **Feature cards: numbered, no icons.** Monospace index numerals
   (01-06) replace emoji. Confirmed over monoline-icon option.
3. **Theme: dual-mode, dark-first.** Dark is the flagship; light mode is
   a matching off-white counterpart. The existing VitePress light/dark
   toggle keeps working sitewide.
4. **Typography: Inter + system mono.** User rejected Space Grotesk
   ("should be more readable and clean"). Inter (already bundled by
   VitePress) does headings and body; the system monospace stack
   (`--vp-font-family-mono`) does numerals, day-ranges, and code. Zero
   new font dependencies.
5. **Cut the "Why Rust in 90 Days?" section.** Its five points duplicate
   the feature cards; they are absorbed into the numbered grid.
6. **Hero visual: real code panel + gear watermark.** A real Rust snippet
   in a Shiki-highlighted fence (real code for a code course, no fake
   terminal chrome, no traffic-light dots), with the repo's own
   `logo.svg` gear enlarged as a low-opacity watermark behind it. The
   local gear is homemade (not the official Rust Foundation trademark
   artwork), so there is no trademark exposure; do NOT swap in the
   official rust-lang gear.

## Dials (design-taste-frontend)

`DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 4`, `VISUAL_DENSITY: 3`.
Read: educational course landing for self-taught/early-career devs,
technical-but-approachable, native-CSS aesthetic (no Tailwind/React/Motion
in a VitePress site).

## Design

### 1. Token layer (restyles chrome for free)

All colors are redefined on VitePress's own CSS custom properties in the
theme CSS, per mode. Because the nav bar, local-search button, search
modal, sidebar, and footer consume these tokens, they restyle without
touching component internals — this is what fixes the "default-looking"
search.

Dark (flagship, `.dark` scope):

| Token | Value | Role |
|---|---|---|
| `--vp-c-bg` | `#16130f` | page background (warm charcoal, not pure black) |
| `--vp-c-bg-alt` | `#14110e` | alt/nav background |
| `--vp-c-bg-soft` | `#1f1b17` | card/surface |
| `--vp-c-divider` | `#332c25` | borders |
| `--vp-c-text-1` | `#f3efe6` | primary text (warm off-white) |
| `--vp-c-text-2` | `#9a968c` | secondary text |
| `--vp-c-text-3` | `#665c52` | tertiary |
| `--vp-c-brand-1` | `#e86a50` | link/text accent (AA on dark surfaces) |
| `--vp-c-brand-2` | `#ce422b` | hover / graphic accent (numerals, borders) |
| `--vp-c-brand-3` | `#b93a25` | solid button background |

Light (`:root` scope):

| Token | Value | Role |
|---|---|---|
| `--vp-c-bg` | `#faf9f6` | page background (neutral warm off-white) |
| `--vp-c-bg-alt` | `#f5f3ee` | alt/nav |
| `--vp-c-bg-soft` | `#f1eee8` | card/surface |
| `--vp-c-divider` | `#e4dfd6` | borders |
| `--vp-c-text-1` | `#26211c` | primary text |
| `--vp-c-text-2` | `#6b635a` | secondary |
| `--vp-c-text-3` | `#948a7f` | tertiary |
| `--vp-c-brand-1` | `#b93a25` | link/text accent (AA on light) |
| `--vp-c-brand-2` | `#ce422b` | hover / graphic accent |
| `--vp-c-brand-3` | `#b93a25` | solid button background |

Contrast rule: solid CTAs are `#b93a25` with white text in both modes
(passes AA at button sizes); bare `#ce422b` is reserved for large/bold
graphic elements (numerals >= 18px bold, borders) where 3:1 suffices.

Shape system: sharp — `border-radius: 2px` maximum on every homepage
element (cards, buttons, search button, code panel). One system, no
pill-buttons-on-square-cards mixing. Lesson pages keep VitePress
defaults except where tokens naturally propagate.

### 2. Hero (asymmetric split)

Left column: H1 "Master Rust in 90 days." (Inter 700, tight tracking,
max 2 lines), one subtext line under 20 words ("Ten minutes a day, seven
real projects. From your first compile to a working web server."), two
CTAs — solid "Start Learning" → `/introduction`, outlined second button
carrying the existing progress-aware behavior (View Weeks / Continue Day
N / Review Any Lesson, same `localStorage['rust90days-progress']`
contract, same next-day computation).

Right column: bordered panel, `day_01.rs` filename tab (mono), containing
a real ` ```rust ` markdown fence so Shiki highlights it with the site's
actual dual-mode code theme. Behind the panel: the repo gear
(`logo.svg`) rendered ~480px via CSS `mask-image` in brand color at
~0.06 opacity, `pointer-events: none`.

Hero stack: exactly headline + subtext + 2 CTAs. No eyebrow, no
trust-strip, no tagline under the CTAs.

Implementation shape: the stock `hero:`/`features:` frontmatter is
removed from `docs/index.md` (VPHomeHero renders nothing without it);
hero structure is plain HTML in the markdown body (the established
journey-grid pattern), so the code fence stays native markdown. The only
Vue component is a slim `HeroCtas.vue` rendering BOTH buttons — raw
`<a>` tags in markdown do not get the site base prefix, so the component
computes hrefs with VitePress's `withBase()`; the second button's
label/link come from local `ref()` state (logic ported verbatim from
`ContinueButton.vue`). Crawlability does not depend on the component:
the same targets are plain markdown links elsewhere on the page. The
now-moot `Layout.vue` slot wrapper and old `ContinueButton.vue` are
deleted; `index.ts` registers `HeroCtas` globally.

### 3. Sections

- **"What you get" (numbered grid):** six cells, asymmetric spans
  (4+2 / 2+2+2 / full-width 6), mono numerals 01-06 in `#ce422b`, 700
  weight. Two cells carry subtle visual variation (one rust-tinted
  gradient, one faint diagonal rust-line texture); cell 06 is the
  full-width projects cell listing all seven projects. Copy absorbed
  from the old feature cards + the killed "Why" section; every card
  body <= 25 words.
- **"The 13-week journey" (week cards):** the 7 existing linked cards
  keep their structure, stretched-link overlay, and hover behavior.
  Restyled: emoji dropped from headings; each card gains a mono
  kicker line "W 1-2 · DAYS 1-14" (text-2 color) above the linked
  title. Grid stays `auto-fit minmax(300px, 1fr)`.
- **"How this course works":** same two linked cards, emoji dropped,
  restyled to the token system.
- **"Why Rust in 90 Days?" is deleted** (decision 5).

### 4. Chrome + fixes

- Search button: sharp corners, 1px divider border (tokens do the
  colors).
- Fix the two pre-existing console 404s: `config.ts` `head` references
  `/logo.svg` (favicon) without the `/rust-90-days/` base prefix. Use
  the base-aware path. New logo design is out of scope.

### 5. Motion (intensity 4, CSS-only)

One-time fade-up cascade on hero elements at load (staggered
`animation-delay`), existing card hover lift, `:active` press
(`scale(0.98)`) on CTAs. Everything animated wrapped in
`@media (prefers-reduced-motion: no-preference)`. Only `transform` and
`opacity` animate. No GSAP, no scroll-hijack, no infinite loops.

### 6. Files

- Modify: `docs/index.md` (full body restructure), `docs/.vitepress/theme/custom.css`
  (token layer + homepage styles; may split into `tokens.css` +
  `home.css` imported from `custom.css` if it aids focus),
  `docs/.vitepress/theme/index.ts` (register ContinueCta, drop Layout),
  `docs/.vitepress/config.ts` (favicon base path).
- Create: `docs/.vitepress/theme/HeroCtas.vue`.
- Delete: `docs/.vitepress/theme/Layout.vue`,
  `docs/.vitepress/theme/ContinueButton.vue`.
- Untouched: `ProgressTracker.vue`, all lesson pages, sidebar/nav config.

## Non-goals

- No new logo mark, no official Rust Foundation artwork.
- No new fonts, no icon library, no Tailwind/Motion/GSAP.
- No changes to lesson-page templates or the 90 lesson files.
- No fabricated content (testimonials, fake stats, fake logos).

## Must-not-regress (from PR #14 work)

- Progress-aware CTA: all three states (default "View Weeks",
  mid-progress "Continue Day N →" with correct next-day math and
  zero-padded `day-NN` IDs, all-complete "Review Any Lesson"), verified
  in BOTH dev and prod-preview modes.
- Week cards: whole card clickable (stretched-link + `position: static`
  heading fix), 7 correct crawlable `<a href>` targets.
- `/introduction` and `/how-to-use` reachable from the homepage.
- Light-mode code readability (dual Shiki theme).
- GitHub URLs (`fahdi/rust-90-days`) in socialLinks/editLink.

## Verification

- `npm run docs:build` clean; `npm test` (lesson validator) still green.
- Browser matrix in dev AND `docs:build`+`docs:preview`: both themes ×
  (hero renders, code panel highlighted, watermark visible-but-subtle,
  all three CTA states, week-card full-surface clicks, section links,
  search opens and returns results, no console errors beyond
  known-fixed ones).
- Favicon/logo 404s gone from console.
- `prefers-reduced-motion: reduce` shows no entry animation.
- Mobile (<768px): hero collapses to single column (code panel below
  text), numbered grid to single column, nav unbroken.
