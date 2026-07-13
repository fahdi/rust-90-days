# Homepage Redesign & Link Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken/missing homepage navigation (unlinked week cards, orphaned pages), fix two config bugs (placeholder GitHub URL, unreadable light-mode code), and add a progress-aware "Continue Day N" hero CTA, without introducing a new visual system or automated test framework the project doesn't already have.

**Architecture:** All changes are additive/local to `docs/index.md`, `docs/.vitepress/config.ts`, `docs/.vitepress/theme/custom.css`, and three new files under `docs/.vitepress/theme/`. No build tooling, dependencies, or routing changes.

**Tech Stack:** VitePress 1.x, Vue 3 `<script setup>` SFCs, plain CSS custom properties (existing `--vp-c-*` tokens).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-homepage-redesign-design.md` (approved).
- No fabricated content (no fake testimonials/stats).
- No new dependencies. This repo has no Vue component test runner (`package.json` only lists `vitepress`/`vue`; `npm test` runs `scripts/validate-lessons.js`, a content validator, not a Vue test suite) — per the approved spec, the interactive component (Task 4) is verified manually in the browser, not via an automated test. Do not add vitest/@vue/test-utils to work around this; that would be an unrequested architecture change.
- Every task must end with `npm run docs:build` passing (no Vue/VitePress compile errors) before moving to the next task.
- GitHub repo is `fahdi/rust-90-days` (verified via `git remote -v`).

---

### Task 1: Fix config placeholders and light-mode code theme

**Files:**
- Modify: `docs/.vitepress/config.ts:249` (socialLinks), `:262` (editLink.pattern), `:268` (markdown.theme)

**Interfaces:** None (isolated config value changes, no new exports).

- [ ] **Step 1: Fix the GitHub social link**

In `docs/.vitepress/config.ts`, line 249, change:

```ts
      { icon: 'github', link: 'https://github.com/yourusername/rust-90-days' }
```

to:

```ts
      { icon: 'github', link: 'https://github.com/fahdi/rust-90-days' }
```

- [ ] **Step 2: Fix the edit-link pattern**

Same file, line 262, change:

```ts
      pattern: 'https://github.com/yourusername/rust-90-days/edit/main/docs/:path',
```

to:

```ts
      pattern: 'https://github.com/fahdi/rust-90-days/edit/main/docs/:path',
```

- [ ] **Step 3: Fix the light-mode code theme**

Same file, line 268, change:

```ts
    theme: 'material-theme-palenight',
```

to:

```ts
    theme: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight'
    },
```

- [ ] **Step 4: Verify the build**

Run: `npm run docs:build`
Expected: build completes with no errors (exit code 0).

- [ ] **Step 5: Verify in the browser**

Run: `npm run docs:dev`, open the printed local URL, open any lesson page (e.g. `/week-01/day-01`), toggle to light mode (sun/moon icon in the nav), confirm code blocks now have dark text on a light background instead of low-contrast text.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/config.ts
git commit -m "Fix placeholder GitHub URLs and light-mode code theme"
```

---

### Task 2: Make journey-grid week cards real, crawlable links

**Files:**
- Modify: `docs/index.md:40-119` (the `journey-grid` block)
- Modify: `docs/.vitepress/theme/custom.css:58-75` (`.journey-grid` rules)

**Interfaces:** None (markdown/CSS only).

**Implementation note (why not `<a>` as the outer wrapper):** `<div>` is a CommonMark "HTML block" tag, so markdown-it lets markdown (`##`, `**bold**`) resume inside it after a blank line — that's why the existing cards render correctly today. `<a>` is not on that tag list, so swapping the outer `<div>` for `<a>` risks the nested `##`/`**bold**` being left unparsed (rendered as literal text) instead of becoming real headings/bold text. To avoid that risk, keep `<div>` as the outer element, turn only the heading text into a real markdown link, and use a CSS "stretched link" (`::after` with `position: absolute; inset: 0`) so the whole card is clickable while the underlying element is still a genuine `<a href>` a search crawler and screen reader see.

- [ ] **Step 1: Turn each card heading into a link**

In `docs/index.md`, the journey-grid block currently reads (showing card 1 of 7; the same edit applies to all 7):

```markdown
<div>

## 🌟 Week 1-2: Foundation
**Days 1-14**

Start your Rust journey with the basics: variables, functions, control flow, and project organization. Build your first CLI tools.

**Projects:** Temperature Converter, CLI Calculator

</div>
```

Change the heading line only, in each of the 7 cards, per this mapping (matches the existing `Weeks` nav dropdown in `config.ts`):

