---
title: "Day 55 - Project: Word Frequency Counter"
description: "Learn about project: word frequency counter in Rust"
---

# Day 55: Project: Word Frequency Counter

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Build a word frequency counter that combines everything from Week 8: HashMap, the entry API, iterators, and sorting. By the end you'll have a small but complete text-analysis tool.

## 📚 The Concept (3 min)

Word frequency counting is the "hello world" of text processing, it powers search engine ranking, spam filters, and autocomplete suggestions. The task sounds trivial: read text, split it into words, count how many times each word appears. But doing it cleanly exercises a surprising number of Rust skills at once.

The core data structure is `HashMap<String, u32>`: the word is the key, the count is the value. The naive approach checks whether a key exists, then inserts or updates in two separate steps. Rust gives you something better, the **entry API**. `map.entry(word).or_insert(0)` returns a mutable reference to the count, inserting `0` first if the word was never seen. One line, one hash lookup, no branching in your code.

The second half of the project is presentation. A HashMap has no ordering, so "show me the top 5 words" requires collecting the entries into a `Vec` and sorting it. `sort_by` with a comparator lets you sort descending by count, and because you learned iterator adapters this week, `iter().take(5)` gives you the top results without any index arithmetic.

There is also a normalization question every real counter must answer: is "The" the same word as "the"? Is "word," (with a comma) the same as "word"? We'll lowercase everything and strip non-alphabetic edge characters so counts reflect actual words, not punctuation accidents.

::: tip Key Insight
`*map.entry(word).or_insert(0) += 1` is the canonical Rust counting idiom. It does lookup, default-insertion, and increment in a single expression with exactly one hash of the key.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::collections::HashMap;

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";

    let mut counts: HashMap<&str, u32> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }

    println!("unique words: {}", counts.len());
    println!("'the' appears {} times", counts["the"]);
    println!("'fox' appears {} times", counts["fox"]);
}
```

### Example 2: Practical Application

```rust
use std::collections::HashMap;

fn word_frequencies(text: &str) -> Vec<(String, u32)> {
    let mut counts: HashMap<String, u32> = HashMap::new();
    for raw in text.split_whitespace() {
        let word: String = raw
            .trim_matches(|c: char| !c.is_alphabetic())
            .to_lowercase();
        if !word.is_empty() {
            *counts.entry(word).or_insert(0) += 1;
        }
    }
    let mut pairs: Vec<(String, u32)> = counts.into_iter().collect();
    pairs.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
    pairs
}

fn main() {
    let text = "To be, or not to be: that is the question. \
                To die, to sleep; to sleep, perchance to dream.";

    for (word, count) in word_frequencies(text).iter().take(3) {
        println!("{}: {}", word, count);
    }
}
```

::: details Output
Example 1:
```
unique words: 8
'the' appears 3 times
'fox' appears 2 times
```
Example 2:
```
to: 6
be: 2
sleep: 2
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `entry(key).or_insert(0)` is the idiomatic one-lookup way to count occurrences in a HashMap  
✅ HashMaps are unordered, to rank results, collect into a `Vec` and `sort_by`  
✅ `b.1.cmp(&a.1)` (arguments swapped) sorts descending; chain `.then(...)` for a tie-breaker  
✅ Real text needs normalization: `to_lowercase()` plus `trim_matches` on non-alphabetic characters

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Using `counts[word] += 1` without inserting first, indexing a HashMap panics on missing keys; use `entry` instead
- Splitting on a single space (`split(' ')`) instead of `split_whitespace()`, which mishandles tabs, newlines, and repeated spaces
- Forgetting that after stripping punctuation a token like `"—"` becomes an empty string; guard with `is_empty()` or you count phantom words
:::

## ✅ Quick Challenge

Extend the counter: write a function `most_common(text: &str) -> Option<(String, u32)>` that returns the single most frequent word (any tie-winner is fine), or `None` for empty input.

```rust
use std::collections::HashMap;

fn most_common(text: &str) -> Option<(String, u32)> {
    // Your code here: count words, then find the max by count
    None
}

fn main() {
    let text = "apple banana apple cherry apple banana";
    println!("{:?}", most_common(text));
}
```

<details>
<summary>💡 Hint</summary>

Build the `HashMap<String, u32>` as in the examples, then use `counts.into_iter().max_by_key(|(_, c)| *c)` to find the winner.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::collections::HashMap;

fn most_common(text: &str) -> Option<(String, u32)> {
    let mut counts: HashMap<String, u32> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word.to_lowercase()).or_insert(0) += 1;
    }
    counts.into_iter().max_by_key(|&(_, count)| count)
}

fn main() {
    let text = "apple banana apple cherry apple banana";
    println!("{:?}", most_common(text)); // Some(("apple", 3))
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Storing Keys with Associated Values in Hash Maps](https://doc.rust-lang.org/book/ch08-03-hash-maps.html)
- [Rust by Example - HashMap](https://doc.rust-lang.org/rust-by-example/std/hash.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/day-54">← Day 54: Common Iterator Patterns</a>
  <a href="/week-08/day-56">Day 56: Collection Performance Tips →</a>
</div>
