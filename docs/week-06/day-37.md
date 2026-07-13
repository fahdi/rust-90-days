---
title: "Day 37 - if let & while let"
description: "Learn about if let & while let in Rust"
---

# Day 37: if let & while let

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

Replace verbose one-armed `match` expressions with concise `if let` syntax, and use `while let` to loop until a pattern stops matching.

## 📚 The Concept (3 min)

Yesterday you used `match` to handle every variant of an enum. But sometimes you only care about *one* pattern and want to ignore the rest. Writing a full `match` with a `_ => ()` arm just to unwrap a single `Some` value is boilerplate:

```rust
match config_max {
    Some(max) => println!("Max is {max}"),
    _ => (), // annoying: we're forced to say "do nothing"
}
```

`if let` is syntax sugar for exactly this case. It reads as: "**if** this value **lets** itself be destructured by this pattern, run the block":

```rust
if let Some(max) = config_max {
    println!("Max is {max}");
}
```

Think of `match` as a mail sorting office that must have a bin for every possible letter, while `if let` is you flipping through the pile looking for one specific envelope, you grab it if it's there, and shrug if it isn't. You can attach an `else` block for the shrug, which behaves like the `_` arm of a `match`.

`while let` applies the same idea to loops: keep running the body *as long as* the pattern keeps matching. The classic use is draining a collection, `stack.pop()` returns `Option<T>`, so `while let Some(item) = stack.pop()` loops until `pop()` returns `None`, and inside the loop `item` is already unwrapped for you.

The trade-off: `if let` gives up **exhaustiveness checking**. With `match`, the compiler forces you to handle every variant, add a new enum variant later and every `match` that misses it becomes a compile error. `if let` silently ignores everything that doesn't match, so reserve it for cases where ignoring the rest is genuinely what you want.

::: tip Key Insight
`if let PATTERN = VALUE` is a pattern **binding**, not a comparison, the single `=` destructures the value and binds its pieces to new variables, exactly like one arm of a `match`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let config_max: Option<u8> = Some(3);

    // Verbose way: a full match just to handle one case
    match config_max {
        Some(max) => println!("Max is configured to {max}"),
        _ => (),
    }

    // Concise way: if let does the same thing
    if let Some(max) = config_max {
        println!("Max is configured to {max}");
    }

    // if let with an else branch
    let favorite_color: Option<&str> = None;
    if let Some(color) = favorite_color {
        println!("Using your favorite color: {color}");
    } else {
        println!("No favorite color set, using blue");
    }
}
```

::: details Output
```
Max is configured to 3
Max is configured to 3
No favorite color set, using blue
```
:::

### Example 2: Practical Application

A job queue: `while let` drains the queue, and a `match` inside handles each job variant.

```rust
#[derive(Debug)]
enum Job {
    Compile(String),
    Deploy { env: String },
}

fn main() {
    let mut queue: Vec<Job> = vec![
        Job::Deploy { env: String::from("staging") },
        Job::Compile(String::from("api-server")),
        Job::Compile(String::from("cli-tool")),
    ];

    // while let keeps looping as long as pop() returns Some
    while let Some(job) = queue.pop() {
        match job {
            Job::Compile(name) => println!("Compiling {name}..."),
            Job::Deploy { env } => println!("Deploying to {env}..."),
        }
    }

    println!("Queue empty. All jobs processed!");
}
```

::: details Output
```
Compiling cli-tool...
Compiling api-server...
Deploying to staging...
Queue empty. All jobs processed!
```
Note the order: `pop()` takes from the **end** of the `Vec`, so jobs come out last-in, first-out.
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `if let Some(x) = value { ... }` is shorthand for a `match` with one meaningful arm plus `_ => ()`  
✅ `if let ... else { ... }` covers the non-matching case, just like a `_` arm  
✅ `while let Some(item) = stack.pop()` loops until the pattern stops matching, perfect for draining collections  
✅ Unlike `match`, `if let` skips exhaustiveness checking, use `match` when every variant must be handled

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Writing `==` instead of `=`.** `if let Some(3) == x` does NOT compile, `if let` takes a pattern binding with a single `=`, not a boolean comparison. (If you just want equality, plain `if x == Some(3)` works for comparable types.)
- **Using `if let` where `match` belongs.** If you `if let` on one variant of your own enum and later add a new variant, the compiler stays silent and the new case is silently ignored. A `match` would have flagged every spot you need to update.
- **A `while let` that never advances.** `while let Some(x) = v.iter().next()` is an infinite loop, each iteration creates a *fresh* iterator and grabs the same first element. Bind the iterator once (`let mut it = v.iter();`) and call `it.next()` in the loop, or use a consuming call like `pop()`.
:::

## ✅ Quick Challenge

You have a stack of sensor readings where `Some(value)` is a good reading and `None` is a glitch. Use `while let` to pop readings until the vec is empty, and `if let` (with an `else` that prints a skip message) to add only the good readings to `total`. The correct total is `42`.

```rust
// Starter code
fn main() {
    // Sensor readings: Some(value) = good reading, None = sensor glitch
    let mut readings: Vec<Option<i32>> = vec![Some(10), None, Some(25), Some(7), None];

    let mut total = 0;

    // TODO: use `while let` to pop readings until the vec is empty,
    // and `if let` to add only the Some(value) readings to `total`.

    println!("Total: {total}");
}
```

<details>
<summary>💡 Hint</summary>

There are two layers of `Option` here: `readings.pop()` returns `Option<Option<i32>>`. The `while let Some(reading) = readings.pop()` handles the outer layer (is the vec empty?), then an `if let Some(value) = reading` inside the loop handles the inner one (was the reading good?).

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    // Sensor readings: Some(value) = good reading, None = sensor glitch
    let mut readings: Vec<Option<i32>> = vec![Some(10), None, Some(25), Some(7), None];

    let mut total = 0;

    while let Some(reading) = readings.pop() {
        if let Some(value) = reading {
            total += value;
        } else {
            println!("Skipping a glitched reading");
        }
    }

    println!("Total: {total}");
}
```

Output:

```
Skipping a glitched reading
Skipping a glitched reading
Total: 42
```

</details>

## 📖 Additional Resources

- [The Rust Book - Concise Control Flow with if let](https://doc.rust-lang.org/book/ch06-03-if-let.html)
- [Rust by Example - if let](https://doc.rust-lang.org/rust-by-example/flow_control/if_let.html)
- [Rust by Example - while let](https://doc.rust-lang.org/rust-by-example/flow_control/while_let.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/day-36">← Day 36: Pattern Matching with Enums</a>
  <a href="/week-06/day-38">Day 38: Method Chaining →</a>
</div>
