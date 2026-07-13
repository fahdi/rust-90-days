---
title: "Day 36 - Pattern Matching with Enums"
description: "Learn about pattern matching with enums in Rust"
---

# Day 36: Pattern Matching with Enums

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

By the end of this lesson you'll be able to use `match` to branch on every variant of an enum, destructure the data inside variants (tuple and struct style), and sharpen your arms with match guards.

## 📚 The Concept (3 min)

Enums answer the question "which one of these is it?", pattern matching answers "and what do I do about it?" The two features were designed together, and `match` is where enums earn their keep.

Think of `match` as a coin-sorting machine. You drop a coin in the top, it rolls past a series of slots, and it falls into the *first* slot it fits. Each `match` arm is a slot: a pattern on the left, code to run on the right. Unlike a chain of `if`/`else if`, though, the compiler inspects your sorting machine and refuses to build it unless every possible coin has a slot. This is called **exhaustiveness checking**, and it's the killer feature: add a new variant to your enum six months from now, and every `match` in the codebase that forgot to handle it becomes a compile error instead of a 3 a.m. bug.

Patterns do more than select a variant, they **destructure** it. If a variant carries data (`Quarter(String)` or `Message { from, text }`), the pattern pulls that data out and binds it to variables you can use in the arm's body. No getters, no casts.

Two more tools round out the kit:

- The **catch-all** `_` pattern matches anything, letting you say "and for everything else, do this." Use it deliberately, it trades away exhaustiveness checking.
- **Match guards** (`pattern if condition`) let an arm match only when an extra boolean test passes, so you can branch on the *data inside* a variant, not just the variant itself.

Also remember: `match` is an expression. Each arm produces a value, so you can assign the whole thing to a variable or return it directly, a pattern you'll use constantly in idiomatic Rust.

::: tip Key Insight
`match` on an enum is checked for exhaustiveness at compile time: the compiler guarantees every variant is handled, so adding a variant later breaks loudly at compile time instead of silently at runtime.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The classic coin sorter, plain variants plus one variant carrying data:

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(String), // the state it was minted for
}

fn value_in_cents(coin: &Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("Quarter from {}!", state);
            25
        }
    }
}

fn main() {
    let coins = vec![
        Coin::Penny,
        Coin::Nickel,
        Coin::Dime,
        Coin::Quarter(String::from("Michigan")),
    ];

    let mut total = 0;
    for coin in &coins {
        total += value_in_cents(coin);
    }
    println!("Total: {} cents", total);
}
```

### Example 2: Practical Application

An event handler for a chat server, struct-variant destructuring, literal matching on a field (`admin: true`), and a match guard:

```rust
enum ApiEvent {
    UserJoined { name: String, admin: bool },
    Message { from: String, text: String },
    Ping(u64),
    Disconnect,
}

fn handle(event: ApiEvent) -> String {
    match event {
        ApiEvent::UserJoined { name, admin: true } => {
            format!("Admin {} joined: grant moderator tools", name)
        }
        ApiEvent::UserJoined { name, admin: false } => {
            format!("{} joined the room", name)
        }
        ApiEvent::Message { from, text } if text.len() > 20 => {
            format!("[{}] (long message, {} chars)", from, text.len())
        }
        ApiEvent::Message { from, text } => format!("[{}] {}", from, text),
        ApiEvent::Ping(id) => format!("pong #{}", id),
        ApiEvent::Disconnect => String::from("Connection closed"),
    }
}

