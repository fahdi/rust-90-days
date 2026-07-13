---
title: "Day 27 - Project: Text Analyzer"
description: "Learn about project: text analyzer in Rust"
---

# Day 27: Project: Text Analyzer

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Build a small text analyzer that counts words, lines, and word frequencies — and use it to practice everything Week 4 taught you about ownership: borrowing with `&str`, and knowing when a function should return borrowed vs. owned data.

## 📚 The Concept (3 min)

Today is a project day. Instead of learning one new rule, you'll combine the ownership skills from Days 22–26 into something useful: a text analyzer, the kind of tool behind word counters, readability scores, and search indexing.

The design question at the heart of this project is: **who owns the text?** Think of the text like a library book. The analyzer doesn't need to *keep* the book — it just needs to read it, take some notes (counts, frequencies), and hand it back. That means every analysis function should take `&str`, a borrowed view of the text, rather than `String`, which would take ownership. If `count_words` demanded a `String`, the caller would lose their text after a single count — or be forced to `.clone()` everywhere, which is wasteful.

The second design question is what to **return**. Counts like `usize` are `Copy`, so they're trivially cheap to hand back. But a frequency table is new data the function *creates* — it didn't exist in the input — so the function must return an owned `HashMap`. And sometimes you can return a borrowed slice of the input itself: "find the longest word" doesn't need to build anything new; it can return a `&str` pointing into the original text. Rust's lifetime elision handles the signature `fn longest_word(text: &str) -> &str` for you: the returned slice lives as long as the input.

That's the pattern professional Rust APIs follow: **borrow inputs, own what you create, and return slices when the answer already lives inside the input.**

::: tip Key Insight
Analysis functions should take `&str` (borrow, don't take ownership) and only return owned data — like a `HashMap` — when they genuinely create something new. If the answer is already inside the input, return a borrowed slice instead.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Three small analysis functions, all borrowing the text. Notice the caller can keep using `report` afterward:

```rust
fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn count_lines(text: &str) -> usize {
    text.lines().count()
}

fn count_chars(text: &str) -> usize {
    text.chars().filter(|c| !c.is_whitespace()).count()
}

fn main() {
    let report = "Rust is fast.\nRust is safe.\nRust is fun.";

    println!("--- Text Analyzer ---");
    println!("Words: {}", count_words(report));
    println!("Lines: {}", count_lines(report));
    println!("Characters (no spaces): {}", count_chars(report));

    // `report` still works here -- the functions only borrowed it!
    println!("Original text is intact: {} bytes", report.len());
}
```

### Example 2: Practical Application

A word-frequency analyzer. This function *creates* new data (the frequency table), so it returns an owned `HashMap<String, usize>`. The `entry().or_insert()` API gives us "insert 0 if missing, then increment" in one line:

```rust
use std::collections::HashMap;

fn word_frequencies(text: &str) -> HashMap<String, usize> {
    let mut freq = HashMap::new();
    for word in text.split_whitespace() {
        let cleaned: String = word
            .chars()
            .filter(|c| c.is_alphanumeric())
            .collect::<String>()
            .to_lowercase();
        if !cleaned.is_empty() {
            *freq.entry(cleaned).or_insert(0) += 1;
        }
    }
    freq
}

fn main() {
    let text = "The quick brown fox jumps over the lazy dog. The dog barks.";
    let freq = word_frequencies(text);

    println!("Unique words: {}", freq.len());

    // Sort by count (descending), then alphabetically for ties
    let mut ranked: Vec<(&String, &usize)> = freq.iter().collect();
    ranked.sort_by(|a, b| b.1.cmp(a.1).then(a.0.cmp(b.0)));

    println!("Top 3 words:");
    for (word, count) in ranked.iter().take(3) {
        println!("  {word}: {count}");
    }
}
```

::: details Output
```
--- Text Analyzer ---
Words: 9
Lines: 3
Characters (no spaces): 32
Original text is intact: 40 bytes
Unique words: 9
Top 3 words:
  the: 3
  dog: 2
  barks: 1
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Analysis functions take `&str` so the caller keeps ownership of the text and no clones are needed  
✅ Return owned data (`HashMap`, `String`) only when the function creates something that didn't exist in the input  
✅ `freq.entry(key).or_insert(0)` then `+= 1` is the idiomatic HashMap counting pattern  
✅ `split_whitespace()`, `lines()`, and `chars()` are zero-copy iterators — they borrow the text instead of allocating new strings

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Taking `String` instead of `&str` as a parameter.** `fn count_words(text: String)` moves the text into the function, so the caller can't use it afterward. This does NOT compile: calling `count_words(report)` and then `println!("{}", report)` fails with "value borrowed here after move." Borrow with `&str` instead.
- **Forgetting to normalize words before counting.** Without lowercasing and stripping punctuation, "The", "the", and "the," count as three different words — your frequency table will be silently wrong even though the code compiles.
- **Trying to mutate a HashMap while iterating it.** Something like looping over `freq.iter()` and inserting into `freq` inside the loop does NOT compile — the iterator holds an immutable borrow, so a simultaneous mutable borrow is rejected. Collect the changes first, or use the `entry` API during the initial build.
:::

## ✅ Quick Challenge

Extend the analyzer with a `longest_word` function that returns the longest word as a `&str` borrowed from the input — no new `String` allocation allowed. The starter compiles but always returns an empty string; make it return the right word.

```rust
fn longest_word(text: &str) -> &str {
    // TODO: return the longest word in `text`
    ""
}

fn main() {
    let text = "ownership makes Rust wonderfully unique";
    println!("Longest word: {}", longest_word(text));
}
```

<details>
<summary>💡 Hint</summary>

`text.split_whitespace()` gives you an iterator of `&str` slices that already borrow from `text`. Iterators have a `max_by_key` method that picks the item with the largest key — try keying on `word.len()`. It returns an `Option`, so use `unwrap_or("")` to handle empty input.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn longest_word(text: &str) -> &str {
    text.split_whitespace()
        .max_by_key(|word| word.len())
        .unwrap_or("")
}

fn main() {
    let text = "ownership makes Rust wonderfully unique";
    println!("Longest word: {}", longest_word(text));
}
```

Output: `Longest word: wonderfully`

Note the signature: the returned `&str` is a slice of the input, so no allocation happens. Lifetime elision means Rust automatically ties the output's lifetime to the input's — this is exactly the safe version of what Day 26's dangling-reference rules protect.

</details>

## 📖 Additional Resources

- [The Rust Book - Storing Keys with Associated Values in Hash Maps](https://doc.rust-lang.org/book/ch08-03-hash-maps.html)
- [Rust by Example - HashMap](https://doc.rust-lang.org/rust-by-example/std/hash.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/day-26">← Day 26: Dangling References</a>
  <a href="/week-04/day-28">Day 28: Ownership Patterns Review →</a>
</div>
