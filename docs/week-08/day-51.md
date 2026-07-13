---
title: "Day 51 - move Closures"
description: "Learn about move closures in Rust"
---

# Day 51: move Closures

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Understand what the `move` keyword does to a closure's captured variables, and know exactly when you need it, returning closures from functions and sending them to threads.

## 📚 The Concept (3 min)

Yesterday you saw that closures capture variables from their environment. By default, Rust is frugal about *how* it captures: it borrows. If the closure only reads a variable, it captures `&T`; if it mutates, `&mut T`; only if the closure consumes the value (say, by calling `drop` on it) does it take ownership. This is usually what you want, the original variable stays usable after you define the closure.

The `move` keyword overrides that default. `move || ...` says: "don't borrow anything, take ownership of every captured variable." Think of it as the difference between a house-sitter and a mover. A regular closure is a house-sitter: it uses your stuff while you're around, but everything still belongs to you. A `move` closure is a moving truck: whatever it touches gets packed up and leaves with it. Your original variable is gone (unless its type is `Copy`, like `i32`, then the closure just takes a copy and you keep yours).

Why would you ever want this? Lifetimes. A borrowing closure is tied to the scope of the variables it borrows, it cannot outlive them. But two very common patterns require a closure to *outlive* the function that created it:

1. **Returning a closure from a function.** The local variables die when the function returns, so the closure must own its captures.
2. **Spawning a thread.** `thread::spawn` may run the closure long after the current stack frame is gone, so the compiler demands `move`.

One subtlety trips everyone up: `move` changes *how variables are captured*, not *how the closure behaves when called*. A `move` closure that only prints its captures can still be called many times, it owns the data, and printing merely borrows it internally.

::: tip Key Insight
`move` controls **capture** (own vs. borrow), not **callability**. A `move` closure isn't "call-once", it simply owns its environment, which frees it from the lifetime of the scope that created it.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let name = String::from("Ferris");

    // Without `move`: the closure borrows `name`
    let greet_borrow = || println!("Hello, {name}!");
    greet_borrow();
    println!("Still usable here: {name}"); // fine, only borrowed

    // With `move`: the closure takes ownership of `name`
    let greet_own = move || println!("Hello again, {name}!");
    greet_own();
    greet_own(); // can call repeatedly, printing only needs &name inside

    // println!("{name}"); // ERROR if uncommented: `name` was moved
}
```

### Example 2: Practical Application

```rust
use std::thread;

fn main() {
    let cities = vec!["Lahore", "Karachi", "Islamabad"];

    // `move` is required: the thread may outlive `main`'s stack frame,
    // so borrowing `cities` would be unsafe. Ownership must transfer.
    let handle = thread::spawn(move || {
        for city in &cities {
            println!("Processing weather data for {city}");
        }
        cities.len() // the thread returns a value
    });

    let count = handle.join().unwrap();
    println!("Done: {count} cities processed");
}
```

::: details Output
```
Hello, Ferris!
Still usable here: Ferris
Hello again, Ferris!
Hello again, Ferris!
```
Example 2:
```
Processing weather data for Lahore
Processing weather data for Karachi
Processing weather data for Islamabad
Done: 3 cities processed
```
:::

Try removing `move` from Example 2, the compiler rejects it with "closure may outlive the current function, but it borrows `cities`" and even suggests adding `move`. This does NOT compile without it.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `move` forces a closure to take **ownership** of captured variables instead of borrowing them  
✅ `Copy` types (like `i32`) are copied into a `move` closure, the original stays usable; non-`Copy` types (like `String`, `Vec`) are moved out  
✅ `thread::spawn` requires `move` because the thread may outlive the scope that created the closure  
✅ A `move` closure can still be called multiple times, owning data and consuming data are different things

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a variable after it's moved into a closure.** `let s = String::from("hi"); let c = move || println!("{s}"); println!("{s}");`, the last line does NOT compile: `s` now lives inside `c`. If you need both, clone before capturing: `let s2 = s.clone();` and move the clone.
- **Assuming `move` means "call once."** Learners see "move" and think the closure is consumed on first call. Wrong, that's `FnOnce` behavior (tomorrow's topic), which depends on what the *body* does with the values, not on the `move` keyword.
- **Expecting `move` to affect `Copy` types.** `let n = 5; let c = move || n + 1;` copies `n`, so `n` is still usable afterward. Tests that "prove" a move happened with integers will confuse you, use a `String` or `Vec` to observe real moves.
:::

## ✅ Quick Challenge

Write `make_labeler`, a function that takes a `String` prefix and **returns a closure**. The returned closure should take a `&str` and produce `"[PREFIX] text"`. Because the closure outlives `make_labeler`'s stack frame, you'll need `move`.

```rust
// Starter code
fn make_labeler(prefix: String) -> impl Fn(&str) -> String {
    // TODO: return a `move` closure that wraps `text` as "[PREFIX] text"
    move |_text| String::new() // replace this placeholder
}

fn main() {
    let label = make_labeler(String::from("TASK"));
    println!("{}", label("write code"));
    println!("{}", label("review PR"));
}
```

<details>
<summary>💡 Hint</summary>

The closure body is one line: `format!("[{prefix}] {text}")`. The `move` keyword is what lets `prefix` travel out of the function inside the closure, without it, the closure would borrow a local that's about to be destroyed, and the compiler will refuse.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn make_labeler(prefix: String) -> impl Fn(&str) -> String {
    // `move` transfers `prefix` into the closure, so the closure can
    // outlive this function's stack frame and be returned safely.
    move |text| format!("[{prefix}] {text}")
}

fn main() {
    let label = make_labeler(String::from("TASK"));
    println!("{}", label("write code"));
    println!("{}", label("review PR"));

    let warn = make_labeler(String::from("WARN"));
    println!("{}", warn("disk almost full"));
}
```

Output:

```
[TASK] write code
[TASK] review PR
[WARN] disk almost full
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch 13.1: Closures](https://doc.rust-lang.org/book/ch13-01-closures.html)
- [Rust by Example - Closures as input parameters](https://doc.rust-lang.org/rust-by-example/fn/closures/input_parameters.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/day-50">← Day 50: Closure Syntax Variations</a>
  <a href="/week-08/day-52">Day 52: Fn, FnMut, FnOnce Traits →</a>
</div>
