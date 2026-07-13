---
title: "Day 38 - Method Chaining"
description: "Learn about method chaining in Rust"
---

# Day 38: Method Chaining

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

Read and write fluent method chains that transform data step by step, string pipelines and iterator pipelines like `.iter().filter().map().collect()`, instead of stacking intermediate variables.

## 📚 The Concept (3 min)

Method chaining is the practice of calling a method directly on the result of a previous method, forming a pipeline: `value.step_one().step_two().step_three()`. It works because each method in the chain *returns something*, either a transformed value or an adapter wrapping the previous stage, so the next call has a receiver to act on.

Think of it like an assembly line in a factory. Raw material enters at one end, and each station does exactly one job: trim the edges, apply paint, attach a label. No station needs to know what the others do; it just receives a piece, transforms it, and passes it along. A method chain is the same, `"  Hi  ".trim().to_lowercase()` sends a string through a "remove whitespace" station and then a "lowercase" station. Compare that to the non-chained version, where you'd invent throwaway names like `trimmed`, `lowered`, `replaced` for every intermediate step. The chain removes that naming noise and reads top-to-bottom like a recipe.

Chaining is everywhere in idiomatic Rust, but it truly shines with **iterators**. Methods like `filter` and `map` are *adapters*: they don't do any work when called, they return a new iterator that wraps the old one. Nothing actually runs until a *consumer* like `collect`, `sum`, or `count` pulls items through the whole pipeline. That laziness means a long chain still makes a single pass over the data, you're composing a description of the work, then executing it once.

Rustfmt even has a convention for readability: when a chain gets long, put each method call on its own line, aligned under the first. You'll see that style in every serious Rust codebase, and we use it below.

::: tip Key Insight
A chain works because every link returns a value for the next link to call a method on. Iterator adapters (`filter`, `map`) are lazy, they build up the pipeline; a final consumer (`collect`, `sum`) is what actually runs it.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let sentence = "  Rust makes method chaining a joy  ";

    // Each method returns a value the next method can act on
    let cleaned = sentence
        .trim()                 // &str -> &str (whitespace removed)
        .to_lowercase()         // &str -> String
        .replace("joy", "superpower"); // String -> String

    println!("Cleaned: {cleaned}");

    // The same idea with numbers: each call feeds the next
    let numbers = vec![3, 7, 2, 9, 4, 12];

    let sum_of_big_squares: i32 = numbers
        .iter()                 // create an iterator
        .filter(|&&n| n > 4)    // keep values greater than 4
        .map(|&n| n * n)        // square each survivor
        .sum();                 // collapse into one number

    println!("Sum of big squares: {sum_of_big_squares}");
}
```

::: details Output
```
Cleaned: rust makes method chaining a superpower
Sum of big squares: 274
```
:::

### Example 2: Practical Application

```rust
#[derive(Debug)]
struct Order {
    id: u32,
    customer: String,
    total: f64,
    shipped: bool,
}

fn main() {
    let orders = vec![
        Order { id: 101, customer: "Aisha".to_string(),  total: 250.0, shipped: true },
        Order { id: 102, customer: "Bilal".to_string(),  total: 75.5,  shipped: false },
        Order { id: 103, customer: "Aisha".to_string(),  total: 320.0, shipped: false },
        Order { id: 104, customer: "Carlos".to_string(), total: 40.0,  shipped: true },
        Order { id: 105, customer: "Bilal".to_string(),  total: 510.0, shipped: false },
    ];

    // Pipeline: find unshipped orders worth over $100,
    // format a label for each, and collect the results.
    let priority_labels: Vec<String> = orders
        .iter()
        .filter(|order| !order.shipped)
        .filter(|order| order.total > 100.0)
        .map(|order| format!("#{} for {} (${:.2})", order.id, order.customer, order.total))
        .collect();

    println!("Priority shipments:");
    for label in &priority_labels {
        println!("  {label}");
    }

    // One more chain: total value still waiting to ship
    let pending_value: f64 = orders
        .iter()
        .filter(|order| !order.shipped)
        .map(|order| order.total)
        .sum();

    println!("Pending value: ${pending_value:.2}");
}
```

::: details Output
```
Priority shipments:
  #103 for Aisha ($320.00)
  #105 for Bilal ($510.00)
Pending value: $905.50
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A method chain works only when each method returns a value, `&str`, `String`, or an iterator adapter, for the next call to receive  
✅ Iterator adapters like `filter` and `map` are lazy; a consumer such as `collect`, `sum`, or `count` is what triggers the single pass over the data  
✅ `collect()` needs a target type, write it on the binding (`let v: Vec<String> = ...`) or use the turbofish (`.collect::<Vec<String>>()`)  
✅ Format long chains with one method per line, it reads like a recipe and makes each transformation step easy to review

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the consumer.** `numbers.iter().map(|n| n * 2);` does nothing, adapters are lazy, and the compiler even warns "unused `Map` that must be used". Add `.collect()`, `.sum()`, or a `for` loop to actually run the pipeline.
- **Ambiguous `collect()` type.** `let v = items.iter().map(...).collect();`, this does NOT compile, because `collect` can build a `Vec`, `String`, `HashMap`, and more. Annotate the binding or use `.collect::<Vec<_>>()`.
- **Chaining past a temporary that gets dropped.** `let s = String::from(" hi ").trim();`, this does NOT compile: the `String` is a temporary dropped at the end of the statement, and `trim` returns a `&str` borrowing it. Bind the `String` to a variable first, then chain off it.
:::

## ✅ Quick Challenge

Given a list of fruit names in mixed case, build **one method chain** that keeps only the fruits starting with the letter `a` (case-insensitive), converts each to uppercase, and collects them into a `Vec<String>`.

```rust
// Starter code
fn main() {
    let words = vec!["apple", "Banana", "cherry", "AVOCADO", "blueberry", "apricot"];

    // TODO: build ONE method chain that:
    //   1. keeps only words starting with 'a' (case-insensitive)
    //   2. converts each to uppercase
    //   3. collects them into a Vec<String>
    let a_words: Vec<String> = Vec::new(); // replace this line with your chain

    println!("{a_words:?}");
}
```

<details>
<summary>💡 Hint</summary>

Start with `words.iter()`, then `.filter(...)` and `.map(...)`, finishing with `.collect()`. Inside the filter closure, `word.to_lowercase().starts_with('a')` handles the case-insensitive check, a small method chain inside your bigger one!

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let words = vec!["apple", "Banana", "cherry", "AVOCADO", "blueberry", "apricot"];

    let a_words: Vec<String> = words
        .iter()
        .filter(|word| word.to_lowercase().starts_with('a'))
        .map(|word| word.to_uppercase())
        .collect();

    println!("{a_words:?}");
}
```

Output: `["APPLE", "AVOCADO", "APRICOT"]`

</details>

## 📖 Additional Resources

- [The Rust Book - Processing a Series of Items with Iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html)
- [Rust by Example - Iterator adapters and combinators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/day-37">← Day 37: if let & while let</a>
  <a href="/week-06/day-39">Day 39: Builder Pattern →</a>
</div>
