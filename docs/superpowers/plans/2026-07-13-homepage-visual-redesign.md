# Homepage Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved "Rust-Branded Technical" visual redesign to the homepage: token layer (dark-first dual mode), asymmetric split hero with real code panel + gear watermark, numbered feature grid, restyled week/how-it-works cards, chrome fixes — without regressing any PR #14 functionality.

**Architecture:** All visual change flows through VitePress CSS custom properties plus homepage-scoped `rd-*` classes in `custom.css`. The homepage body is rebuilt as plain HTML + markdown in `docs/index.md`; one new Vue component (`HeroCtas.vue`) owns the CTA pair including the ported progress logic. No new dependencies of any kind.

**Tech Stack:** VitePress 1.6, Vue 3 `<script setup>`, native CSS. Inter (already bundled) + `--vp-font-family-mono`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-homepage-visual-redesign-design.md` (approved). Its "Must-not-regress" section binds every task.
- Zero new dependencies (no fonts, no icon libraries, no animation libraries).
- Zero emoji in homepage markup after this plan.
- Zero em-dashes (`—`) or en-dashes (`–`) in any visible string; ranges use plain hyphens ("Days 1-14").
- Sharp shape system: `border-radius: 2px` max on homepage elements.
- Solid CTAs: `#b93a25` background + white text in both modes. Bare `#ce422b` only for large/bold graphics (numerals, borders).
- The localStorage contract (`rust90days-progress`, `{ completed: string[] }`, zero-padded `day-NN`) must match `ProgressTracker.vue` exactly; `ProgressTracker.vue` itself is untouched.
- Every task ends with `npm run docs:build` passing.
- No automated Vue test framework exists in this repo (only the lesson-content validator); interactive behavior is verified in the browser, dev AND `docs:build`+`docs:preview`, per the spec's verification matrix.

---

### Task 1: Token layer + chrome fixes

**Files:**
- Modify: `docs/.vitepress/theme/custom.css` (top of file: replace the existing `:root` brand block)
- Modify: `docs/.vitepress/config.ts:217` (favicon head link)

**Interfaces:**
- Produces: the `--vp-c-*` token values (spec section 1 tables) that Task 2's homepage styles consume. Also keeps legacy alias `--vp-c-brand` pointing at the accent, because existing lesson-page rules in this same file use it.

- [ ] **Step 1: Replace the brand token block**

`docs/.vitepress/theme/custom.css` currently opens with:

```css
:root {
  --vp-c-brand: #ce422b;
  --vp-c-brand-light: #f74c00;
  --vp-c-brand-lighter: #ff6b35;
  --vp-c-brand-dark: #a33722;
  --vp-c-brand-darker: #7a2a1a;
}
```

Replace that block with:

```css
/* ---- Rust-Branded Technical token layer (spec 2026-07-13) ---- */
/* Light mode */
:root {
  --vp-c-brand: #b93a25; /* legacy alias used by lesson styles below */
  --vp-c-brand-1: #b93a25;
  --vp-c-brand-2: #ce422b;
  --vp-c-brand-3: #b93a25;
  --vp-c-brand-soft: rgba(206, 66, 43, 0.14);

  --vp-c-bg: #faf9f6;
  --vp-c-bg-alt: #f5f3ee;
  --vp-c-bg-soft: #f1eee8;
  --vp-c-bg-elv: #ffffff;
  --vp-c-divider: #e4dfd6;
  --vp-c-text-1: #26211c;
  --vp-c-text-2: #6b635a;
  --vp-c-text-3: #948a7f;

  --vp-button-brand-bg: #b93a25;
  --vp-button-brand-hover-bg: #ce422b;
  --vp-button-brand-active-bg: #a33320;
}

/* Dark mode (flagship) */
.dark {
  --vp-c-brand: #e86a50;
  --vp-c-brand-1: #e86a50;
  --vp-c-brand-2: #ce422b;
  --vp-c-brand-3: #b93a25;
  --vp-c-brand-soft: rgba(206, 66, 43, 0.16);

  --vp-c-bg: #16130f;
  --vp-c-bg-alt: #14110e;
  --vp-c-bg-soft: #1f1b17;
  --vp-c-bg-elv: #1f1b17;
  --vp-c-divider: #332c25;
  --vp-c-text-1: #f3efe6;
  --vp-c-text-2: #9a968c;
  --vp-c-text-3: #665c52;

  --vp-button-brand-bg: #b93a25;
  --vp-button-brand-hover-bg: #ce422b;
  --vp-button-brand-active-bg: #a33320;
}

/* Local search button: sharp, bordered */
.DocSearch-Button {
  border-radius: 2px;
  border: 1px solid var(--vp-c-divider);
}
```