| Card heading text | Link |
|---|---|
| 🌟 Week 1-2: Foundation | `/week-01/` |
| 🔐 Week 3-4: Ownership | `/week-03/` |
| 🏗️ Week 5-6: Structs & Enums | `/week-05/` |
| 📚 Week 7-8: Collections | `/week-07/` |
| 🎨 Week 9-10: Traits & Generics | `/week-09/` |
| 🧠 Week 11-12: Advanced Topics | `/week-11/` |
| 🚀 Week 13: Expert Level | `/week-13/` |

Card 1's heading becomes:

```markdown
## [🌟 Week 1-2: Foundation](/week-01/)
```

Apply the same pattern (wrap the existing heading text in `[...]`, append the matching link) to the other 6 cards. Do not change anything else in the block (body text, `<div>` tags, blank lines all stay as-is).

- [ ] **Step 2: Make the whole card clickable and fix the heading-color selector**

In `docs/.vitepress/theme/custom.css`, the current rule block is:

```css
.journey-grid > div {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.journey-grid h3 {
  margin-top: 0;
  color: var(--vp-c-brand);
}
```

Replace it with:

```css
.journey-grid > div {
  position: relative;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, border-color 0.2s;
}

.journey-grid > div:has(h2 a:hover) {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand);
}

.journey-grid h2 {
  margin-top: 0;
  font-size: 1.25rem;
}

.journey-grid h2 a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.journey-grid h2 a::after {
  content: '';
  position: absolute;
  inset: 0;
}
```

(The original `.journey-grid h3` selector never matched anything — the cards use `##`, which renders `<h2>`, not `<h3>` — so this also fixes a pre-existing dead rule while touching the same block.)

- [ ] **Step 3: Verify the build**

Run: `npm run docs:build`
Expected: build completes with no errors.

- [ ] **Step 4: Verify rendered HTML has real links**

Run: `grep -o 'href="/week-[0-9]*/"' docs/.vitepress/dist/index.html | sort -u`
Expected: 7 distinct `href="/week-XX/"` values, matching the table in Step 1 (`week-01`, `week-03`, `week-05`, `week-07`, `week-09`, `week-11`, `week-13`).

- [ ] **Step 5: Verify in the browser**

Run: `npm run docs:dev`, open the homepage, confirm:
- Each of the 7 cards is clickable anywhere on the card (not just the heading text) and navigates to the right `/week-XX/` page.
- Hovering a card lifts it slightly and the border turns brand-orange.
- Card body text (non-heading) is not blue/underlined (only the heading looks like a link).

- [ ] **Step 6: Commit**

```bash
git add docs/index.md docs/.vitepress/theme/custom.css
git commit -m "Make journey-grid week cards real clickable links"
```

---

### Task 3: Add "How This Course Works" section

**Files:**
- Modify: `docs/index.md` (insert new section after the `journey-grid` closing `</div>`, before `## Why Rust in 90 Days?`)

**Interfaces:** None (markdown only, reuses the `.journey-grid` CSS class from Task 2 — no new CSS).

- [ ] **Step 1: Insert the new section**

In `docs/index.md`, find this boundary (the end of the journey-grid block and the start of the "Why" section):

```markdown
</div>

## Why Rust in 90 Days?
```

Insert a new section between them, so it reads:

```markdown
</div>

## How This Course Works

<div class="journey-grid">

<div>

## [🆕 New here? Start with the introduction](/introduction)

What this course covers, how the 90 days are structured, and what you'll be able to build by the end.

</div>

<div>

## [📖 How the daily lessons work](/how-to-use)

How to pace yourself, what a typical 10-minute lesson looks like, and how to use the progress tracker.

</div>

</div>

## Why Rust in 90 Days?
```

- [ ] **Step 2: Verify the build**

Run: `npm run docs:build`
Expected: build completes with no errors.

- [ ] **Step 3: Verify links resolve**

Run: `grep -o 'href="/introduction"\|href="/how-to-use"' docs/.vitepress/dist/index.html`
Expected: both `href="/introduction"` and `href="/how-to-use"` appear.

- [ ] **Step 4: Verify in the browser**

Run: `npm run docs:dev`, open the homepage, confirm the new "How This Course Works" section appears between the week cards and "Why Rust in 90 Days?", styled consistently with the week cards above it (same card look, hover lift), and both links navigate correctly.

- [ ] **Step 5: Commit**

```bash
git add docs/index.md
git commit -m "Add How This Course Works section linking introduction and how-to-use"
```

---

### Task 4: Progress-aware hero CTA

