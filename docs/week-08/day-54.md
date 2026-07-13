---
title: "Day 54 - Common Iterator Patterns"
description: "Learn about common iterator patterns in Rust"
---

# Day 54: Common Iterator Patterns

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Recognize and apply the handful of iterator patterns that cover 90% of real-world data processing: transform (`map`), select (`filter`), combine both (`filter_map`), reduce (`sum`, `fold`, `max_by`), and query (`any`, `all`).

## 📚 The Concept (3 min)

Over the last few days you learned what iterators are and how they perform. Today is about vocabulary: the recurring *shapes* that iterator chains take in real code. Once you can name these patterns, you stop writing manual `for` loops with mutable accumulator variables and start reading and writing idiomatic Rust at a glance.

Think of an iterator chain as an assembly line. Items enter one end, pass through a series of stations, and something useful comes out the other end. Each station is one of a small set of machine types:

- **Transformers** change each item into something else: `map` is the workhorse here.
- **Gates** let some items through and reject others: `filter` (and `take`/`skip` for positional gating).
- **Combo stations** do both at once: `filter_map` tries to transform an item and drops it if the transformation fails, perfect for parsing strings where some inputs are garbage.
- **Collectors** sit at the end of the line and produce the final product: `collect` builds a new collection, `sum`/`product`/`count` reduce to a number, `max_by`/`min_by` pick a winner, and `fold` handles any custom accumulation.
- **Inspectors** answer yes/no questions and can stop the line early: `any` and `all` short-circuit the moment the answer is known.

Two supporting players show up constantly: `enumerate` attaches an index `(i, item)` to each element, and `.iter()` vs `.into_iter()` decides whether the line processes references or owned values.

The crucial mental shift: a chain is *declarative*. You state what happens to each element; Rust figures out the loop. And as you saw on Day 53, this costs nothing at runtime.

::: tip Key Insight
Almost every data-processing task decomposes into the same pipeline: **source → filter → map → consume**. Learn to spot which stage each requirement belongs to, and the code writes itself.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The four foundational patterns on a plain list of numbers:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Pattern 1: map + collect — transform every element
    let squares: Vec<i32> = numbers.iter().map(|n| n * n).collect();
    println!("Squares: {:?}", squares);

    // Pattern 2: filter + collect — keep only matching elements
    let evens: Vec<&i32> = numbers.iter().filter(|n| *n % 2 == 0).collect();
    println!("Evens: {:?}", evens);

    // Pattern 3: chain them — filter first, then transform
    let doubled_odds: Vec<i32> = numbers
        .iter()
        .filter(|n| *n % 2 != 0)
        .map(|n| n * 2)
        .collect();
    println!("Doubled odds: {:?}", doubled_odds);

    // Pattern 4: reduce to a single value
    let sum: i32 = numbers.iter().sum();
    let product: i32 = numbers.iter().take(4).product();
    println!("Sum: {}, product of first 4: {}", sum, product);
}
```

### Example 2: Practical Application

The same patterns applied to structured data, the kind of code you write in real services every day:

```rust
struct Order {
    customer: String,
    total: f64,
    shipped: bool,
}