- [ ] **Step 2: Fix the favicon base path**

`docs/.vitepress/config.ts` line 217 currently reads:

```ts
    ['link', { rel: 'icon', href: '/logo.svg' }],
```

Change to (the site's `base` is the constant `/rust-90-days/`, set 5 lines below in the same file):

```ts
    ['link', { rel: 'icon', href: '/rust-90-days/logo.svg' }],
```

- [ ] **Step 3: Verify the build**

Run: `npm run docs:build`
Expected: completes with no errors.

- [ ] **Step 4: Verify in the browser**

Run: `npm run docs:dev`, open the homepage and one lesson page (e.g. `/week-01/day-01`):
- Dark mode: warm-charcoal background (`#16130f`), off-white text, nav and search button pick up the new surfaces; search button has sharp corners and a visible 1px border.
- Light mode (toggle): off-white background, near-black text, links in `#b93a25`.
- Console: no 404 for `/logo.svg` (favicon now resolves under the base path).
- Lesson page still readable in both modes (code blocks unchanged).

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/custom.css docs/.vitepress/config.ts
git commit -m "Add Rust-branded dual-mode token layer; fix favicon base path"
```

---

### Task 2: Homepage restructure (hero, numbered grid, restyled sections)

**Files:**
- Modify: `docs/index.md` (full body rewrite below)
- Create: `docs/.vitepress/theme/HeroCtas.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Delete: `docs/.vitepress/theme/Layout.vue`, `docs/.vitepress/theme/ContinueButton.vue`
- Modify: `docs/.vitepress/theme/custom.css` (append homepage styles; replace the `.journey-grid` heading rules)

**Interfaces:**
- Consumes: Task 1's tokens; `localStorage['rust90days-progress']` with `{ completed: string[] }`, entries `day-NN` zero-padded (identical to `ProgressTracker.vue`'s contract).
- Produces: global component `HeroCtas` (registered in `index.ts`), used only by `docs/index.md`.

- [ ] **Step 1: Create HeroCtas.vue**

Create `docs/.vitepress/theme/HeroCtas.vue`. The progress logic (pad / weekForDay / findNextIncompleteDay / guards) is ported verbatim from the current `ContinueButton.vue`; what changes is rendering (two plain anchors from local state, hrefs via `withBase`) instead of slot-injection beside a hidden native row:

```vue
<template>
  <div class="rd-hero-ctas">
    <a class="rd-btn rd-btn-solid" :href="withBase('/introduction')">Start Learning</a>
    <a class="rd-btn rd-btn-outline" :href="withBase(link)">{{ label }}</a>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const TOTAL_LESSONS = 90

const label = ref('View Weeks')
const link = ref('/week-01/')

function pad(n) {
  return String(n).padStart(2, '0')
}

function weekForDay(day) {
  return day <= 84 ? Math.ceil(day / 7) : 13
}

function findNextIncompleteDay(completed) {
  for (let day = 1; day <= TOTAL_LESSONS; day++) {
    if (!completed.has(`day-${pad(day)}`)) return day
  }
  return null
}

onMounted(() => {
  let saved
  try {
    saved = localStorage.getItem('rust90days-progress')
  } catch (e) {
    return
  }
  if (!saved) return

  let data
  try {
    data = JSON.parse(saved)
  } catch (e) {
    return
  }

  const completed = new Set(data.completed || [])
  if (completed.size === 0) return

  const nextDay = findNextIncompleteDay(completed)

  if (nextDay === null) {
    label.value = 'Review Any Lesson'
    link.value = '/week-01/'
    return
  }

  const week = weekForDay(nextDay)
  label.value = `Continue Day ${nextDay} →`
  link.value = `/week-${pad(week)}/day-${pad(nextDay)}`
})
</script>
```

- [ ] **Step 2: Rewire the theme entry**

Replace the full contents of `docs/.vitepress/theme/index.ts` with:

```ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ProgressTracker from './ProgressTracker.vue'
import HeroCtas from './HeroCtas.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ProgressTracker', ProgressTracker)
    app.component('HeroCtas', HeroCtas)
  }
}
```

Then delete the two now-unused files:

```bash
git rm docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/ContinueButton.vue
```

(Removing the `Layout` override reverts layout duty to the stock default theme; since Step 3 also removes the `hero:` frontmatter, VPHomeHero renders nothing and the old hidden-native-row CSS from PR #14 becomes dead — Step 4 removes it.)

- [ ] **Step 3: Rewrite docs/index.md**

Replace the ENTIRE contents of `docs/index.md` with the following. Notes for the transcriber: the `hero:`/`features:` frontmatter is intentionally gone; blank lines inside `<div>` blocks are load-bearing (they let markdown fences/links parse); the gear SVG is our own simple geometric mark, colored via CSS `currentColor`.

````markdown
---
layout: home
---

<div class="rd-hero">
<div class="rd-hero-copy">
<h1 class="rd-hero-title">Master Rust<br>in 90 days.</h1>
<p class="rd-hero-sub">Ten minutes a day, seven real projects. From your first compile to a working web server.</p>
<HeroCtas />
</div>
<div class="rd-hero-visual">
<svg class="rd-gear" viewBox="0 0 144 144" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><circle cx="72" cy="72" r="54"/><circle cx="72" cy="72" r="34"/><path d="M72 4v16M72 124v16M4 72h16M124 72h16M22 22l11 11M111 111l11 11M122 22l-11 11M33 111l-11 11"/></svg>
<div class="rd-hero-panel">
<div class="rd-panel-tab">day_01.rs</div>

```rust
fn main() {
    let mut day = 1;

    while day <= 90 {
        println!("Day {day}: 10 minutes of Rust");
        day += 1;
    }
    // you, three months from now
}
```

</div>
</div>
</div>

## What you get

<div class="rd-grid">

<div class="rd-cell rd-span-4 rd-cell-tint">
<div class="rd-num">01</div>
<div class="rd-cell-title">Rust fundamentals, properly</div>
<div class="rd-cell-body">Memory safety, ownership, and zero-cost abstractions through code you actually run, not analogies.</div>
</div>

<div class="rd-cell rd-span-2">
<div class="rd-num">02</div>
<div class="rd-cell-title">10 minutes daily</div>
<div class="rd-cell-body">Sustainable for working professionals.</div>
</div>

<div class="rd-cell rd-span-2">
<div class="rd-num">03</div>
<div class="rd-cell-title">13-week path</div>
<div class="rd-cell-body">Beginner to expert, in order.</div>
</div>

<div class="rd-cell rd-span-2">
<div class="rd-num">04</div>
<div class="rd-cell-title">Progress tracking</div>
<div class="rd-cell-body">Streaks and completion, saved locally.</div>
</div>

<div class="rd-cell rd-span-2 rd-cell-texture">
<div class="rd-num">05</div>
<div class="rd-cell-title">Hands-on practice</div>
<div class="rd-cell-body">Every lesson ends with a challenge.</div>
</div>

<div class="rd-cell rd-span-6 rd-cell-row">
<div class="rd-num">06</div>
<div>
<div class="rd-cell-title">Seven real projects</div>
<div class="rd-cell-body">Temperature converter, CLI calculator, text analyzer, config parser, word counter, graph store, micro web server.</div>
</div>
</div>

</div>

## The 13-week journey

<div class="journey-grid">

<div>
<div class="rd-kicker">W 1-2 · DAYS 1-14</div>

## [Foundation](/week-01/)

Start your Rust journey with the basics: variables, functions, control flow, and project organization. Build your first CLI tools.

**Projects:** Temperature Converter, CLI Calculator

</div>

<div>
<div class="rd-kicker">W 3-4 · DAYS 15-28</div>

## [Ownership](/week-03/)

Master Rust's unique ownership system - the key to memory safety without garbage collection.

**Projects:** Text Analyzer

</div>

<div>
<div class="rd-kicker">W 5-6 · DAYS 29-42</div>

## [Structs & Enums](/week-05/)

Build complex data structures and handle different program states with confidence.

**Projects:** Config Parser, JSON-like Data Structure

</div>

<div>
<div class="rd-kicker">W 7-8 · DAYS 43-56</div>

## [Collections](/week-07/)

Work with vectors, hashmaps, and powerful iterators. Master functional programming with closures.

**Projects:** Word Frequency Counter

</div>

<div>
<div class="rd-kicker">W 9-10 · DAYS 57-70</div>

## [Traits & Generics](/week-09/)

Write flexible, reusable code with traits and generics. Understand polymorphism the Rust way.

**Projects:** Generic Data Store

</div>

<div>
<div class="rd-kicker">W 11-12 · DAYS 71-84</div>

## [Advanced Topics](/week-11/)

Dive deep into lifetimes and smart pointers for sophisticated memory management patterns.

**Projects:** Graph Data Structure

</div>

<div>
<div class="rd-kicker">W 13 · DAYS 85-90</div>

## [Expert Level](/week-13/)

Explore async/await, macros, and unsafe Rust for production-ready applications.

**Projects:** Micro Web Server

</div>

</div>

## How this course works

<div class="journey-grid">

<div>

## [New here? Start with the introduction](/introduction)

What this course covers, how the 90 days are structured, and what you'll be able to build by the end.

</div>

<div>

## [How the daily lessons work](/how-to-use)

How to pace yourself, what a typical 10-minute lesson looks like, and how to use the progress tracker.

</div>

</div>
````

(The old "Why Rust in 90 Days?" section and the trailing `<style>` block with `.VPButton` rules are gone deliberately: the former is absorbed into the numbered grid per the spec; the latter styled the stock hero buttons that no longer render.)

- [ ] **Step 4: Homepage styles in custom.css**

Two edits in `docs/.vitepress/theme/custom.css`:

**(a)** Delete the PR #14 hidden-native-row block (now dead code) — the block that reads:

```css
.VPHomeHero .actions {
  display: none;
}

.continue-cta-row {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
  padding-top: 24px;
  justify-content: center;
}

.continue-cta-row .action {
  flex-shrink: 0;
  padding: 6px;
}

@media (min-width: 640px) {
  .continue-cta-row {
    padding-top: 32px;
  }
}

@media (min-width: 960px) {
  .continue-cta-row {
    justify-content: flex-start;
  }
}
```

**(b)** Append the homepage design system at the end of the file:

```css
/* ---- Homepage: Rust-Branded Technical ---- */

/* Section headings on home: strip vp-doc's divider treatment */
.VPHome .vp-doc h2 {
  border-top: none;
  padding-top: 0;
  margin: 64px 0 28px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Hero */
.rd-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 48px;
  align-items: center;
  padding: 48px 0 24px;
}

.rd-hero-title {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0;
}

.rd-hero-sub {
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.55;
  max-width: 38ch;
  margin: 20px 0 0;
}

.rd-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.rd-btn {
  display: inline-block;
  padding: 11px 22px;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
}

.rd-btn:active {
  transform: scale(0.98);
}

.rd-btn-solid {
  background: var(--vp-c-brand-3);
  color: #ffffff;
}

.rd-btn-solid:hover {
  background: var(--vp-c-brand-2);
  color: #ffffff;
}

.rd-btn-outline {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.rd-btn-outline:hover {
  border-color: var(--vp-c-brand-2);
}

/* Hero visual: code panel + gear watermark */
.rd-hero-visual {
  position: relative;
}

.rd-gear {
  position: absolute;
  top: -70px;
  right: -70px;
  width: 400px;
  height: 400px;
  color: var(--vp-c-brand-2);
  opacity: 0.07;
  pointer-events: none;
  z-index: 0;
}

.rd-hero-panel {
  position: relative;
  z-index: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.rd-panel-tab {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 8px 14px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-brand-1);
}

.rd-hero-panel div[class*='language-'] {
  margin: 0;
  border-radius: 0;
}

/* Numbered feature grid */
.rd-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

.rd-cell {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  padding: 22px;
}

.rd-span-2 { grid-column: span 2; }
.rd-span-4 { grid-column: span 4; }
.rd-span-6 { grid-column: span 6; }

.rd-cell-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rd-num {
  font-family: var(--vp-font-family-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-brand-2);
}

.rd-cell-title {
  color: var(--vp-c-text-1);
  font-weight: 700;
  font-size: 15px;
  margin-top: 8px;
}

.rd-cell-row .rd-cell-title {
  margin-top: 0;
}

.rd-cell-body {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
  margin-top: 5px;
}

.rd-cell-tint {
  background: linear-gradient(135deg, #f3e5dd, var(--vp-c-bg-soft));
  border-color: #e0cfc4;
}

.dark .rd-cell-tint {
  background: linear-gradient(135deg, #241a14, var(--vp-c-bg-soft));
  border-color: #3d2c22;
}

.rd-cell-texture {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 6px,
    rgba(206, 66, 43, 0.05) 6px,
    rgba(206, 66, 43, 0.05) 7px
  );
}

/* Week-card kicker + sharpened cards */
.rd-kicker {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
  margin-bottom: 2px;
}

.journey-grid > div {
  border-radius: 2px;
}

.journey-grid h2 {
  font-size: 1.05rem;
}

/* Entry motion (hero only, one-time, transform/opacity only) */
@media (prefers-reduced-motion: no-preference) {
  .rd-hero-copy > * {
    animation: rd-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .rd-hero-copy > *:nth-child(2) { animation-delay: 0.08s; }
  .rd-hero-copy > *:nth-child(3) { animation-delay: 0.16s; }
  .rd-hero-visual {
    animation: rd-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }
}

@keyframes rd-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* Mobile collapse */
@media (max-width: 767px) {
  .rd-hero {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-top: 24px;
  }
  .rd-gear {
    width: 260px;
    height: 260px;
    top: -40px;
    right: -40px;
  }
  .rd-grid {
    grid-template-columns: 1fr;
  }
  .rd-span-2, .rd-span-4, .rd-span-6 {
    grid-column: auto;
  }
  .rd-cell-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
```

- [ ] **Step 5: Verify the build**

Run: `npm run docs:build`
Expected: no errors. Then: `grep -c 'href="/rust-90-days/week-' docs/.vitepress/dist/index.html` — expected 7 or more (week links survive), and `grep -o 'href="/rust-90-days/introduction' docs/.vitepress/dist/index.html | head -1` returns a match.

- [ ] **Step 6: Full browser matrix (dev)**

`npm run docs:dev`, homepage:
- Dark + light modes: split hero renders, code panel Shiki-highlighted in both, gear watermark faint behind panel, numbered grid asymmetric with tint/texture cells, week cards show mono kickers with no emoji anywhere.
- Incognito (empty localStorage): second CTA reads "View Weeks" → `/week-01/`.
- Seed `localStorage.setItem('rust90days-progress', JSON.stringify({ completed: ['day-01','day-02','day-03'] }))`, reload: "Continue Day 4 →" → `/week-01/day-04`.
- Seed all 90 (`Array.from({length:90},(_,i)=>'day-'+String(i+1).padStart(2,'0'))`), reload: "Review Any Lesson" → `/week-01/`.
- Week cards: click card BODY (not heading) on at least 2 cards — navigates (stretched-link regression check).
- Then `localStorage.removeItem('rust90days-progress')`.

- [ ] **Step 7: Repeat CTA states + theme check in production preview**

`npm run docs:build && npm run docs:preview`, repeat Step 6's three CTA states and a dark/light spot-check. Stop the server after.

- [ ] **Step 8: Commit**

```bash
git add -A docs/index.md docs/.vitepress/theme/
git commit -m "Rebuild homepage with Rust-branded design: split hero, numbered grid, restyled sections"
```

---

### Task 3: Final verification pass

**Files:** None (verification only; report defects, do not fix).

- [ ] **Step 1:** `rm -rf docs/.vitepress/dist docs/.vitepress/cache && npm run docs:build && npm test` — both green.
- [ ] **Step 2:** `npm run docs:preview`; click through: homepage → all 7 week cards → back; introduction; how-to-use; one lesson page; search "ownership" returns results. No 404s, no console errors (the `/logo.svg` favicon 404 must be gone).
- [ ] **Step 3:** Both themes on homepage + lesson page: contrast sane, code readable, no stray stock-VitePress-green anywhere (the default brand green would indicate a token that didn't take).
- [ ] **Step 4:** Emulate `prefers-reduced-motion: reduce` (devtools rendering tab): hero appears instantly, no rise animation.
- [ ] **Step 5:** Narrow viewport (<768px): hero stacks (copy above panel), grid single-column, nav single line.
- [ ] **Step 6:** Stop the server; write findings to the report file.
