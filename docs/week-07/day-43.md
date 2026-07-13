---
title: "Day 43 - Vectors"
description: "Learn about vectors in Rust"
---

# Day 43: Vectors

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Build, grow, and transform `Vec<T>` collections confidently, including safe access with `get`, in-place mutation, and combining vectors with iterator methods like `retain`, `filter`, and `sort_by_key`.

## 📚 The Concept (3 min)

Arrays in Rust have a fixed size baked into their type, `[i32; 5]` will always hold exactly five elements. That's great for performance, but real programs rarely know their data size at compile time. How many lines are in the file the user opens? How many tasks are on the todo list? For that, Rust gives you `Vec<T>`: a growable list that lives on the heap.

Think of a vector as a parking garage that expands. It reserves a block of contiguous spots (its *capacity*). When you `push` a new element and the garage is full, the vector allocates a bigger block, usually double the size, and moves everything over. This is why `len()` (how many elements you have) and `capacity()` (how many fit before the next reallocation) are different numbers.

Because a vector owns its elements and stores them contiguously in memory, you get three things:

1. **Fast indexed access**, `v[i]` is a constant-time pointer offset.
2. **Cache-friendly iteration**, elements sit next to each other, so loops are fast.
3. **Automatic cleanup**, when the vector goes out of scope, it drops all of its elements. No manual memory management.

The borrow checker still applies, and this is where vectors teach you real Rust. You can iterate over `&v` (shared borrows), `&mut v` (exclusive borrows that let you modify elements in place), or `v` itself (consuming the vector). And you can't hold a reference to an element while also pushing, a push might reallocate and move everything, which would leave your reference dangling. Rust catches that at compile time.

There are two ways to access elements: `v[i]` panics if the index is out of bounds, while `v.get(i)` returns an `Option` so you can handle the miss gracefully. Use indexing when a bad index is a bug; use `get` when it's a normal possibility.

::: tip Key Insight
A `Vec<T>` is a heap-allocated, growable, *owning* collection. Indexing with `v[i]` panics on out-of-bounds; `v.get(i)` returns an `Option`, pick based on whether a missing index is a bug or an expected case.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Create a vector with the vec! macro
    let mut scores: Vec<i32> = vec![85, 92, 78];

    // Grow it at runtime
    scores.push(95);
    scores.push(60);

    // Safe access with .get() returns an Option
    match scores.get(2) {
        Some(value) => println!("Third score: {}", value),
        None => println!("No third score"),
    }

    // Iterate over references (no ownership taken)
    for score in &scores {
        println!("Score: {}", score);
    }

    // Iterate mutably to modify in place
    for score in &mut scores {
        *score += 5; // 5-point curve
    }

    println!("After the curve: {:?}", scores);
    println!("Length: {}, Capacity: {}", scores.len(), scores.capacity());
}
```

### Example 2: Practical Application

A todo list manager, vectors of structs are the backbone of most Rust programs:

```rust
#[derive(Debug)]
struct Task {
    name: String,
    priority: u8,
    done: bool,
}

fn main() {
    let mut tasks: Vec<Task> = Vec::new();

    tasks.push(Task { name: String::from("Write report"), priority: 2, done: false });
    tasks.push(Task { name: String::from("Fix login bug"), priority: 1, done: false });
    tasks.push(Task { name: String::from("Update docs"), priority: 3, done: true });
    tasks.push(Task { name: String::from("Review PR"), priority: 1, done: false });

    // Remove completed tasks in place
    tasks.retain(|task| !task.done);

    // Sort by priority (1 = most urgent)
    tasks.sort_by_key(|task| task.priority);

    println!("Todo list ({} tasks remaining):", tasks.len());
    for (i, task) in tasks.iter().enumerate() {
        println!("  {}. [P{}] {}", i + 1, task.priority, task.name);
    }

    // Vectors work seamlessly with iterators
    let urgent_count = tasks.iter().filter(|t| t.priority == 1).count();
    println!("Urgent tasks: {}", urgent_count);
}
```

::: details Output
Example 1:
```
Third score: 78
Score: 85
Score: 92
Score: 78
Score: 95
Score: 60
After the curve: [90, 97, 83, 100, 65]
Length: 5, Capacity: 6
```
(The capacity value can vary, it depends on the allocator's growth strategy.)

Example 2:
```
Todo list (3 tasks remaining):
  1. [P1] Fix login bug
  2. [P1] Review PR
  3. [P2] Write report
Urgent tasks: 2
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Vec<T>` is a heap-allocated, growable list, use `vec![...]` or `Vec::new()` plus `push` to build one  
✅ `v[i]` panics on a bad index; `v.get(i)` returns `Option<&T>` for safe access  
✅ Iterate with `&v` to read, `&mut v` to modify in place (dereference with `*`), or `v` to consume  
✅ Methods like `retain`, `sort_by_key`, and iterator adapters (`filter`, `map`, `collect`) do most real-world list work for you

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Holding a reference across a `push`.** Code like `let first = &v[0]; v.push(6);`, this does NOT compile. A push may reallocate and move every element, so the borrow checker rejects any live reference during the mutation. Finish using the reference (or copy the value out) before growing the vector.
- **Indexing without checking bounds.** `let x = v[10];` on a 5-element vector compiles fine but panics at runtime. Reach for `v.get(10)` and match on the `Option` whenever the index comes from user input or a calculation.
- **Trying to keep ownership after a consuming loop.** `for item in v { ... }` moves the vector; using `v` afterwards does NOT compile. If you need the vector later, iterate over `&v` instead.
:::

## ✅ Quick Challenge

You have a week of temperature readings. Find the highest temperature, compute the average, and collect all above-average readings into a new vector.

```rust
fn main() {
    let temperatures = vec![18.5, 22.0, 19.8, 25.3, 21.1, 17.9, 23.4];

    // TODO 1: Find the highest temperature
    // TODO 2: Compute the average temperature
    // TODO 3: Collect only the temperatures above the average into a new vector

    println!("Temperatures: {:?}", temperatures);
}
```

<details>
<summary>💡 Hint</summary>

`f64` doesn't implement `Ord` (because of NaN), so `iter().max()` won't work directly, use `fold` to track the maximum yourself. For the average, `iter().sum::<f64>()` divided by `temperatures.len() as f64` does the job. For the last part, chain `.iter().filter(...).copied().collect()`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let temperatures = vec![18.5, 22.0, 19.8, 25.3, 21.1, 17.9, 23.4];

    // 1. Highest temperature (f64 doesn't implement Ord, so use fold)
    let highest = temperatures
        .iter()
        .fold(f64::MIN, |max, &t| if t > max { t } else { max });

    // 2. Average
    let sum: f64 = temperatures.iter().sum();
    let average = sum / temperatures.len() as f64;

    // 3. Above-average temperatures
    let above_average: Vec<f64> = temperatures
        .iter()
        .filter(|&&t| t > average)
        .copied()
        .collect();

    println!("Highest: {}", highest);
    println!("Average: {:.2}", average);
    println!("Above average: {:?}", above_average);
}
```

Output:
```
Highest: 25.3
Average: 21.14
Above average: [22.0, 25.3, 23.4]
```

</details>

## 📖 Additional Resources

- [The Rust Book - Storing Lists of Values with Vectors](https://doc.rust-lang.org/book/ch08-01-vectors.html)
- [Rust by Example - Vectors](https://doc.rust-lang.org/rust-by-example/std/vec.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/">← Week 7 Overview</a>
  <a href="/week-07/day-44">Day 44: Hash Maps →</a>
</div>