fn main() {
    let orders = vec![
        Order { customer: "Aisha".into(), total: 129.99, shipped: true },
        Order { customer: "Bilal".into(), total: 45.50, shipped: false },
        Order { customer: "Chen".into(), total: 210.00, shipped: true },
        Order { customer: "Dana".into(), total: 15.25, shipped: false },
    ];

    // filter_map: parse + filter in one pass
    let inputs = ["42", "oops", "7", "  ", "100"];
    let parsed: Vec<i32> = inputs
        .iter()
        .filter_map(|s| s.trim().parse().ok())
        .collect();
    println!("Parsed numbers: {:?}", parsed);

    // enumerate: index + value while listing pending orders
    for (i, order) in orders.iter().filter(|o| !o.shipped).enumerate() {
        println!("Pending #{}: {} (${:.2})", i + 1, order.customer, order.total);
    }

    // max_by + sum: find the biggest order and total revenue of shipped ones
    let biggest = orders
        .iter()
        .max_by(|a, b| a.total.partial_cmp(&b.total).unwrap())
        .unwrap();
    let shipped_revenue: f64 = orders.iter().filter(|o| o.shipped).map(|o| o.total).sum();
    println!("Biggest order: {} (${:.2})", biggest.customer, biggest.total);
    println!("Shipped revenue: ${:.2}", shipped_revenue);

    // any / all: quick yes-no questions about the data
    println!("Any order over $200? {}", orders.iter().any(|o| o.total > 200.0));
    println!("All orders shipped? {}", orders.iter().all(|o| o.shipped));
}
```

::: details Output
```
Parsed numbers: [42, 7, 100]
Pending #1: Bilal ($45.50)
Pending #2: Dana ($15.25)
Biggest order: Chen ($210.00)
Shipped revenue: $339.99
Any order over $200? true
All orders shipped? false
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `map` transforms, `filter` selects, and chaining them (filter first, then map) avoids transforming elements you will throw away  
✅ `filter_map(|s| s.parse().ok())` is the idiomatic way to parse a batch of inputs while silently skipping invalid ones  
✅ Consumers end the chain: `collect` builds a collection, `sum`/`count`/`max_by` reduce to one value, and `any`/`all` short-circuit early  
✅ `collect` needs a target type, annotate the variable (`let v: Vec<i32> = ...`) or use the turbofish (`.collect::<Vec<i32>>()`)

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the consumer.** Adapters like `map` and `filter` are lazy, `numbers.iter().map(|n| n * 2);` on its own does nothing and the compiler warns "unused `Map` that must be used". You must end the chain with `collect`, `sum`, `for_each`, or a `for` loop.
- **Reference-level confusion in closures.** `vec.iter().filter(|n| n % 2 == 0)` does NOT compile: `filter` hands the closure a `&&i32`, so you need `*n % 2 == 0`, `|&&n|` destructuring, or `**n`. `map` gives you one fewer layer than `filter`, this asymmetry trips everyone up at first.
- **Using `max`/`min` on floats.** `f64` doesn't implement `Ord` (because of NaN), so `.max()` won't compile on an iterator of floats. Reach for `max_by(|a, b| a.partial_cmp(b).unwrap())` or `fold(f64::MIN, f64::max)` instead.
:::

## ✅ Quick Challenge

You have a week of temperature readings in Celsius. Using a single iterator chain (no manual loops), keep only the above-freezing readings, convert them to Fahrenheit, and report the count and the hottest converted value.

```rust
// Starter code
fn main() {
    let temperatures = vec![18.5, 22.0, -3.2, 30.1, 25.7, -1.0, 19.9];

    // 1. Collect only the above-freezing temperatures (> 0.0) into a Vec
    // 2. Convert them to Fahrenheit: f = c * 9.0 / 5.0 + 32.0
    // 3. Print the count and the highest Fahrenheit value

    // Your code here
}
```

<details>
<summary>💡 Hint</summary>

Chain `.iter().filter(...).map(...).collect()`. In the filter closure, destructure with `|&&c|` to compare `c > 0.0` directly. For the hottest value, remember floats aren't `Ord`, `fold(f64::MIN, f64::max)` sidesteps that neatly.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let temperatures = vec![18.5, 22.0, -3.2, 30.1, 25.7, -1.0, 19.9];

    let fahrenheit: Vec<f64> = temperatures
        .iter()
        .filter(|&&c| c > 0.0)
        .map(|&c| c * 9.0 / 5.0 + 32.0)
        .collect();

    let hottest = fahrenheit
        .iter()
        .cloned()
        .fold(f64::MIN, f64::max);

    println!("{} above-freezing readings", fahrenheit.len());
    println!("Converted: {:?}", fahrenheit);
    println!("Hottest: {:.1}F", hottest);
}
```

Output:

```
5 above-freezing readings
Converted: [65.3, 71.6, 86.18, 78.25999999999999, 67.82]
Hottest: 86.2F
```

(Those long decimals are normal `f64` floating-point behavior, use `{:.1}` formatting when displaying.)

</details>

## 📖 Additional Resources

- [The Rust Book - Processing a Series of Items with Iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html)
- [Rust by Example - Iterators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)
- [std::iter::Iterator API docs](https://doc.rust-lang.org/std/iter/trait.Iterator.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/day-53">← Day 53: Iterator Performance</a>
  <a href="/week-08/day-55">Day 55: Project: Word Frequency Counter →</a>
</div>
