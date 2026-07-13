---
title: "Day 45 - Iterators Basics"
description: "Learn about iterators basics in Rust"
---

# Day 45: Iterators Basics

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Understand what an iterator is in Rust, create one from a collection, and know when to use `iter()`, `iter_mut()`, and `into_iter()`, the foundation for the adapter methods coming on Day 46.

## 📚 The Concept (3 min)

An iterator is a value that produces a sequence of items, one at a time, on demand. Think of it like a Pez dispenser: the candy is stacked inside, and each press gives you exactly one piece, until it clicks empty. In Rust, that "press" is the `next()` method, which returns `Some(item)` while there are items left and `None` when the dispenser is empty.

Every iterator implements the `Iterator` trait, which requires just one method:

```rust
fn next(&mut self) -> Option<Self::Item>
```

That `Option` return type is the whole protocol. There is no separate "has more?" check like in some languages, the `None` case *is* the end signal. This is why iterators compose so cleanly with `match`, `if let`, and `while let`.

Crucially, Rust iterators are **lazy**. Creating one does no work at all; items are only produced when something pulls on the iterator, a `for` loop, a call to `next()`, or a consuming method like `sum()` or `count()`. In fact, `for x in collection` is just sugar: the compiler converts the collection into an iterator and calls `next()` in a loop until it sees `None`.

Collections give you three ways to get an iterator, and the difference is pure ownership, the same rules you learned in Week 3:

- `iter()`, borrows, yields `&T` (read-only references)
- `iter_mut()`, mutably borrows, yields `&mut T` (modify in place)
- `into_iter()`, takes ownership, yields `T` (the collection is consumed)

Despite feeling "high-level," iterators compile down to the same machine code as a hand-written loop, Rust calls this a zero-cost abstraction. You never pay a performance penalty for the nicer syntax.

::: tip Key Insight
An iterator is just a value with a `next()` method that returns `Some(item)` until it returns `None`, and nothing happens until something calls `next()`. Laziness plus that simple protocol is what makes iterators composable and free.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Driving an iterator manually with `next()`, then letting a `for` loop do the same job.

```rust
fn main() {
    let numbers = vec![10, 20, 30];

    // Create an iterator explicitly and pull values one at a time
    let mut iter = numbers.iter();

    println!("{:?}", iter.next()); // Some(10)
    println!("{:?}", iter.next()); // Some(20)
    println!("{:?}", iter.next()); // Some(30)
    println!("{:?}", iter.next()); // None -- the iterator is exhausted

    // A for loop does exactly this behind the scenes
    for n in numbers.iter() {
        println!("got {}", n);
    }
}
```

Note that `iter` must be `mut`, each call to `next()` advances the iterator's internal position, so calling it mutates state.

### Example 2: Practical Application

All three iterator flavors at work: summarizing sensor data, calibrating readings in place, and consuming a collection of owned values.

```rust
fn main() {
    let daily_temps = vec![21.5, 23.0, 19.8, 25.1, 22.4];

    // Consuming methods: they drive the iterator to the end
    let total: f64 = daily_temps.iter().sum();
    let average = total / daily_temps.len() as f64;
    let count = daily_temps.iter().count();

    println!("Readings: {}", count);
    println!("Average temp: {:.1}°C", average);

    // iter_mut() lets us modify values in place (sensor recalibration)
    let mut readings = vec![100, 102, 98];
    for r in readings.iter_mut() {
        *r += 5; // fix a sensor offset
    }
    println!("Calibrated: {:?}", readings);

    // into_iter() takes ownership -- the Vec is consumed
    let names = vec![String::from("Ada"), String::from("Grace")];
    for name in names.into_iter() {
        println!("Hello, {}!", name);
    }
    // `names` can no longer be used here -- it was moved
}
```

::: details Output
```
Some(10)
Some(20)
Some(30)
None
got 10
got 20
got 30
```
Example 2:
```
Readings: 5
Average temp: 22.4°C
Calibrated: [105, 107, 103]
Hello, Ada!
Hello, Grace!
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ An iterator produces items one at a time via `next()`, which returns `Some(item)` and finally `None`  
✅ Iterators are lazy, nothing runs until a `for` loop or a consuming method like `sum()` or `count()` pulls values  
✅ Pick by ownership: `iter()` for `&T`, `iter_mut()` for `&mut T`, `into_iter()` for owned `T`  
✅ Iterators are zero-cost, they compile to the same code as a manual loop, so there is no reason to avoid them

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a collection after `into_iter()`.** `into_iter()` moves the collection, so `for name in names.into_iter() { ... } println!("{:?}", names);` does NOT compile, `names` was consumed. Use `iter()` if you need the collection afterwards.
- **Forgetting `mut` on the iterator variable.** `let iter = v.iter(); iter.next();` does NOT compile, because `next()` takes `&mut self`. The binding must be `let mut iter = ...`.
- **Expecting values instead of references from `iter()`.** `v.iter()` yields `&i32`, not `i32`. Comparing with `if n == 3` fails to type-check inside the loop; either dereference (`*n == 3`) or pattern-match with `for &n in v.iter()`.
:::

## ✅ Quick Challenge

Given a vector of exam scores, use iterators (no manual indexing, no `for i in 0..len` loops) to find the **highest score** and the **total** of all scores, then print both. Handle the possibility that the vector could be empty when finding the maximum.

```rust
fn main() {
    let scores = vec![88, 92, 75, 99, 84];

    // 1. Use an iterator to find the highest score
    // 2. Use an iterator to compute the total of all scores
    // 3. Print both

    println!("Scores: {:?}", scores);
}
```

<details>
<summary>💡 Hint</summary>

Look at the consuming methods `max()` and `sum()` on `scores.iter()`. `max()` returns an `Option` (why?, the vector might be empty), so match on it. For `sum()`, you must annotate the result type: `let total: i32 = ...`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let scores = vec![88, 92, 75, 99, 84];

    // max() returns Option<&i32> because the Vec could be empty
    let highest = scores.iter().max();

    // sum() consumes the iterator and adds everything up
    let total: i32 = scores.iter().sum();

    match highest {
        Some(h) => println!("Highest score: {}", h),
        None => println!("No scores recorded"),
    }
    println!("Total: {}", total);
}
```

Output:

```
Highest score: 99
Total: 438
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 13.2: Processing a Series of Items with Iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html)
- [Rust by Example - Iterators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/day-44">← Day 44: Hash Maps</a>
  <a href="/week-07/day-46">Day 46: Iterator Adapters: map, filter →</a>
</div>
