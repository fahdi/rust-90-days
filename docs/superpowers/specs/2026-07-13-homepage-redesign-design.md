# Homepage Redesign & Link Fixes

Status: approved, ready for implementation plan
Date: 2026-07-13

## Problem

The homepage (`docs/index.md`) has three real issues, plus one sitewide config
issue found during review:

1. The seven "journey grid" week cards are plain text, not links, even though
   each corresponds to a real `/week-XX/` overview page.
2. `introduction.md` and `how-to-use.md` both exist but are unreachable from
   the homepage (only `introduction` is linked, via the hero CTA).
3. The `ProgressTracker.vue` component already tracks completed lessons and
   streak in `localStorage['rust90days-progress']`, but that data is never
   surfaced on the homepage, so a returning visitor has no "resume" path.
4. `docs/.vitepress/config.ts` has two placeholder `yourusername/rust-90-days`
   GitHub URLs (`socialLinks`, `editLink.pattern`), and `markdown.theme` is
   set to a single dark-only Shiki theme (`material-theme-palenight`), which
   VitePress applies to both light and dark mode — causing unreadable code
   blocks in light mode.

A full internal-link audit (106 markdown files) found no other broken
internal links. External links (~110 unique, mostly `doc.rust-lang.org`)
all resolve; `crates.io` returns 404 to `curl`/bots even for known-good pages
and is not actually broken.

## Non-goals

- No new page layout system or custom hero visual (out of scope per chosen
  approach; see approaches A/B/C discussed in conversation, this is approach C).
- No fabricated content (testimonials, fake stats, etc).
- No changes to lesson-page templates, sidebar generation, or the 90 lesson
  markdown files themselves.

## Design

### 1. Config fixes (`docs/.vitepress/config.ts`)

- `themeConfig.socialLinks[0].link`: `https://github.com/yourusername/rust-90-days`
  → `https://github.com/fahdi/rust-90-days`
- `themeConfig.editLink.pattern`: same placeholder → `fahdi`
- `markdown.theme`: `'material-theme-palenight'` →
  `{ light: 'material-theme-lighter', dark: 'material-theme-palenight' }`

### 2. Progress-aware hero CTA

**Revision (found during Task 4 implementation):** the mutate-frontmatter-in-place
approach described below originally was verified against `VPHomeHero.vue`
(confirming it *reads* `useData().frontmatter.hero.actions` reactively) but
that verification missed how `frontmatter`'s underlying source is populated.
`node_modules/vitepress/dist/client/app/router.js` shows
`route.data = import.meta.env.PROD ? markRaw(__pageData) : readonly(__pageData)`
— the page-data object VitePress hands to `frontmatter` is deliberately
wrapped `readonly()` in dev (writes are rejected, Vue logs
`Set operation on key "text" failed: target is readonly`) and `markRaw()` in
prod (writes silently succeed as a plain property set but are invisible to
Vue's reactivity, so no re-render happens). Mutating
`frontmatter.value.hero.actions[1]` is therefore a no-op in both modes —
confirmed empirically in the implementer's dev and prod testing, not just
by re-reading source.

**Corrected design:** also verified against source
(`node_modules/vitepress/dist/client/theme-default/components/VPHero.vue`),
the native action buttons render inside a single `<div class="actions">`,
immediately followed by `<slot name="home-hero-actions-after" />` — both
direct children of `.VPHero .container .main` (and `VPButton`, the button
component VitePress itself uses, is a public export of `vitepress/theme`).
So instead of mutating frontmatter, this hides the native `.actions` row
with CSS scoped to `.VPHomeHero` (so it never affects any non-home page) and
renders a replacement row of the same two buttons, using the real `VPButton`
component, inside the `home-hero-actions-after` slot. The first button's
text/link is read (not mutated) reactively from
`frontmatter.value.hero.actions[0]`, so `docs/index.md`'s frontmatter stays
the single source of truth for it. The second button starts from local
`ref()` state seeded from `frontmatter.value.hero.actions[1]`
("View Weeks" / `/week-01/`), then on mount is overridden based on saved
progress. `docs/.vitepress/theme/custom.css` gains the hide rule plus a
small layout rule for the replacement row (copied from `VPHero.vue`'s own
`.actions`/`.action` CSS so spacing matches exactly, under new class names
so the hide rule can't accidentally catch the replacement too).

Behavior:
- Reads `localStorage['rust90days-progress']` (same key/shape
  `ProgressTracker.vue` already writes: `{ completed: string[], ... }`).
- No saved progress, or key absent → button reads "View Weeks", links to
  `/week-01/` (current behavior, unchanged).
- Saved progress exists → find the lowest-numbered day (`day-01` .. `day-90`)
  not present in `completed`. Button reads "Continue Day N →", links to
  `/week-{XX}/day-{NN}` for that day. If all 90 are complete, button reads
  "Review Any Lesson", links to `/week-01/`.
- No network calls, no new state store; this is a pure read of existing
  localStorage data, so it introduces no new tracking.

### 3. Journey grid → real links

**Revision (found during plan review, before implementation):** wrapping
each card's whole `<div>` in `<a>` risks breaking the nested markdown —
`<div>` is a CommonMark HTML-block tag that lets markdown-it resume parsing
`##`/`**bold**` after a blank line; `<a>` is not on that tag list, so the
outer element stays `<div>`. Instead, each card's `## heading` becomes a
markdown link (`## [🌟 Week 1-2: Foundation](/week-01/)`), and
`custom.css` adds a `::after` "stretched link" on that heading anchor
(`position: absolute; inset: 0`) so the whole card is clickable while the
underlying link is still a real, crawlable `<a href>`. `.journey-grid > div`
gains `position: relative` plus a `:has(h2 a:hover)` rule for the hover
lift/border treatment, consistent with the existing `.lesson-nav a:hover`
look elsewhere in the file. (This also fixed a pre-existing dead selector:
`.journey-grid h3` never matched anything, since the cards use `##`, which
renders `<h2>` — corrected to `.journey-grid h2`.)

### 4. "How This Course Works" section

New section in `docs/index.md`, placed between the journey grid and the
"Why Rust in 90 Days" section. Two short linked callouts:

- **New here?** → links to `/introduction`
- **How the daily lessons work** → links to `/how-to-use`

Plain markdown links styled with the existing `.journey-grid`-style card
CSS (reused, not a new component), so no new visual language is introduced.

## Testing / verification

- `npm run docs:build` — must complete with no Vue/VitePress compile errors.
- `npm run docs:dev`, manual check:
  - Light mode: code blocks on any lesson page are readable (was the
    reported bug).
  - Homepage: all 7 week cards navigate to the correct `/week-XX/` page.
  - Homepage: "How This Course Works" links resolve to `/introduction` and
    `/how-to-use`.
  - Hero CTA: with `localStorage` cleared, shows "View Weeks". After
    manually seeding `rust90days-progress` with a few completed days, reload
    and confirm it shows "Continue Day N" pointing at the correct next day.
  - Footer/nav: GitHub icon and any "Edit this page" link point to
    `github.com/fahdi/rust-90-days`.