**Files:**
- Create: `docs/.vitepress/theme/ContinueButton.vue`
- Create: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/index.ts`

**Interfaces:**
- Consumes: `localStorage['rust90days-progress']`, JSON shape `{ completed: string[] }` where each entry is `"day-NN"` (zero-padded) — this is the exact shape `docs/.vitepress/theme/ProgressTracker.vue` already reads/writes (see its `loadProgress`/`saveProgress` functions).
- Produces: no new exports consumed elsewhere; `ContinueButton` is used only by `Layout.vue` in this task.

- [ ] **Step 1: Create the ContinueButton component**

Create `docs/.vitepress/theme/ContinueButton.vue`:

```vue
<template>
  <!-- Renders no markup of its own; on mount it mutates the hero's
       second action button in place via the reactive frontmatter ref
       VitePress's VPHomeHero.vue renders from. -->
</template>

<script setup>
import { onMounted } from 'vue'
import { useData } from 'vitepress'

const TOTAL_LESSONS = 90
const { frontmatter } = useData()

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
  const actions = frontmatter.value.hero && frontmatter.value.hero.actions
  if (!actions || !actions[1]) return

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
    actions[1].text = 'Review Any Lesson'
    actions[1].link = '/week-01/'
    return
  }

  const week = weekForDay(nextDay)
  actions[1].text = `Continue Day ${nextDay} →`
  actions[1].link = `/week-${pad(week)}/day-${pad(nextDay)}`
})
</script>
```

- [ ] **Step 2: Create the Layout wrapper that mounts it**

Create `docs/.vitepress/theme/Layout.vue`:

```vue
<script setup>
import DefaultTheme from 'vitepress/theme'
import ContinueButton from './ContinueButton.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-actions-after>
      <ContinueButton />
    </template>
  </Layout>
</template>
```

- [ ] **Step 3: Wire the Layout override into the theme**

`docs/.vitepress/theme/index.ts` currently reads:

```ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ProgressTracker from './ProgressTracker.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ProgressTracker', ProgressTracker)
  }
}
```

Change it to:

```ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ProgressTracker from './ProgressTracker.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ProgressTracker', ProgressTracker)
  }
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run docs:build`
Expected: build completes with no errors.

- [ ] **Step 5: Verify default (no-progress) behavior in the browser**

Run: `npm run docs:dev`, open the homepage in a private/incognito window (guarantees empty `localStorage`). Confirm the second hero button still reads "View Weeks" and links to `/week-01/` (unchanged from before this task).

- [ ] **Step 6: Verify progress-aware behavior in the browser**

In the same dev server, open the homepage in a normal window, open devtools console, run:

```js
localStorage.setItem('rust90days-progress', JSON.stringify({ completed: ['day-01', 'day-02', 'day-03'] }))
```

Reload the homepage. Confirm the second hero button now reads "Continue Day 4 →" and clicking it navigates to `/week-01/day-04`.

- [ ] **Step 7: Verify the all-complete edge case**

In devtools console, run:

```js
const all = []
for (let d = 1; d <= 90; d++) all.push('day-' + String(d).padStart(2, '0'))
localStorage.setItem('rust90days-progress', JSON.stringify({ completed: all }))
```

Reload the homepage. Confirm the second hero button reads "Review Any Lesson" and links to `/week-01/`.

- [ ] **Step 8: Clean up test data**

In devtools console, run: `localStorage.removeItem('rust90days-progress')`

- [ ] **Step 9: Commit**

```bash
git add docs/.vitepress/theme/ContinueButton.vue docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/index.ts
git commit -m "Add progress-aware Continue Day N hero CTA"
```

---

### Task 5: Full verification pass

**Files:** None (verification only).

**Interfaces:** None.

- [ ] **Step 1: Clean build from scratch**

Run: `rm -rf docs/.vitepress/dist docs/.vitepress/cache && npm run docs:build`
Expected: build completes with no errors or warnings about missing links.

- [ ] **Step 2: Re-run the internal link audit**

Run: `find docs -iname "index.md" | grep -v node_modules` to confirm no new markdown files were accidentally left out, then re-check internal links resolve by starting the preview server and clicking through: homepage → each of the 7 week cards → back → "How This Course Works" → introduction → back → how-to-use → back.

Expected: every link lands on a real page, no 404s.

- [ ] **Step 3: Verify footer/nav GitHub links**

Run: `npm run docs:preview`, open the homepage, click the GitHub icon in the top nav.
Expected: navigates to `https://github.com/fahdi/rust-90-days` (not `yourusername`).

- [ ] **Step 4: Verify light-mode code readability one more time**

Open any lesson page in light mode, confirm code block text is clearly readable against its background.

- [ ] **Step 5: Stop the preview server**

Ctrl-C the `docs:preview` process.