fn main() {
    let events = vec![
        ApiEvent::UserJoined { name: String::from("Aisha"), admin: true },
        ApiEvent::Message { from: String::from("Aisha"), text: String::from("hi all") },
        ApiEvent::Message {
            from: String::from("Bilal"),
            text: String::from("this message is definitely too long"),
        },
        ApiEvent::Ping(42),
        ApiEvent::Disconnect,
    ];

    for event in events {
        println!("{}", handle(event));
    }
}
```

::: details Output
```
Quarter from Michigan!
Total: 41 cents
```

Example 2:
```
Admin Aisha joined: grant moderator tools
[Aisha] hi all
[Bilal] (long message, 35 chars)
pong #42
Connection closed
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `match` must be exhaustive, the compiler errors if any enum variant lacks an arm, which makes refactoring enums safe  
✅ Patterns destructure variant data: `Coin::Quarter(state)` and `Message { from, text }` bind inner values to names you use in the arm  
✅ Match guards (`pattern if condition`) let an arm depend on the data's value, not just its shape, but guards are *not* counted toward exhaustiveness  
✅ `match` is an expression: every arm returns a value of the same type, so `let result = match ... ;` is idiomatic Rust

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Slapping `_ => ...` on every match.** A catch-all silences the exhaustiveness check. When you later add a variant, the compiler stays quiet and the new variant silently falls into the catch-all, the exact bug `match` exists to prevent. Only use `_` when you genuinely want "everything else" behavior.
- **Matching on an owned value and moving data out accidentally.** `match some_event { ApiEvent::Message { text, .. } => ... }` moves `text` out of `some_event`; using `some_event` afterward is a compile error. Match on a reference (`match &some_event`) so patterns bind by reference instead.
- **Arms with mismatched types.** Because `match` is an expression, every arm must produce the same type. `match coin { Coin::Penny => 1, Coin::Nickel => "five", ... }`, this does NOT compile: one arm is an integer, another a `&str`.
:::

## ✅ Quick Challenge

Complete `calculate` so it matches on the `Operation` enum: `Add` and `Subtract` always return `Some(result)`, while `Divide` must return `None` when the divisor is `0.0` (use a match guard). The starter compiles as-is, replace the `None` stub with a `match`.

```rust
// Starter code
enum Operation {
    Add(f64, f64),
    Subtract(f64, f64),
    Divide(f64, f64),
}

fn calculate(_op: Operation) -> Option<f64> {
    // TODO: match on the operation.
    // Add and Subtract always succeed (Some).
    // Divide must return None when the divisor is 0.0.
    None
}

fn main() {
    println!("{:?}", calculate(Operation::Add(2.0, 3.0)));      // want Some(5.0)
    println!("{:?}", calculate(Operation::Subtract(10.0, 4.0))); // want Some(6.0)
    println!("{:?}", calculate(Operation::Divide(10.0, 2.0)));   // want Some(5.0)
    println!("{:?}", calculate(Operation::Divide(1.0, 0.0)));    // want None
}
```

<details>
<summary>💡 Hint</summary>

Destructure each variant's two numbers in the pattern: `Operation::Add(a, b) => Some(a + b)`. For the zero-divisor case, put a guarded arm *before* the general divide arm: `Operation::Divide(_, b) if b == 0.0 => None`. Order matters, arms are tried top to bottom.

</details>

<details>
<summary>✅ Solution</summary>

```rust
enum Operation {
    Add(f64, f64),
    Subtract(f64, f64),
    Divide(f64, f64),
}

fn calculate(op: Operation) -> Option<f64> {
    match op {
        Operation::Add(a, b) => Some(a + b),
        Operation::Subtract(a, b) => Some(a - b),
        Operation::Divide(_, b) if b == 0.0 => None,
        Operation::Divide(a, b) => Some(a / b),
    }
}

fn main() {
    println!("{:?}", calculate(Operation::Add(2.0, 3.0)));      // Some(5.0)
    println!("{:?}", calculate(Operation::Subtract(10.0, 4.0))); // Some(6.0)
    println!("{:?}", calculate(Operation::Divide(10.0, 2.0)));   // Some(5.0)
    println!("{:?}", calculate(Operation::Divide(1.0, 0.0)));    // None
}
```

Note the guarded arm comes first. If the plain `Divide(a, b)` arm were listed before it, the guard would never be reached.

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 6.2: The match Control Flow Construct](https://doc.rust-lang.org/book/ch06-02-match.html)
- [Rust by Example - match](https://doc.rust-lang.org/rust-by-example/flow_control/match.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/">← Week 6 Overview</a>
  <a href="/week-06/day-37">Day 37: if let & while let →</a>
</div>
