---
title: "Day 56 - Collection Performance Tips"
description: "Learn about collection performance tips in Rust"
---

# Day 56: Collection Performance Tips

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Learn practical techniques to make Rust collections fast: pre-allocating capacity, choosing the right collection for the access pattern, and avoiding hidden reallocation and cloning costs.

## 📚 The Concept (3 min)

Rust's collections are fast by default, but they can silently do far more work than necessary. The biggest offender is **reallocation**. A `Vec` starts empty; every time it runs out of capacity it allocates a bigger buffer (roughly doubling) and copies every element over. Push a million items into a fresh `Vec` and you trigger dozens of allocations plus repeated copying of the entire contents. If you know the size in advance, even approximately, `Vec::with_capacity(n)` does one allocation up front and every push after that is just a write. The same trick works for `String::with_capacity` and `HashMap::with_capacity`.

The second lever is **choosing the right structure for the access pattern**. `Vec` is unbeatable for iteration and push/pop at the end, but `remove(0)` shifts every remaining element, O(n) per call. If you need a queue (push back, pop front), `VecDeque` gives you O(1) at both ends. Membership testing is the same story: `vec.contains(&x)` scans linearly, while `HashSet::contains` is O(1) on average. A loop that calls `contains` on a `Vec` of 10,000 items is an accidental O(n²) algorithm.

Finally, watch for **hidden clones**. Building a `String` inside a loop with `format!` or `+` allocates each iteration; `push_str` onto one pre-sized `String` does not. These micro-decisions rarely matter for ten elements, but collections are exactly the code that ends up processing millions.

::: tip Key Insight
Most collection slowness comes from repeated allocation, not the operations themselves. If you can predict the size, tell the collection with `with_capacity`, capacity grows automatically anyway, so a good guess costs nothing and a right guess eliminates all reallocations.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Growing from empty: capacity jumps as the Vec reallocates
    let mut grown: Vec<i32> = Vec::new();
    let mut changes = 0;
    let mut last_cap = grown.capacity();
    for i in 0..1000 {
        grown.push(i);
        if grown.capacity() != last_cap {
            changes += 1;
            last_cap = grown.capacity();
        }
    }
    println!("Vec::new():           {} reallocations, final capacity {}", changes, grown.capacity());

    // Pre-allocated: zero reallocations
    let mut sized: Vec<i32> = Vec::with_capacity(1000);
    let start_cap = sized.capacity();
    for i in 0..1000 {
        sized.push(i);
    }
    println!("with_capacity(1000):  capacity {} -> {} (unchanged)", start_cap, sized.capacity());
}
```

### Example 2: Practical Application

```rust
use std::collections::{HashSet, VecDeque};
use std::time::Instant;

fn main() {
    let items: Vec<u32> = (0..20_000).collect();

    // Membership: Vec::contains is O(n), HashSet::contains is O(1)
    let set: HashSet<u32> = items.iter().copied().collect();

    let t = Instant::now();
    let mut hits = 0;
    for x in 0..20_000u32 {
        if items.contains(&x) { hits += 1; }
    }
    println!("Vec lookups:     {} hits in {:?}", hits, t.elapsed());

    let t = Instant::now();
    let mut hits = 0;
    for x in 0..20_000u32 {
        if set.contains(&x) { hits += 1; }
    }
    println!("HashSet lookups: {} hits in {:?}", hits, t.elapsed());

    // Queue behavior: VecDeque pops from the front in O(1)
    let mut queue: VecDeque<u32> = (0..5).collect();
    queue.push_back(99);
    println!("front: {:?}, back: {:?}", queue.pop_front(), queue.pop_back());
}
```

::: details Output
Example 1:
```
Vec::new():           11 reallocations, final capacity 1024
with_capacity(1000):  capacity 1000 -> 1000 (unchanged)
```
Example 2 (timings vary by machine; the ratio is what matters):
```
Vec lookups:     20000 hits in 61.72ms
HashSet lookups: 20000 hits in 245.9µs
front: Some(0), back: Some(99)
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Vec::with_capacity(n)` eliminates reallocation-and-copy cycles when the size is predictable  
✅ Match the collection to the access pattern: `Vec` for iteration, `VecDeque` for queues, `HashSet`/`HashMap` for lookups  
✅ `Vec::contains` in a loop is O(n²) in disguise, switch to a `HashSet` for repeated membership tests  
✅ `Vec::remove(0)` shifts all elements; use `VecDeque::pop_front` (or `swap_remove` if order doesn't matter)

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Benchmarking in debug mode, `cargo run --release` can be 10-100x faster and changes which optimization matters
- Assuming `with_capacity(n)` sets the length, the Vec is still empty (`len() == 0`); indexing before pushing panics
- Reaching for `HashMap` when keys are small dense integers, a `Vec` indexed by the key is both simpler and faster
:::

## ✅ Quick Challenge

Write `dedup_preserve_order(input: &[i32]) -> Vec<i32>` that removes duplicates while keeping first-occurrence order, in O(n), no nested loops, no `contains` on a `Vec`.

```rust
fn dedup_preserve_order(input: &[i32]) -> Vec<i32> {
    // Your code here: O(n), keep the first occurrence of each value
    input.to_vec()
}

fn main() {
    let data = [3, 1, 3, 7, 1, 9, 7, 3];
    println!("{:?}", dedup_preserve_order(&data));
}
```

<details>
<summary>💡 Hint</summary>

Keep a `HashSet<i32>` of values you've already seen. `HashSet::insert` returns `true` only if the value was new, use that as your filter condition.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::collections::HashSet;

fn dedup_preserve_order(input: &[i32]) -> Vec<i32> {
    let mut seen = HashSet::with_capacity(input.len());
    let mut out = Vec::with_capacity(input.len());
    for &x in input {
        if seen.insert(x) {
            out.push(x);
        }
    }
    out
}

fn main() {
    let data = [3, 1, 3, 7, 1, 9, 7, 3];
    println!("{:?}", dedup_preserve_order(&data)); // [3, 1, 7, 9]
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Common Collections](https://doc.rust-lang.org/book/ch08-00-common-collections.html)
- [std::collections - When Should You Use Which Collection?](https://doc.rust-lang.org/std/collections/index.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/day-55">← Day 55: Project: Word Frequency Counter</a>
  <a href="/week-09/">Week 9 Overview →</a>
</div>
