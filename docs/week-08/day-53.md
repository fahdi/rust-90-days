---
title: "Day 53 - Iterator Performance"
description: "Learn about iterator performance in Rust"
---

# Day 53: Iterator Performance

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Understand why Rust's iterators are a *zero-cost abstraction*, and confidently write iterator chains knowing they compile to code as fast as (often faster than) hand-written loops.

## 📚 The Concept (3 min)

Coming from Python or JavaScript, you might assume that a chain like `.filter().map().sum()` is slow, in those languages, each step often builds an intermediate collection or pays function-call overhead per element. Rust is different: iterators are one of its flagship **zero-cost abstractions**. The compiler aggressively inlines every closure in the chain and fuses the whole pipeline into a single loop. In the classic benchmark from *The Rust Book* (Chapter 13), the iterator version of a search function actually ran slightly *faster* than the manual loop version.

Two properties make this work:

**1. Laziness.** Adapters like `map` and `filter` do nothing when you call them, they just build a description of the work. Computation only happens when a *consumer* (`sum`, `collect`, `find`, a `for` loop) starts pulling values. Think of it like an assembly line blueprint: attaching a new station costs nothing; items only move when someone at the end pulls the lever. Laziness also enables short-circuiting, `find` or `take(5)` stop the entire pipeline early, so upstream closures never run on unneeded elements.

**2. No bounds checks.** A hand-written `for i in 0..v.len() { v[i] }` loop forces the compiler to prove (or check at runtime) that every index is in bounds. Iterators access elements sequentially through a trusted interface, so bounds checks disappear entirely. This is why iterator code frequently *beats* index-based loops.

The one real performance trap is allocating when you don't need to: calling `.collect()` between every step creates intermediate `Vec`s, throwing away the fusion advantage. Keep the chain unbroken until the final consumer.

::: tip Key Insight
Iterator adapters are lazy blueprints, not loops. The compiler fuses the entire chain into one tight loop with no per-step overhead and no bounds checks, abstraction you don't pay for at runtime.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The index-based loop and the iterator produce identical results, and after optimization, essentially identical machine code. The iterator version is shorter *and* skips bounds checks.

```rust
fn main() {
    let prices = vec![12, 45, 23, 8, 67, 34];

    // Index-based loop (C-style)
    let mut total_loop = 0;
    for i in 0..prices.len() {
        total_loop += prices[i];
    }

    // Iterator version — compiles to the same machine code
    let total_iter: i32 = prices.iter().sum();

    println!("Loop total:     {}", total_loop);
    println!("Iterator total: {}", total_iter);
    assert_eq!(total_loop, total_iter);
    println!("Identical results, identical machine code.");
}
```

### Example 2: Practical Application

Laziness in action: we build a pipeline over one **million** numbers, but because `find` short-circuits, the `map` closure runs only 224 times. We count the calls to prove it.

```rust
fn main() {
    let numbers: Vec<i64> = (1..=1_000_000).collect();
    let mut calls = 0u32;

    // Lazy pipeline: no work happens until `find` starts pulling values
    let first_big = numbers
        .iter()
        .map(|&n| {
            calls += 1;
            n * n
        })
        .find(|&sq| sq > 50_000);

    println!("First square over 50,000: {:?}", first_big);
    println!("Closure ran only {} times (not 1,000,000)", calls);
}
```

::: details Output
```
Loop total:     189
Iterator total: 189
Identical results, identical machine code.
First square over 50,000: Some(50176)
Closure ran only 224 times (not 1,000,000)
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Iterators are a zero-cost abstraction, chains like `.filter().map().sum()` compile to one fused loop with no per-element overhead  
✅ Adapters (`map`, `filter`) are lazy; nothing executes until a consumer (`sum`, `collect`, `find`, `for`) pulls values  
✅ Iterator access skips the bounds checks that index-based loops pay, so iterators often *beat* manual indexing  
✅ Avoid `.collect()` between steps, intermediate `Vec` allocations are the real cost, not the iterator machinery

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Calling adapters without a consumer.** `v.iter().map(|x| println!("{}", x));` prints nothing, `map` is lazy, so the closure never runs. The compiler even warns: "iterators are lazy and do nothing unless consumed." Finish with `for`, `.for_each()`, `.sum()`, or `.collect()`.
- **Collecting between every step.** Writing `let evens: Vec<i32> = v.iter().filter(...).cloned().collect();` and then iterating `evens` again allocates a whole intermediate vector. Keep one unbroken chain from source to final consumer.
- **Dropping back to `for i in 0..v.len()` "for speed."** This is usually *slower*: every `v[i]` may incur a bounds check, and the compiler has a harder time vectorizing. Trust the iterator.
:::

## ✅ Quick Challenge

Rewrite this index-based loop as a single iterator chain using `.iter()`, `.filter()`, `.map()`, and `.sum()`. It computes the sum of the squares of the even numbers.

```rust
fn main() {
    let data = [3, 7, 4, 10, 5, 8];

    // TODO: rewrite this loop as a single iterator chain
    // using .iter(), .filter(), .map(), and .sum()
    let mut result = 0;
    for i in 0..data.len() {
        if data[i] % 2 == 0 {
            result += data[i] * data[i];
        }
    }
    println!("Sum of even squares: {}", result);
}
```

<details>
<summary>💡 Hint</summary>

Filter first, then map. `.iter()` on an array of `i32` yields `&i32` references, so the `filter` closure receives `&&i32`, use a `|&&n|` pattern (or dereference with `*`) to get the plain value. Annotate the result: `let result: i32 = ...`, since `sum` needs to know its output type.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let data = [3, 7, 4, 10, 5, 8];

    let result: i32 = data
        .iter()
        .filter(|&&n| n % 2 == 0)
        .map(|&n| n * n)
        .sum();

    println!("Sum of even squares: {}", result);
}
```

Output: `Sum of even squares: 180` (4² + 10² + 8² = 16 + 100 + 64). One fused loop, no intermediate allocations.

</details>

## 📖 Additional Resources

- [The Rust Book - Comparing Performance: Loops vs. Iterators](https://doc.rust-lang.org/book/ch13-04-performance.html)
- [Rust by Example - Iterators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/day-52">← Day 52: Fn, FnMut, FnOnce Traits</a>
  <a href="/week-08/day-54">Day 54: Common Iterator Patterns →</a>
</div>
