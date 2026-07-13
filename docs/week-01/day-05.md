---
title: "Day 5 - Tuples & Arrays"
description: "Learn about tuples & arrays in Rust"
---

# Day 5: Tuples & Arrays

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

Group related values together using Rust's two built-in compound types: use tuples to bundle values of different types, and arrays to hold fixed-size lists of the same type, including destructuring, indexing, and iterating over both.

## 📚 The Concept (3 min)

So far you've worked with single values: one integer, one string, one boolean. Real programs constantly need to group values together, and Rust gives you two compound types baked into the language: **tuples** and **arrays**.

A **tuple** is like a labeled shipping box with fixed compartments: each compartment can hold a *different* kind of thing. A player record might be `("Alia", 7, 91.5)`, a name, a level, and a score, all traveling together as one value. The tuple's type is written as the types of its parts: a name-level-score tuple has type (&str, u32, f64). You access parts by position (`player.0`, `player.1`) or pull everything out at once with destructuring: `let (name, level, score) = player;`. Tuples shine when a function needs to return more than one value, no wrapper struct required.

An **array** is more like an egg carton: every slot holds the *same* kind of thing, and the number of slots is fixed at compile time. `[21.5, 23.0, 19.8]` is an array of three f64 values, and its length is literally part of its type, written [f64; 3]. That fixed size means arrays live on the stack and are very fast, but they can never grow or shrink. (When you need a growable list, Rust has Vec, coming later in the course.)

Choosing between them is simple: different types or "these belong together as one record" → tuple; a list of same-typed items you'll index or loop over → array. Rust also checks array bounds, indexing past the end doesn't silently read garbage like in C; it stops your program safely.

::: tip Key Insight
Tuples group *different* types by position; arrays hold a *fixed number* of the *same* type. Both have sizes known at compile time, that's what separates them from growable collections like Vec.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // A tuple groups values of DIFFERENT types
    let player: (&str, u32, f64) = ("Alia", 7, 91.5);

    // Access by position with .0, .1, .2
    println!("Name: {}", player.0);
    println!("Level: {}", player.1);
    println!("Score: {}", player.2);

    // Destructure a tuple into separate variables
    let (name, level, score) = player;
    println!("{} is level {} with score {}", name, level, score);

    // An array holds values of the SAME type, fixed length
    let days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    println!("First day: {}", days[0]);
    println!("Last day: {}", days[4]);
    println!("Work week has {} days", days.len());

    // Initialize an array with repeated values: [value; count]
    let zeros = [0; 3];
    println!("Zeros: {:?}", zeros);
}
```

### Example 2: Practical Application

A weather tracker: store a week of temperatures in an array, then return two results at once from a function using a tuple.

```rust
// Returns the lowest and highest temperature as a tuple
fn min_max(temps: &[f64; 7]) -> (f64, f64) {
    let mut min = temps[0];
    let mut max = temps[0];
    for &t in temps.iter() {
        if t < min { min = t; }
        if t > max { max = t; }
    }
    (min, max)
}

fn main() {
    // One week of temperatures in Celsius
    let temps: [f64; 7] = [21.5, 23.0, 19.8, 25.2, 22.1, 18.4, 20.9];

    let (low, high) = min_max(&temps);
    println!("Lowest:  {low}C");
    println!("Highest: {high}C");

    // Compute the average by iterating
    let mut sum = 0.0;
    for t in temps {
        sum += t;
    }
    let avg = sum / temps.len() as f64;
    println!("Average: {avg:.1}C");

    // Slices: borrow part of an array
    let weekend = &temps[5..7];
    println!("Weekend temps: {weekend:?}");
}
```

::: details Output
```
Lowest:  18.4C
Highest: 25.2C
Average: 21.6C
Weekend temps: [18.4, 20.9]
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Tuples bundle values of different types; access them with `.0`, `.1`, `.2` or destructure with `let (a, b, c) = tup;`  
✅ Arrays hold a fixed number of same-typed values; the length is part of the type, e.g. [i32; 5]  
✅ `[0; 3]` is shorthand for an array of three zeros, handy for initializing buffers  
✅ Returning a tuple like `(min, max)` lets a function hand back multiple values without a struct

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using `[]` on a tuple or `.0` on an array.** The syntaxes don't cross over: `player[0]` on a tuple is a compile error, and so is `days.0` on an array. Tuples use dot-number, arrays use square brackets.
- **Indexing out of bounds.** `days[5]` on a 5-element array is caught at compile time for literal indexes, but a runtime index like `days[user_input]` panics if it's too big. Check against `.len()` first, or use `days.get(i)`, which returns an Option instead of crashing.
- **Expecting arrays to grow.** `temps.push(30.0)` does NOT compile, arrays are fixed-size forever. If you find yourself wanting to add or remove elements, you need a Vec, not an array.
:::

## ✅ Quick Challenge

Given an array of five exam scores, print the first and last score, then compute the sum and average of all scores and store them together as a tuple `(sum, average)` before printing both.

```rust
// Starter code
fn main() {
    let scores = [85, 92, 78, 95, 88];

    // 1. Print the first and last score
    // 2. Compute the sum and average of all scores
    // 3. Store the result as a tuple (sum, average) and print it
}
```

<details>
<summary>💡 Hint</summary>

The last index is `scores.len() - 1`. For the average, the sum is an integer but the average shouldn't be, convert with `sum as f64 / scores.len() as f64`. Your tuple will have type (i32, f64), and you can print its parts with `stats.0` and `stats.1`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let scores = [85, 92, 78, 95, 88];

    // 1. First and last score
    println!("First: {}", scores[0]);
    println!("Last: {}", scores[scores.len() - 1]);

    // 2. Sum and average
    let mut sum = 0;
    for s in scores {
        sum += s;
    }
    let average = sum as f64 / scores.len() as f64;

    // 3. Store as a tuple and print
    let stats = (sum, average);
    println!("Sum: {}, Average: {}", stats.0, stats.1);
}
```

Output:

```
First: 85
Last: 88
Sum: 438, Average: 87.6
```

</details>

## 📖 Additional Resources

- [The Rust Book - The Tuple Type & The Array Type](https://doc.rust-lang.org/book/ch03-02-data-types.html#compound-types)
- [Rust by Example - Tuples](https://doc.rust-lang.org/rust-by-example/primitives/tuples.html)
- [Rust by Example - Arrays and Slices](https://doc.rust-lang.org/rust-by-example/primitives/array.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-01/day-04">← Day 4: Strings vs &str</a>
  <a href="/week-01/day-06">Day 6: Functions →</a>
</div>
