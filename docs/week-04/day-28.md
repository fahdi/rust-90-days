---
title: "Day 28 - Ownership Patterns Review"
description: "Learn about ownership patterns review in Rust"
---

# Day 28: Ownership Patterns Review

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Consolidate the four core ownership patterns — move, immutable borrow, mutable borrow, and clone — and learn a simple decision rule for choosing the right one in every function signature you write.

## 📚 The Concept (3 min)

Four weeks in, you've met every ownership tool Rust gives you. Today we step back and see them as one system, because in real code the hard part isn't understanding each rule — it's choosing between them.

Think of a value as a physical book. There are exactly four things you can do with it:

1. **Move** — you *give the book away*. The new owner keeps it; you can't read it anymore. In Rust: `let b = a;` for heap types like `String`, or passing by value.
2. **Immutable borrow (`&T`)** — you *lend it for reading*. Any number of people can read it at once, but nobody may scribble in it while it's lent out.
3. **Mutable borrow (`&mut T`)** — you *lend it to an editor*. Exactly one person may hold it, and nobody else may even read it until they hand it back.
4. **Clone** — you *photocopy the whole book*. Now there are two independent copies. It works, but copying costs time and paper (allocation), so do it deliberately, not reflexively.

The decision rule that covers 90% of function signatures:

- Does the function only **read** the data? Take `&str`, `&[T]`, or `&T`.
- Does it need to **modify** the caller's data in place? Take `&mut T`.
- Does it **consume** the data — store it, transform it into something else, or end its life? Take ownership (`T`).
- Do you genuinely need **two independent copies**? Only then call `.clone()`.

Note the borrowing hierarchy: prefer `&str` over `&String` and `&[T]` over `&Vec<T>` in parameters — the flexible forms accept more callers (string literals, slices, arrays) at zero cost thanks to deref coercion.

::: tip Key Insight
Default to borrowing (`&T`), escalate to `&mut T` only to modify, take ownership only to consume — and treat `.clone()` as a deliberate design choice, never as a way to silence the borrow checker.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

All four patterns in one program:

```rust
fn main() {
    // Pattern 1: Move — ownership transfers to a new variable
    let owner = String::from("gears");
    let new_owner = owner; // `owner` can no longer be used

    // Pattern 2: Immutable borrow — read without taking ownership
    let len = measure(&new_owner);
    println!("'{}' has {} bytes", new_owner, len);

    // Pattern 3: Mutable borrow — modify in place
    let mut label = String::from("day");
    add_suffix(&mut label);
    println!("label is now '{}'", label);

    // Pattern 4: Clone — explicit deep copy when you truly need two
    let original = String::from("blueprint");
    let copy = original.clone();
    println!("original: {}, copy: {}", original, copy);
}

fn measure(s: &str) -> usize {
    s.len()
}

fn add_suffix(s: &mut String) {
    s.push_str("-28");
}
```

### Example 2: Practical Application

An inventory tracker where each function's signature announces its intent — read, modify, or consume:

```rust
// Read-only check: borrow &str so it works with String AND literals
fn is_low_stock(name: &str, count: u32) -> bool {
    !name.is_empty() && count < 5
}

// In-place update: mutable borrow of the caller's data
fn restock(inventory: &mut Vec<(String, u32)>, amount: u32) {
    for (_, count) in inventory.iter_mut() {
        if *count < 5 {
            *count += amount;
        }
    }
}

// Consuming finale: take ownership, the Vec is used up here
fn into_report(inventory: Vec<(String, u32)>) -> String {
    let mut report = String::from("=== Inventory Report ===\n");
    for (name, count) in inventory {
        report.push_str(&format!("{:<10} {}\n", name, count));
    }
    report
}

fn main() {
    let mut inventory = vec![
        (String::from("bolts"), 3),
        (String::from("gears"), 12),
        (String::from("springs"), 1),
    ];

    // Shared borrows: just reading, inventory stays usable after
    for (name, count) in &inventory {
        if is_low_stock(name, *count) {
            println!("LOW: {}", name);
        }
    }

    // Mutable borrow: restock modifies our Vec in place
    restock(&mut inventory, 10);

    // Move: inventory is consumed — we're done with it anyway
    let report = into_report(inventory);
    print!("{}", report);
}
```

::: details Output
```
LOW: bolts
LOW: springs
=== Inventory Report ===
bolts      13
gears      12
springs    11
```
:::

Notice the naming convention: `into_report` signals "this consumes its input" — the same convention the standard library uses with `into_iter`, `into_bytes`, and `into_string`.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Function signatures are ownership contracts: `&T` reads, `&mut T` modifies, `T` consumes — pick the weakest one that does the job  
✅ Prefer `&str` over `&String` and `&[T]` over `&Vec<T>` in parameters; deref coercion makes them accept more callers for free  
✅ At any moment a value has either many immutable borrows OR one mutable borrow — never both at once  
✅ `.clone()` is legitimate when you need two independent copies, but it's a red flag when used only to make a borrow-checker error go away

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Cloning your way past the borrow checker.** `process(data.clone())` compiles, but each clone heap-allocates and copies — and it usually hides a design question the compiler was asking: should this function borrow instead? Fix the signature, not the call site.
- **Taking `&String` or `&Vec<u32>` as parameters.** They compile, but a `&String` parameter rejects string literals and slices that `&str` would accept for free. Clippy flags this as `ptr_arg` for a reason.
- **Mutating a collection while iterating over it.** Calling `inventory.push(...)` inside `for item in &inventory { ... }` does NOT compile: the loop holds an immutable borrow, and `push` needs a mutable one. Collect the changes first, or use `iter_mut()` when you only modify elements in place.
:::

## ✅ Quick Challenge

The program below works, but the function signatures force `main` to clone twice. Change `shout` and `count_chars` so that `main` needs **zero** calls to `.clone()` — and still prints the original at the end.

```rust
// Starter code
fn shout(word: String) -> String {
    word.to_uppercase()
}

fn count_chars(word: String) -> usize {
    word.chars().count()
}

fn main() {
    let greeting = String::from("hello rustacean");

    let loud = shout(greeting.clone());
    let chars = count_chars(greeting.clone());

    println!("{} ({} chars)", loud, chars);
    println!("original still here: {}", greeting);
}
```

<details>
<summary>💡 Hint</summary>

Neither function stores or consumes `word` — they only read it. Apply the decision rule: read-only access means borrowing, and for strings the most flexible borrow is `&str`. Then update the call sites to pass `&greeting`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn shout(word: &str) -> String {
    word.to_uppercase()
}

fn count_chars(word: &str) -> usize {
    word.chars().count()
}

fn main() {
    let greeting = String::from("hello rustacean");

    let loud = shout(&greeting);
    let chars = count_chars(&greeting);

    println!("{} ({} chars)", loud, chars);
    println!("original still here: {}", greeting);
}
```

Output:

```
HELLO RUSTACEAN (15 chars)
original still here: hello rustacean
```

`&greeting` is a `&String`, which deref-coerces to `&str` automatically. No allocations, no clones, and `greeting` remains usable in `main` the whole time.

</details>

## 📖 Additional Resources

- [The Rust Book - Understanding Ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html)
- [Rust by Example - Ownership and Moves](https://doc.rust-lang.org/rust-by-example/scope/move.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/day-27">← Day 27: Project: Text Analyzer</a>
  <a href="/week-05/">Week 5 Overview →</a>
</div>
