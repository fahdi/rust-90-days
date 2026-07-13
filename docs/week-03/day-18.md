---
title: "Day 18 - Move Semantics"
description: "Learn about move semantics in Rust"
---

# Day 18: Move Semantics

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

Understand exactly what happens when a value is "moved" in Rust, predict which assignments and function calls invalidate a variable, and design functions that hand ownership back to the caller.

## 📚 The Concept (3 min)

Yesterday you learned the ownership rules. Today we zoom in on the mechanism that enforces rule number one: **the move**.

Think of a heap value like a `String` as a house, and the variable as the deed to that house. When you write `let s2 = s1;`, Rust doesn't build a second house, it signs the deed over to `s2`. There is still exactly one house, but `s1` no longer holds the deed. Trying to use `s1` afterward is like trying to sell a house you already sold: the compiler stops you at the door.

Why does Rust do this instead of copying? Under the hood, a `String` is a small stack-side struct (pointer, length, capacity) pointing at heap data. A move copies only that tiny struct and marks the old variable invalid. This is *cheap*, no heap allocation, no byte-by-byte copy, and it guarantees exactly one owner will free the heap memory. No double-frees, no leaks, no garbage collector.

Moves happen in more places than plain assignment:

- **Assignment:** `let b = a;` moves heap-owning values.
- **Function calls:** passing a `String` to `fn eat(s: String)` moves it into the function; it's dropped when the function ends unless returned.
- **Returns:** returning a value moves ownership *out* to the caller.
- **Consuming iterators:** `into_iter()` moves each element out of a collection.

Simple scalar types (`i32`, `bool`, `char`, `f64`) live entirely on the stack and implement `Copy`, so assignment duplicates them and the original stays valid. That's why integers "don't move" but Strings do, more on `Copy` and `Clone` tomorrow.

::: tip Key Insight
A move transfers ownership without copying heap data, the old variable is invalidated at *compile time*, so there is never a moment when two owners could free the same memory.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Stack values: copied, both remain usable
    let x = 5;
    let y = x;
    println!("x = {}, y = {}", x, y);

    // Heap values: moved, only the new owner is usable
    let s1 = String::from("hello");
    let s2 = s1; // ownership of the heap data moves to s2
    println!("s2 = {}", s2);
    // println!("{}", s1); // ERROR: s1 was moved

    // A move also happens when passing to a function
    let greeting = String::from("good morning");
    take_ownership(greeting);
    // greeting is no longer valid here
}

fn take_ownership(msg: String) {
    println!("I now own: {}", msg);
} // msg is dropped here; its memory is freed
```

### Example 2: Practical Application

A common pattern: move data through a pipeline of functions, with each stage consuming its input and returning a new owned value.

```rust
fn main() {
    let raw_lines = vec![
        String::from("  alice  "),
        String::from("  bob"),
        String::from("carol  "),
    ];

    // raw_lines is MOVED into clean_names; we hand off the whole pipeline
    let cleaned = clean_names(raw_lines);

    // clean_names gave us ownership of a brand-new Vec back
    for name in &cleaned {
        println!("cleaned: {:?}", name);
    }

    let report = build_report(cleaned); // move again
    println!("{}", report);
}

// Takes ownership, transforms, returns ownership of the result
fn clean_names(names: Vec<String>) -> Vec<String> {
    names
        .into_iter() // consumes the Vec, moving each String out
        .map(|n| n.trim().to_string())
        .collect()
}

fn build_report(names: Vec<String>) -> String {
    format!("Report: {} attendees -> {}", names.len(), names.join(", "))
}
```

::: details Output
```
x = 5, y = 5
s2 = hello
I now own: good morning
cleaned: "alice"
cleaned: "bob"
cleaned: "carol"
Report: 3 attendees -> alice, bob, carol
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `let b = a;` on a heap-owning type moves ownership, `a` becomes invalid at compile time, and no heap data is copied  
✅ Passing a value into a function moves it; the function drops it at the end unless it returns it back out  
✅ Returning a value moves ownership to the caller, this is how factory functions like `String::from` work  
✅ Stack-only types like `i32` and `bool` are `Copy`, so assignment duplicates them instead of moving

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a variable after passing it to a function.** `process(data); println!("{}", data);` fails with "value borrowed here after move", the function call was a move, not a loan. Either return the value from the function or (as you'll learn on Day 20) pass a reference with `&data`.
- **Reaching for `.clone()` everywhere to silence the compiler.** It works, but each clone allocates and copies the whole heap buffer. Cloning a 10 MB `String` in a loop is a real performance bug. Treat `.clone()` as a deliberate choice, not a reflex.
- **Expecting `String` to behave like `i32`.** `let b = a; println!("{}", a);` is fine for integers (`Copy`) but a compile error for Strings (moved). This example does NOT compile for `String`, the difference is whether the type owns heap data.
:::

## ✅ Quick Challenge

The code below compiles, but `msg` is gone after the call to `shout`. Modify `shout` so `main` can print **both** the original message and the shouted version, without calling `.clone()`.

```rust
// Starter code
fn shout(message: String) -> String {
    message.to_uppercase()
}

fn main() {
    let msg = String::from("rust moves fast");

    // TODO: call shout(msg), then print BOTH the original
    // message and the shouted one, without using .clone()

    println!("{}", shout(msg));
}
```

<details>
<summary>💡 Hint</summary>

A function that takes ownership can also *give it back*. Change the return type to a tuple so `shout` moves the original `String` out to the caller along with the uppercase version. Destructure the tuple in `main` with `let (original, loud) = ...`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
// Return both the original and the shouted version,
// transferring ownership back to the caller.
fn shout(message: String) -> (String, String) {
    let loud = message.to_uppercase();
    (message, loud) // move both out to the caller
}

fn main() {
    let msg = String::from("rust moves fast");

    let (original, loud) = shout(msg); // msg moves in, two Strings move out

    println!("original: {}", original);
    println!("shouted:  {}", loud);
}
```

Output:

```
original: rust moves fast
shouted:  RUST MOVES FAST
```

This "move in, move back out" pattern is real but clunky, which is exactly why Rust has references and borrowing, coming up on Day 20.

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 4.1: What is Ownership? (Moves)](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
- [Rust by Example - Ownership and Moves](https://doc.rust-lang.org/rust-by-example/scope/move.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/day-17">← Day 17: Ownership Rules</a>
  <a href="/week-03/day-19">Day 19: Clone & Copy Traits →</a>
</div>
