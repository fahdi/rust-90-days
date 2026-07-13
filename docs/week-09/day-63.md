---
title: "Day 63 - Multiple Trait Bounds"
description: "Learn about multiple trait bounds in Rust"
---

# Day 63: Multiple Trait Bounds

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Combine several trait bounds with `+` and organize complex signatures with `where` clauses, so generic code can require exactly the set of capabilities it needs.

## 📚 The Concept (3 min)

Real generic functions rarely need just one capability. Consider a caching helper: it must *clone* the value to store it, *hash* the key to index it, and *debug-print* both when logging. One bound is not enough, you need a set.

The `+` syntax composes bounds: `fn log_and_store<T: Clone + Debug>(item: T)` accepts any type that implements *both* `Clone` and `Debug`. This is an AND, not an OR, the type must satisfy every listed trait. The same syntax works in `impl Trait` position (`item: &(impl Summary + Display)`) and in `impl` blocks (`impl<T: Display + PartialOrd> Pair<T>`).

Once you have multiple generic parameters each with multiple bounds, inline syntax turns into soup: `fn f<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32`. The `where` clause moves constraints after the signature, keeping the parameter list clean:

```rust
fn f<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
```

Both forms compile identically; `where` is purely readability, and it is the idiomatic choice as soon as you have more than one bound per parameter. `where` can also express bounds inline syntax cannot, like constraints on non-parameter types (`where Option<T>: Debug`).

A related concept you will meet in the wild: **supertraits**. `trait Loggable: Debug + Display` means "to implement `Loggable`, a type must already implement `Debug` and `Display`", bundling a common bound-set under one name so users write `T: Loggable` instead of repeating three traits everywhere.

::: tip Key Insight
Bounds are a budget: each `+ Trait` you demand shrinks the set of types callers can pass. Require exactly what the body uses, no more. If you never clone, don't ask for `Clone`; overly greedy bounds are the generic-code equivalent of over-broad function parameters.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Combining two bounds with `+`:

```rust
use std::fmt::Debug;

fn duplicate_and_show<T: Clone + Debug>(item: &T) -> (T, T) {
    let pair = (item.clone(), item.clone());
    println!("duplicated: {:?}", pair);
    pair
}

fn main() {
    let (a, b) = duplicate_and_show(&42);
    println!("a = {}, b = {}", a, b);

    let (s1, s2) = duplicate_and_show(&String::from("rust"));
    println!("s1 = {}, s2 = {}", s1, s2);
}
```

### Example 2: Practical Application

A `where` clause taming two parameters with different bound sets:

```rust
use std::fmt::{Debug, Display};

fn report<T, U>(label: &T, values: &[U]) -> usize
where
    T: Display,
    U: Debug + PartialOrd,
{
    println!("=== {} ===", label);
    let mut count = 0;
    for pair in values.windows(2) {
        if pair[1] > pair[0] {
            count += 1;
        }
    }
    println!("data: {:?}", values);
    println!("increases: {}", count);
    count
}

fn main() {
    report(&"temperatures", &[18.5, 19.0, 18.2, 21.4]);
    report(&"scores", &[10, 20, 15, 30, 40]);
}
```

::: details Output
Example 1:
```
duplicated: (42, 42)
a = 42, b = 42
duplicated: ("rust", "rust")
s1 = rust, s2 = rust
```

Example 2:
```
=== temperatures ===
data: [18.5, 19.0, 18.2, 21.4]
increases: 2
=== scores ===
data: [10, 20, 15, 30, 40]
increases: 3
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `T: TraitA + TraitB` requires the type to implement every listed trait, it is a conjunction, never an alternative  
✅ `where` clauses express the same bounds after the signature and are idiomatic once bounds get long  
✅ Supertraits (`trait Loggable: Debug + Display`) bundle a bound-set under one reusable name  
✅ Keep bounds minimal: demand only the capabilities the function body actually uses

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Reading `+` as "either/or", a caller whose type implements `Clone` but not `Debug` fails `T: Clone + Debug`; there is no OR for bounds
- Writing `where` before the return type (`fn f<T>(t: T) where T: Debug -> i32`), the `where` clause goes *after* `-> i32`, before the body
- Accumulating stale bounds as code evolves, after refactoring away the last `clone()`, remove `Clone` from the bounds or you needlessly reject valid caller types
:::

## ✅ Quick Challenge

Write `fn max_by_label<T>(items: &[(T, &str)]) -> &str` that returns the label of the tuple with the largest `T` value, then prints each candidate while scanning. Decide which bounds `T` needs and express them in a `where` clause.

```rust
// Starter code
fn main() {
    let data = [(3, "bronze"), (9, "gold"), (7, "silver")];
    // Call max_by_label(&data) once you've written it.
    println!("{:?}", data);
}
```

<details>
<summary>💡 Hint</summary>

Scanning needs comparison (`PartialOrd`) and printing candidates needs `Display` (or `Debug`). Track the index of the best element so far rather than moving values.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::fmt::Display;

fn max_by_label<'a, T>(items: &'a [(T, &'a str)]) -> &'a str
where
    T: PartialOrd + Display,
{
    let mut best = 0;
    for (i, (value, label)) in items.iter().enumerate() {
        println!("candidate: {} ({})", value, label);
        if *value > items[best].0 {
            best = i;
        }
    }
    items[best].1
}

fn main() {
    let data = [(3, "bronze"), (9, "gold"), (7, "silver")];
    println!("winner: {}", max_by_label(&data));
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Multiple Trait Bounds & where Clauses](https://doc.rust-lang.org/book/ch10-02-traits.html#specifying-multiple-trait-bounds-with-the--syntax)
- [Rust by Example - Multiple Bounds](https://doc.rust-lang.org/rust-by-example/generics/multi_bounds.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/day-62">← Day 62: Trait Bounds</a>
  <a href="/week-10/">Week 10 Overview →</a>
</div>
