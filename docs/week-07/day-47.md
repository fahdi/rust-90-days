---
title: "Day 47 - Consuming Adapters"
description: "Learn about consuming adapters in Rust"
---

# Day 47: Consuming Adapters

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Understand consuming adapters, iterator methods like `sum`, `collect`, `count`, and `fold` that take ownership of an iterator and drive it to completion, producing a final value.

## 📚 The Concept (3 min)

Yesterday you chained `map` and `filter` and maybe noticed something odd: nothing happened. Iterators in Rust are **lazy**, building a chain of adapters does zero work until something actually pulls values through it. That "something" is a *consuming adapter*.

A consuming adapter is any iterator method that calls `next()` internally until the iterator is exhausted, using up the iterator in the process. Because it takes `self` by value, the iterator is moved into the method and can't be used afterward. The most common ones:

- `sum()` / `product()`, reduce numeric items to one number
- `count()`, how many items the iterator yields
- `collect()`, gather items into a collection like `Vec<T>`, `String`, or `HashMap<K, V>`
- `fold(init, f)`, the general-purpose reducer everything else could be built from
- `max()`, `min()`, `last()`, `for_each()`, other finishers

Think of an iterator pipeline as a factory line: adapters like `map` and `filter` are stations that transform parts, but the conveyor belt only moves when a consumer at the end demands output. `collect` is the worker boxing everything up; `sum` is the accountant tallying totals.

One practical wrinkle: `collect` and `sum` are generic over their output, so the compiler often needs a type annotation, `let v: Vec<i32> = ...` or `.sum::<i32>()` (the "turbofish" syntax).

::: tip Key Insight
Adapters build the recipe; consumers cook the meal. Until you call a consuming adapter, an iterator chain is just a description of work, no loop runs, no memory is allocated, nothing iterates.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let scores = vec![85, 92, 78, 95, 88];

    // sum() consumes the iterator and produces one value
    let total: i32 = scores.iter().sum();

    // count() consumes another fresh iterator
    let passing = scores.iter().filter(|&&s| s >= 85).count();

    // max() returns Option<&i32> because the iterator could be empty
    let best = scores.iter().max();

    println!("Total: {}", total);
    println!("Scores >= 85: {}", passing);
    println!("Best score: {:?}", best);
}
```

### Example 2: Practical Application

```rust
fn main() {
    let words = vec!["rust", "is", "fun"];

    // collect() into a Vec after transforming
    let upper: Vec<String> = words.iter().map(|w| w.to_uppercase()).collect();
    println!("Uppercased: {:?}", upper);

    // collect() the same items into a single String
    let sentence: String = words.join(" ");
    println!("Sentence: {}", sentence);

    // fold(): the universal consumer. Count total characters.
    let char_count = words.iter().fold(0, |acc, w| acc + w.len());
    println!("Total chars: {}", char_count);

    // A consumed iterator is gone; this would NOT compile:
    // let it = words.iter();
    // let n = it.count();
    // let m = it.count(); // error: use of moved value `it`
}
```

::: details Output
```
Total: 438
Scores >= 85: 4
Best score: Some(95)
Uppercased: ["RUST", "IS", "FUN"]
Sentence: rust is fun
Total chars: 9
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Consuming adapters (`sum`, `count`, `collect`, `fold`, `max`) call `next()` until the iterator is exhausted  
✅ They take `self` by value, so the iterator cannot be reused afterward, create a fresh one if needed  
✅ Nothing in a `map`/`filter` chain executes until a consuming adapter pulls values through it  
✅ `collect` and `sum` need a type annotation or turbofish (`.sum::<i32>()`) because their output type is generic

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Writing `let total = v.iter().sum();` without a type annotation, the compiler can't infer the sum's type and errors with "type annotations needed"
- Trying to use an iterator after consuming it (e.g., calling `.count()` then `.sum()` on the same binding), it was moved; borrow-checker error
- Ending a chain with `.map(...)` and expecting side effects to run, lazy adapters do nothing without a consumer (the compiler even warns: "iterators are lazy and do nothing unless consumed")
:::

## ✅ Quick Challenge

Given a list of prices, compute the total cost of only the items under 50, and collect the qualifying prices into a new `Vec`.

```rust
fn main() {
    let prices = vec![12, 99, 34, 50, 7, 61];
    // 1. Collect prices under 50 into a Vec<i32>
    // 2. Sum them into a total
    // 3. Print both
}
```

<details>
<summary>💡 Hint</summary>

Use `.iter().filter(|&&p| p < 50)` twice (or collect first, then sum the collected Vec). Remember `sum` needs a type: `let total: i32 = ...`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let prices = vec![12, 99, 34, 50, 7, 61];

    let cheap: Vec<i32> = prices.iter().filter(|&&p| p < 50).copied().collect();
    let total: i32 = cheap.iter().sum();

    println!("Cheap items: {:?}", cheap); // [12, 34, 7]
    println!("Total: {}", total);         // 53
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Processing a Series of Items with Iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html)
- [Rust by Example - Iterators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/day-46">← Day 46: Iterator Adapters: map, filter</a>
  <a href="/week-07/day-48">Day 48: Custom Iterators →</a>
</div>
