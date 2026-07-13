---
title: "Day 1 - Hello Rust"
description: "Learn about hello rust in Rust"
---

# Day 1: Hello Rust

<div class="lesson-meta">
  <span class="time">⏱️ 8 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

Write, compile, and run your first Rust program, and use `println!` with placeholders to print formatted values to the terminal.

## 📚 The Concept (3 min)

Rust is a **compiled** language. Unlike JavaScript or Python, where an interpreter reads your code line by line while it runs, Rust's compiler (`rustc`) translates your entire program into machine code *before* it ever runs. Think of the difference between a live interpreter translating a speech sentence by sentence versus a translator preparing a polished document in advance: the up-front work takes a moment, but the result is fast, and every error is caught before the audience hears a word.

Every Rust program starts at a function called `main`. The `fn` keyword declares a function, and curly braces hold its body:

```rust
fn main() {
    println!("Hello, Rust!");
}
```

That `println!` is not a function, the `!` marks it as a **macro**, code that generates code at compile time. You'll meet macros properly later in the course; for now, remember the rule of thumb: if it ends with `!`, it's a macro, and `println!` is the one you'll use constantly to print a line of text.

`println!` supports **placeholders**. Empty braces `{}` get filled by the arguments that follow, in order. You can also put a variable name directly inside the braces (`{name}`), or add formatting instructions like `{:.1}` to round a number to one decimal place.

Day to day you'll use `cargo run` (Cargo is Rust's build tool and package manager), but under the hood it calls the compiler for you: `rustc main.rs` produces a standalone binary you can execute directly, no runtime, no interpreter, no dependencies to install on the target machine.

::: tip Key Insight
Rust catches mistakes at **compile time**, not at runtime. If your program compiles, whole categories of bugs, typos, type mismatches, missing values, are already impossible. Treat the compiler as a teammate, not an obstacle.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    println!("Hello, Rust!");
}
```

### Example 2: Practical Application

```rust
fn main() {
    let name = "Rustacean";
    let day = 1;
    println!("Welcome, {}!", name);
    println!("This is day {} of your 90-day journey.", day);
    println!("Keep going, {name}, only {} days left!", 90 - day);
    println!("Progress: {:.1}%", (day as f64 / 90.0) * 100.0);
}
```

::: details Output
Example 1:

```
Hello, Rust!
```

Example 2:

```
Welcome, Rustacean!
This is day 1 of your 90-day journey.
Keep going, Rustacean, only 89 days left!
Progress: 1.1%
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Every Rust program starts executing at `fn main()`  
✅ `println!` is a macro (note the `!`), and `{}` placeholders insert values in order  
✅ Rust compiles to a standalone native binary, no interpreter or runtime needed  
✅ Format specifiers like `{:.1}` control how values print (here: one decimal place)

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the `!`**, writing `println("hi")` fails with "cannot find function `println`", because `println!` is a macro, not a function.
- **Missing semicolons**, statements like `println!(...)` must end with `;`, and the compiler's error often points at the *next* line, which confuses beginners.
- **Mismatched placeholder counts**, `println!("{} and {}", x)` won't compile: two `{}` placeholders need two arguments. Handily, Rust catches this at compile time, where C's `printf` would misbehave at runtime.
:::

## ✅ Quick Challenge

Write a program that prints a 3-line introduction: your name, the language you come from, and why you're learning Rust. Store each piece in a variable and use `println!` placeholders instead of hard-coding the text.

```rust
fn main() {
    // Print a 3-line introduction: your name, the language you come from,
    // and why you're learning Rust. Use println! placeholders, not
    // hard-coded strings.
}
```

<details>
<summary>💡 Hint</summary>

Declare variables with `let name = "...";`, then reference them either positionally (`println!("Hi, I'm {}!", name)`) or inline (`println!("Hi, I'm {name}!")`). Both styles work, inline is often more readable.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let name = "Sam";
    let background = "JavaScript";
    let goal = "fast, reliable tools";
    println!("Hi, I'm {}!", name);
    println!("I come from a {} background.", background);
    println!("I'm learning Rust to build {goal}.");
}
```

Output:

```
Hi, I'm Sam!
I come from a JavaScript background.
I'm learning Rust to build fast, reliable tools.
```

</details>

## 📖 Additional Resources

- [The Rust Book - Getting Started](https://doc.rust-lang.org/book/ch01-00-getting-started.html)
- [Rust by Example - Hello World](https://doc.rust-lang.org/rust-by-example/hello.html)

---

<ProgressTracker />

<div class="lesson-nav">
  
  <a href="/week-01/day-02">Day 2: Variables & Mutability →</a>
</div>
