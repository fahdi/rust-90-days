---
title: "Day 46 - Iterator Adapters: map, filter"
description: "Learn about iterator adapters: map, filter in Rust"
---

# Day 46: Iterator Adapters: map, filter

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Transform and select data declaratively by chaining the two most important iterator adapters, `map` and `filter`, and collecting the results into a new collection.

## 📚 The Concept (3 min)

Yesterday you learned that an iterator produces a sequence of items. Today you learn how to *reshape* that sequence without writing a single loop. An **iterator adapter** is a method that takes one iterator and returns a *new* iterator with modified behavior. The two workhorses are:

- **`map`**, takes a closure and applies it to every item, producing a transformed item. One in, one out: `[1, 2, 3]` mapped with `|n| n * 2` yields `[2, 4, 6]`.
- **`filter`**, takes a closure returning `bool` and keeps only the items for which it returns `true`. `[1, 2, 3, 4]` filtered with `|n| n % 2 == 0` yields `[2, 4]`.

Think of an assembly line in a factory. Items ride along a conveyor belt. `map` is a station that modifies each item as it passes (paints it, stamps it), while `filter` is a quality inspector who tosses rejects off the belt. You can bolt as many stations onto the belt as you like, `filter(...).map(...).filter(...)`, and each item flows through the whole pipeline one at a time.

The crucial detail: adapters are **lazy**. Calling `.map(...)` does not run your closure, it merely builds a bigger iterator that *describes* the work. Nothing happens until a *consuming* method like `collect()`, `sum()`, or a `for` loop pulls items through the pipeline. That's why the compiler warns "iterators are lazy and do nothing unless consumed" if you write `v.iter().map(|x| x + 1);` on its own line and never use the result.

A closure signature note: `v.iter()` yields references (`&i32`), so inside `filter`, which itself passes its item by reference, you often see patterns like `|&&n| n % 2 == 0` or `|n| **n % 2 == 0` to reach the actual value.

::: tip Key Insight
Adapters (`map`, `filter`) are lazy, they build a pipeline but do zero work until a consumer like `collect()` pulls items through it. Chain adapters to describe *what* you want; let the consumer decide *when* it runs.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // map: transform every element
    let doubled: Vec<i32> = numbers.iter().map(|n| n * 2).collect();
    println!("Doubled: {:?}", doubled);

    // filter: keep only elements matching a condition
    let evens: Vec<i32> = numbers.iter().filter(|&&n| n % 2 == 0).cloned().collect();
    println!("Evens:   {:?}", evens);

    // chain them: filter first, then map
    let even_squares: Vec<i32> = numbers
        .iter()
        .filter(|&&n| n % 2 == 0)
        .map(|n| n * n)
        .collect();
    println!("Even squares: {:?}", even_squares);
}
```

### Example 2: Practical Application

```rust
struct Employee {
    name: String,
    department: String,
    salary: u32,
}

fn main() {
    let employees = vec![
        Employee { name: String::from("Aisha"),  department: String::from("Engineering"), salary: 95_000 },
        Employee { name: String::from("Bilal"),  department: String::from("Sales"),       salary: 60_000 },
        Employee { name: String::from("Chen"),   department: String::from("Engineering"), salary: 105_000 },
        Employee { name: String::from("Dana"),   department: String::from("Marketing"),   salary: 70_000 },
        Employee { name: String::from("Elena"),  department: String::from("Engineering"), salary: 88_000 },
    ];

    // Build a report: names of engineers earning 90k or more
    let senior_engineers: Vec<String> = employees
        .iter()
        .filter(|e| e.department == "Engineering")
        .filter(|e| e.salary >= 90_000)
        .map(|e| format!("{} (${})", e.name, e.salary))
        .collect();

    println!("Senior engineers:");
    for line in &senior_engineers {
        println!("  - {}", line);
    }

    // Total payroll for Engineering, using the same pattern
    let eng_payroll: u32 = employees
        .iter()
        .filter(|e| e.department == "Engineering")
        .map(|e| e.salary)
        .sum();
    println!("Engineering payroll: ${}", eng_payroll);
}
```

::: details Output
```
Example 1:
Doubled: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
Evens:   [2, 4, 6, 8, 10]
Even squares: [4, 16, 36, 64, 100]

Example 2:
Senior engineers:
  - Aisha ($95000)
  - Chen ($105000)
Engineering payroll: $288000
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `map(|item| ...)` transforms each item one-to-one; `filter(|item| ...)` keeps only items whose closure returns `true`  
✅ Adapters are lazy, no closure runs until a consumer (`collect`, `sum`, `for` loop) pulls items through  
✅ Adapters chain: `filter(...).map(...)` builds a pipeline that processes each item in a single pass, with no intermediate Vec  
✅ `collect()` usually needs a type annotation (e.g. `let v: Vec<i32> = ...`) so Rust knows which collection to build

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting to consume the iterator.** `numbers.iter().map(|n| n * 2);` compiles but does *nothing*, no consumer means no work. Rust even warns: "unused `Map` that must be used". Add `.collect()`, `.sum()`, or loop over it.
- **Reference-level confusion in `filter`.** With `v.iter()`, `filter`'s closure receives `&&i32` (a reference to the reference `iter` yields). Writing `|n| n % 2 == 0` fails to compile with a type mismatch; destructure with `|&&n|` or dereference with `**n`.
- **Missing type annotation on `collect()`.** `let v = nums.iter().map(|n| n * 2).collect();`, this does NOT compile ("type annotations needed") because `collect` can build a Vec, HashSet, String, and more. Annotate the binding (`let v: Vec<i32>`) or use the turbofish: `.collect::<Vec<i32>>()`.
:::

## ✅ Quick Challenge

Given a list of fruit names, build a pipeline that keeps only the words longer than 4 characters, converts them to uppercase, and collects them into a `Vec` of `String`. Expected output: `["APPLE", "BANANA", "CHERRY"]`.

```rust
// Starter code
fn main() {
    let words = vec!["apple", "fig", "banana", "kiwi", "cherry", "plum"];

    // TODO: keep only words longer than 4 characters,
    // uppercase them, and collect into a Vec<String>.
    let result: Vec<String> = Vec::new();

    println!("{:?}", result);
}
```

<details>
<summary>💡 Hint</summary>

Chain `filter` before `map` on `words.iter()`. For the length check use `w.len() > 4`, and `str::to_uppercase()` already returns a `String`, so `map(|w| w.to_uppercase())` feeds `collect()` exactly what it needs.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let words = vec!["apple", "fig", "banana", "kiwi", "cherry", "plum"];

    let result: Vec<String> = words
        .iter()
        .filter(|w| w.len() > 4)
        .map(|w| w.to_uppercase())
        .collect();

    println!("{:?}", result);
}
```

Output: `["APPLE", "BANANA", "CHERRY"]`

</details>

## 📖 Additional Resources

- [The Rust Book - Processing a Series of Items with Iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html)
- [Rust by Example - Iterators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/day-45">← Day 45: Iterators Basics</a>
  <a href="/week-07/day-47">Day 47: Consuming Adapters →</a>
</div>
