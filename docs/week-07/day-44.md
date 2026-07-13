---
title: "Day 44 - Hash Maps"
description: "Learn about hash maps in Rust"
---

# Day 44: Hash Maps

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Store and look up key-value pairs with `HashMap`, and use the `entry` API to update values in place, the idiomatic way to build counters and caches in Rust.

## 📚 The Concept (3 min)

Yesterday's vectors are great when your data is a sequence you access by position. But often you want to access data by *name*: "what's the population of Lahore?" or "how many times did this word appear?" That's a hash map, Rust's `HashMap&lt;K, V&gt;` from `std::collections`, the equivalent of Python's dict or JavaScript's Map.

Think of it as a coat check. You hand over a coat (the value) and get a numbered ticket (the key). Later, you present the ticket and get exactly your coat back, instantly, without the attendant searching every rack. Internally, a hashing function converts your key into a storage location, which is why lookups are fast on average no matter how many entries you have.

Three things make Rust's `HashMap` feel different from other languages:

1. **Lookups return `Option`.** `map.get("key")` gives you `Some(&value)` or `None`, the compiler forces you to handle the missing-key case instead of crashing or returning `undefined`.

2. **Ownership applies.** Inserting an owned type like `String` *moves* it into the map. Types that implement `Copy`, like `i32`, are copied instead.

3. **The `entry` API.** The classic "insert if absent, otherwise update" dance is a one-liner: `*map.entry(key).or_insert(0) += 1;`. `entry` returns a handle to the key's slot, `or_insert` fills it with a default if empty, and you get a mutable reference back.

One caveat: iteration order is effectively random and can differ between runs. If you need stable output, collect entries into a `Vec` and sort, you'll see this in Example 2.

::: tip Key Insight
A `HashMap` trades ordering for speed: you get near-instant lookup by key, but no defined iteration order. Reach for it whenever you catch yourself scanning a `Vec` just to find an element by some field.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::collections::HashMap;

fn main() {
    // Create an empty hash map: city -> population (in thousands)
    let mut populations: HashMap<String, u32> = HashMap::new();

    populations.insert(String::from("Lahore"), 13004);
    populations.insert(String::from("Karachi"), 16840);
    populations.insert(String::from("Islamabad"), 1108);

    // Look up a value: get() returns Option<&V>
    match populations.get("Lahore") {
        Some(pop) => println!("Lahore: {} thousand people", pop),
        None => println!("City not found"),
    }

    // Overwriting: insert() on an existing key replaces the value
    populations.insert(String::from("Islamabad"), 1200);
    println!("Islamabad (updated): {:?}", populations.get("Islamabad"));

    // Remove a key; remove() returns the old value as Option<V>
    let removed = populations.remove("Karachi");
    println!("Removed Karachi: {:?}", removed);
    println!("Cities remaining: {}", populations.len());
}
```

### Example 2: Practical Application

A word-frequency counter, the classic `HashMap` use case, powered by the `entry` API:

```rust
use std::collections::HashMap;

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";

    let mut word_counts: HashMap<&str, u32> = HashMap::new();

    for word in text.split_whitespace() {
        // entry() returns the slot for this key;
        // or_insert(0) fills it with 0 if empty, then we add 1.
        let count = word_counts.entry(word).or_insert(0);
        *count += 1;
    }

    // HashMap iteration order is random, so sort for a stable report
    let mut report: Vec<(&str, u32)> = word_counts.into_iter().collect();
    report.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));

    println!("Word frequency report:");
    for (word, count) in report {
        println!("  {word:<6} -> {count}");
    }
}
```

::: details Output
Example 1:
```
Lahore: 13004 thousand people
Islamabad (updated): Some(1200)
Removed Karachi: Some(16840)
Cities remaining: 2
```

Example 2:
```
Word frequency report:
  the    -> 3
  fox    -> 2
  brown  -> 1
  dog    -> 1
  jumps  -> 1
  lazy   -> 1
  over   -> 1
  quick  -> 1
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `HashMap` must be imported: `use std::collections::HashMap;`, it is not in the prelude like `Vec`  
✅ `get()` returns `Option<&V>`, so missing keys are handled explicitly with `match` or `if let`, never a crash  
✅ `entry(key).or_insert(default)` is the idiomatic one-liner for "update or insert", perfect for counters  
✅ Iteration order is unspecified; sort into a `Vec` (or use `BTreeMap`) when you need deterministic order

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a moved key or value after `insert`.** `map.insert(name, score)` moves an owned `String` into the map, writing `println!("{}", name)` afterwards is a borrow-of-moved-value error. This does NOT compile. Insert a clone, or restructure so you don't need the original.
- **Indexing with `map["key"]` on a missing key.** Unlike `get()`, the index syntax panics at runtime when the key is absent. Prefer `get()` with `match`/`unwrap_or` unless you can guarantee the key exists.
- **Holding `get()`'s reference while inserting.** `let v = map.get("a"); map.insert("b", 2); println!("{:?}", v);` does NOT compile, the immutable borrow from `get` conflicts with the mutable borrow `insert` needs. Finish using the lookup result before mutating the map.
:::

## ✅ Quick Challenge

Run a lunch vote! Count each vote with the `entry` API, then find and print the dish with the most votes.

```rust
// Starter code
use std::collections::HashMap;

fn main() {
    let votes = vec!["pizza", "sushi", "pizza", "tacos", "pizza", "sushi"];

    let mut tally: HashMap<&str, u32> = HashMap::new();

    // TODO: count each vote using the entry API,
    // then print the winner (the dish with the most votes).

    println!("Votes cast: {}", votes.len());
    let _ = tally; // remove this line once you use `tally`
}
```

<details>
<summary>💡 Hint</summary>

Count with `*tally.entry(dish).or_insert(0) += 1;` inside a `for dish in &votes` loop. To find the winner, iterate the map with `tally.iter().max_by_key(|(_, count)| *count)`, it returns an `Option` you can unpack with `if let`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::collections::HashMap;

fn main() {
    let votes = vec!["pizza", "sushi", "pizza", "tacos", "pizza", "sushi"];

    let mut tally: HashMap<&str, u32> = HashMap::new();

    for dish in &votes {
        *tally.entry(dish).or_insert(0) += 1;
    }

    // max_by_key finds the entry with the highest count
    if let Some((dish, count)) = tally.iter().max_by_key(|(_, count)| *count) {
        println!("Winner: {dish} with {count} votes");
    }

    println!("Votes cast: {}", votes.len());
}
```

Output:
```
Winner: pizza with 3 votes
Votes cast: 6
```

</details>

## 📖 Additional Resources

- [The Rust Book - Storing Keys with Associated Values in Hash Maps](https://doc.rust-lang.org/book/ch08-03-hash-maps.html)
- [Rust by Example - HashMap](https://doc.rust-lang.org/rust-by-example/std/hash.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/day-43">← Day 43: Vectors</a>
  <a href="/week-07/day-45">Day 45: Iterators Basics →</a>
</div>
