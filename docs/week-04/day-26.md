---
title: "Day 26 - Dangling References"
description: "Learn about dangling references in Rust"
---

# Day 26: Dangling References

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Understand what a dangling reference is, why Rust makes it a compile-time error instead of a runtime crash, and learn the two standard fixes: return ownership, or return a reference tied to the caller's data.

## 📚 The Concept (3 min)

A dangling reference is a pointer to memory that has already been freed. Think of it like keeping a hotel room key after checkout: the key still exists, but the room has been cleaned and handed to someone else. Using that key is at best embarrassing and at worst a disaster. In C and C++, "use-after-free" bugs like this are a leading cause of crashes and security vulnerabilities — the program compiles fine and fails unpredictably at runtime.

Rust takes a different stance: **the borrow checker refuses to compile any code that could produce a dangling reference**. It does this by tracking the lifetime of every value and every reference. A reference is only allowed to exist while the value it points to is still alive.

The classic way to try to create a dangle is returning a reference to a local variable. This does NOT compile:

```rust
fn dangle() -> &String {          // This does NOT compile
    let s = String::from("hello");
    &s                            // s is dropped at the end of this function,
}                                 // so the reference would point to freed memory
```

The compiler stops you with `missing lifetime specifier` and explains that the return value has nothing valid to borrow from. `s` is owned by the function; when the function ends, `s` is dropped and its heap memory is freed. Any reference escaping the function would outlive its data.

There are two idiomatic fixes:

1. **Return the value itself** (`String`, not `&String`). Ownership moves out to the caller, so nothing is freed early.
2. **Return a reference derived from an input reference.** If the output borrows from the caller's data, it lives exactly as long as that data — no dangle possible.

::: tip Key Insight
A reference can never outlive the value it points to. If you create data inside a function, return it by value; if the data came in as a parameter, you may return a reference into it.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
// A reference is only valid while the value it points to is alive.
fn main() {
    let message = no_dangle();
    println!("Got: {}", message);

    // A reference that stays within the owner's lifetime is fine:
    let owner = String::from("still alive");
    let r = &owner;                 // borrow starts
    println!("Borrowed: {}", r);    // borrow used while owner exists — OK
}

// FIX for the classic dangle: return the String itself (ownership moves out),
// instead of a &String pointing at a local that's about to be dropped.
fn no_dangle() -> String {
    let s = String::from("hello from inside the function");
    s // ownership moves to the caller — nothing is freed early
}
```

### Example 2: Practical Application

```rust
// Practical pattern: return a reference INTO data the caller owns.
// The returned &str borrows from `text`, so it can never dangle —
// the compiler ties its validity to the input.
fn first_word(text: &str) -> &str {
    match text.find(' ') {
        Some(index) => &text[..index],
        None => text,
    }
}

fn main() {
    let sentence = String::from("Rust prevents dangling references");

    let word = first_word(&sentence);
    println!("First word: {}", word);

    // This would NOT compile if uncommented — `word` still borrows `sentence`:
    // drop(sentence);
    // println!("{}", word);

    println!("Full sentence still usable: {}", sentence);
}
```

::: details Output
```
Got: hello from inside the function
Borrowed: still alive
First word: Rust
Full sentence still usable: Rust prevents dangling references
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A dangling reference points to freed memory — Rust rejects it at compile time, not at runtime  
✅ Returning `&String` to a local variable fails because the local is dropped when the function ends  
✅ Fix 1: return the owned value (`String`) so ownership moves to the caller  
✅ Fix 2: return a slice borrowed from an input parameter — its lifetime is tied to the caller's data

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Returning `&format!(...)` or `&vec![...]` directly.** The temporary value is dropped at the end of the expression, so the reference has nothing to point to. Bind the value to an owned variable and return it by value instead.
- **Storing a reference that outlives its source.** Pushing `&local` into a `Vec` that lives longer than `local` (or returning it from a block) fails with "borrowed value does not live long enough" — the container would hold a dangle.
- **"Fixing" the error by cloning everywhere.** `.clone()` silences the compiler but copies data you may not need to copy. First ask: should this function return ownership, or borrow from its input?
:::

## ✅ Quick Challenge

The starter below shows the safe version of `build_label` (returning an owned `String`). Add a second function, `trim_label`, that takes `&str` and returns a **reference** to the trimmed slice — no allocation, no clone. Then call it from `main` and print the result in square brackets.

```rust
// Starter code
// This function tries to hand out a reference to a local String.
// Fix it so the program compiles AND prints the label.
fn build_label(id: u32) -> String {
    // Currently returns an owned String — but imagine the buggy version:
    // fn build_label(id: u32) -> &String { &format!("user-{}", id) }  // dangles!
    // Your job: keep this signature and make main() work,
    // then add trim_label() below.
    format!("user-{}", id)
}

fn main() {
    let label = build_label(42);
    println!("{}", label);
    // TODO: call trim_label("  user-42  ") and print the result
}
```

<details>
<summary>💡 Hint</summary>

`str` already has a `.trim()` method that returns a `&str` borrowing from the original string. Your function signature should be `fn trim_label(raw: &str) -> &str` — because the output borrows from the input, the compiler knows it can never dangle.

</details>

<details>
<summary>✅ Solution</summary>

```rust
// Strategy 1: return an OWNED value when the data is created inside.
fn build_label(id: u32) -> String {
    format!("user-{}", id)
}

// Strategy 2: return a BORROWED slice when the data comes from the caller.
// The output reference is tied to the input, so it can't dangle.
fn trim_label(raw: &str) -> &str {
    raw.trim()
}

fn main() {
    let label = build_label(42);
    println!("{}", label);

    let cleaned = trim_label("  user-42  ");
    println!("[{}]", cleaned);
}
```

Output:

```
user-42
[user-42]
```

</details>

## 📖 Additional Resources

- [The Rust Book - References and Borrowing (Dangling References)](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html#dangling-references)
- [Rust by Example - Lifetimes](https://doc.rust-lang.org/rust-by-example/scope/lifetime.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/day-25">← Day 25: Common Ownership Errors</a>
  <a href="/week-04/day-27">Day 27: Project: Text Analyzer →</a>
</div>
