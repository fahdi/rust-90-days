---
title: "Day 10 - Comments & Docs"
description: "Learn about comments & docs in Rust"
---

# Day 10: Comments & Docs

<div class="lesson-meta">
  <span class="time">⏱️ 8 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

Use Rust's three kinds of comments — line comments, block comments, and doc comments — and understand how `///` doc comments turn into professional HTML documentation with `cargo doc`.

## 📚 The Concept (3 min)

Every language has comments, but Rust treats documentation as a first-class citizen. There are three flavors you'll use:

**Line comments** start with `//` and run to the end of the line. This is the everyday workhorse — use it to explain *why* code does something, not to restate *what* it does. `let x = 5; // set x to 5` is noise; `// retry limit chosen from API rate-limit docs` is gold.

**Block comments** are wrapped in `/* ... */` and can span multiple lines or sit in the middle of a line. Rustaceans use them rarely — idiomatic Rust prefers stacking `//` lines — but they're handy for temporarily disabling a chunk of code.

**Doc comments** are where Rust shines. A comment starting with `///` documents the item *below* it (a function, struct, or module), and `//!` documents the item it's *inside* (typically the whole file or crate). Think of `///` as a label on a jar and `//!` as a note taped inside the jar's lid.

Here's the killer feature: doc comments are written in Markdown, and running `cargo doc --open` compiles them into a browsable HTML site — the exact same tooling that generates the official documentation at docs.rs. Even better, code blocks inside doc comments become **doc tests**: `cargo test` actually compiles and runs your examples, so your documentation can never silently drift out of date.

One gotcha: doc comments must be attached to an item. A `///` floating above a random `let` statement inside a function does NOT compile — the compiler will complain about an unused doc comment. This does NOT compile as documentation; use plain `//` inside function bodies.

::: tip Key Insight
`//` comments talk to the next programmer reading the source; `///` doc comments talk to the *users* of your code — and Rust can test the examples inside them, so docs stay truthful forever.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
// This is a line comment — the compiler ignores everything after //

/* This is a block comment.
   It can span multiple lines. */

fn main() {
    // Comments should explain WHY, not just what
    let ticket_price = 45; // in dollars, per person

    let group_size = 4;

    /* Block comments can sit anywhere,
       even in the middle of code. */
    let total = ticket_price * group_size;

    println!("Total for {} people: ${}", group_size, total);
    // println!("This line is disabled for debugging");
}
```

### Example 2: Practical Application

```rust
//! A tiny temperature helper library.
//! Inner doc comments (`//!`) describe the enclosing item — here, the whole file.

/// Converts a temperature from Celsius to Fahrenheit.
///
/// # Examples
///
/// ```
/// let f = celsius_to_fahrenheit(100.0);
/// assert_eq!(f, 212.0);
/// ```
fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0
}

/// Returns `true` if water would freeze at this Celsius temperature.
fn is_freezing(celsius: f64) -> bool {
    celsius <= 0.0
}

fn main() {
    let temp = 25.0;
    println!("{}°C = {}°F", temp, celsius_to_fahrenheit(temp));
    println!("Freezing at {}°C? {}", temp, is_freezing(temp));
    println!("Freezing at -5°C? {}", is_freezing(-5.0));
}
```

::: details Output
```
Total for 4 people: $180
```
Example 2:
```
25°C = 77°F
Freezing at 25°C? false
Freezing at -5°C? true
```
:::

In a real Cargo project, running `cargo doc --open` on Example 2 would generate an HTML page listing both functions with their descriptions, and `cargo test` would compile and run the `assert_eq!` example inside the doc comment.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `//` is a line comment; idiomatic Rust stacks multiple `//` lines instead of using `/* */` blocks  
✅ `///` documents the item below it; `//!` documents the enclosing item (file, module, or crate)  
✅ Doc comments are Markdown — headings like `# Examples` render as sections in `cargo doc` output  
✅ Code blocks inside `///` comments are run by `cargo test` as doc tests, keeping examples honest

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Putting `///` inside a function body.** Doc comments must be attached to an item like a `fn` or `struct`. A `///` above a `let` statement triggers an "unused doc comment" error — use plain `//` there instead.
- **Using `//!` below the top of the file.** Inner doc comments must come *before* any items in the file or module. Dropping `//!` after a function definition is a compile error.
- **Comments that restate the code.** `// add 1 to counter` above `counter += 1` adds maintenance burden with zero information. Write comments for intent, constraints, and surprises — the code already says what it does.
:::

## ✅ Quick Challenge

Add a proper doc comment to the function below: a one-line summary, a note about units, and an `# Examples` section containing a code block that asserts the result of `area_of_rectangle(3.0, 4.5)`.

```rust
// Starter code
// TODO: Add a doc comment (///) describing this function,
// including an # Examples section.
fn area_of_rectangle(width: f64, height: f64) -> f64 {
    width * height
}

fn main() {
    println!("Area: {}", area_of_rectangle(3.0, 4.5));
}
```

<details>
<summary>💡 Hint</summary>

Start each doc line with `///` directly above `fn area_of_rectangle`. Inside, write Markdown: a summary sentence, a blank `///` line, then `/// # Examples` followed by a fenced code block (each fence line also starts with `///`). `3.0 * 4.5` is `13.5`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
/// Calculates the area of a rectangle.
///
/// Both dimensions are in meters; the result is in square meters.
///
/// # Examples
///
/// ```
/// let area = area_of_rectangle(3.0, 4.5);
/// assert_eq!(area, 13.5);
/// ```
fn area_of_rectangle(width: f64, height: f64) -> f64 {
    width * height
}

fn main() {
    // Doc comments describe the function; regular comments explain this call.
    println!("Area: {}", area_of_rectangle(3.0, 4.5));
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Comments](https://doc.rust-lang.org/book/ch03-04-comments.html)
- [The Rust Book - Publishing Documentation](https://doc.rust-lang.org/book/ch14-02-publishing-to-crates-io.html#making-useful-documentation-comments)
- [Rust by Example - Comments](https://doc.rust-lang.org/rust-by-example/hello/comment.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/day-09">← Day 9: Pattern Matching</a>
  <a href="/week-02/day-11">Day 11: Project: Temperature Converter →</a>
</div>
