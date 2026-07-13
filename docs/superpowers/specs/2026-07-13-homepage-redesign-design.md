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

Verified against the installed VitePress source
(`node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue`):
the hero's action buttons render directly from `useData().frontmatter.hero.actions`,
which is a reactive ref. There is no slot that lets you replace the actions
row wholesale (only `home-hero-actions-after`, which appends, not replaces).

So instead of a custom `Layout` override, this adds one new component,
`docs/.vitepress/theme/ContinueButton.vue`, mounted via the
`home-hero-actions-after` slot (wired up in `docs/.vitepress/theme/index.ts`
using the `Layout` wrapper pattern from VitePress's own
"Extending the Default Theme" docs). The component renders no visible markup
of its own; in `onMounted` it calls `useData()`, reads
`localStorage['rust90days-progress']`, and when progress exists, mutates
`frontmatter.value.hero.actions[1].text` and `.link` directly. Because that
ref is reactive, VPHero re-renders the existing second button with the new
label/link automatically, no third button, no layout shift, no DOM hacking.

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

In `docs/index.md`, each of the 7 `<div>...</div>` week-group cards becomes
a single wrapping `<a href="/week-XX/">...</a>` (first week of each pair,
e.g. Week 1-2 card links to `/week-01/`). `custom.css`'s `.journey-grid > div`
selector becomes `.journey-grid > a`, and a `:hover` rule is added
(`transform: translateY(-2px); border-color: var(--vp-c-brand);`) consistent
with the existing `.lesson-nav a:hover` treatment elsewhere in the file.

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
