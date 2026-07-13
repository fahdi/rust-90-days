---
title: "Day 24 - String Slices Deep Dive"
description: "Learn about string slices deep dive in Rust"
---

# Day 24: String Slices Deep Dive

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Understand exactly what a `&str` is under the hood, slice strings safely with range syntax, and write functions that accept `&str` so they work with a `String`, a literal, or another slice.

## 📚 The Concept (3 min)

Yesterday you met slices in general. Today we zoom in on the most common slice in all of Rust: the string slice, `&str`.

Think of a `String` as a whole book you own, and a `&str` as a bookmark plus a sticky note that says "read from page 12 to page 47." The bookmark doesn't copy any pages — it just points into someone else's book and records how far to read. Concretely, a `&str` is a *fat pointer*: a memory address plus a length in bytes. That's the whole thing. No allocation, no ownership, no cleanup.

This explains a fact that surprises many learners: string literals like `"hello"` are already `&str` values. The text is baked into your compiled binary, and the literal is just a pointer-plus-length into that read-only data. That's why literals are `&'static str` — the data lives as long as the program does.

The range syntax `&s[a..b]` creates a slice covering bytes `a` up to (not including) `b`. Shorthands: `&s[..b]` starts at 0, `&s[a..]` runs to the end, and `&s[..]` covers everything.

Because a slice *borrows* from its source, the borrow checker guarantees the source can't be mutated or dropped while the slice is alive. A dangling string slice is a compile error, not a 3 a.m. production incident.

The practical payoff: write your function parameters as `&str`, not `&String`. A `&String` argument only accepts a `String`; a `&str` argument accepts a `String` (via automatic deref coercion), a literal, and any other slice. Same code, three times the flexibility, zero cost.

::: tip Key Insight
A `&str` is just a pointer + byte length borrowed from data owned elsewhere. Prefer `&str` over `&String` in function signatures — it accepts strings of every flavor for free.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let s = String::from("hello world");

    // Slices borrow a range of the String's bytes
    let hello: &str = &s[0..5];
    let world: &str = &s[6..11];
    println!("first: {hello}, second: {world}");

    // Shorthand ranges
    let start = &s[..5];   // same as [0..5]
    let end = &s[6..];     // to the end
    let whole = &s[..];    // the entire string
    println!("{start} / {end} / {whole}");

    // String literals ARE slices: &str pointing into the binary
    let literal: &str = "I live in the program binary";
    println!("{literal}");

    // len() works on slices too — it counts bytes
    println!("'{hello}' is {} bytes long", hello.len());
}
```

### Example 2: Practical Application

```rust
// Accepting &str makes a function work with String, literals, and slices
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(index) => &s[..index],
        None => s,
    }
}

fn domain_of(email: &str) -> Option<&str> {
    let at = email.find('@')?;
    Some(&email[at + 1..])
}

fn main() {
    let owned = String::from("Rust is fast and safe");
    let literal = "slices everywhere";

    // One function, three kinds of callers — thanks to deref coercion
    println!("{}", first_word(&owned));        // from a String
    println!("{}", first_word(literal));       // from a literal
    println!("{}", first_word(&owned[8..]));   // from another slice

    let email = "learner@rust-90-days.dev";
    match domain_of(email) {
        Some(domain) => println!("domain: {domain}"),
        None => println!("not an email"),
    }
}
```

::: details Output
```
Example 1:
first: hello, second: world
hello / world / hello world
I live in the program binary
'hello' is 5 bytes long

Example 2:
Rust
slices
fast
domain: rust-90-days.dev
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A `&str` is a fat pointer — an address plus a byte length — that borrows string data owned elsewhere  
✅ String literals are `&'static str`: slices into read-only data compiled into your binary  
✅ Range syntax `&s[a..b]` indexes by *bytes*, and `..b`, `a..`, and `..` are handy shorthands  
✅ Take `&str` instead of `&String` in function parameters — deref coercion lets callers pass a `String`, a literal, or another slice

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Slicing in the middle of a multi-byte character panics at runtime.** Indices are byte offsets, and UTF-8 characters can be 1–4 bytes. `&"héllo"[0..2]` compiles fine but panics, because `é` occupies bytes 1–2. Use `char_indices()` or methods like `find()` to get safe boundaries.
- **Mutating the source while a slice is alive.** Code like `let word = &s[..5]; s.clear(); println!("{word}");` does NOT compile — `clear()` needs a mutable borrow while `word` still holds an immutable one. The error is confusing until you remember the slice borrows from `s`.
- **Writing `fn foo(s: &String)` out of habit.** It compiles, but now callers with a literal or a slice must allocate a `String` just to call you. Clippy flags this; `&str` is strictly more useful.
:::

## ✅ Quick Challenge

Write `extension`, which returns the file extension of a filename as a slice of the input — the text after the *last* `.`. Return `None` when there is no dot (like `Makefile`). Don't allocate any new `String`.

```rust
// Starter code
fn extension(filename: &str) -> Option<&str> {
    // TODO: return the part after the last '.'
    // Return None if there is no '.' in the filename
    None
}

fn main() {
    let files = ["notes.md", "photo.tar.gz", "Makefile"];
    for f in files {
        match extension(f) {
            Some(ext) => println!("{f} -> {ext}"),
            None => println!("{f} -> no extension"),
        }
    }
}
```

<details>
<summary>💡 Hint</summary>

`str` has an `rfind` method that searches from the right and returns `Option<usize>` — the byte index of the match. Combine it with the `?` operator and a range slice starting just past the dot.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn extension(filename: &str) -> Option<&str> {
    let dot = filename.rfind('.')?;
    Some(&filename[dot + 1..])
}

fn main() {
    let files = ["notes.md", "photo.tar.gz", "Makefile"];
    for f in files {
        match extension(f) {
            Some(ext) => println!("{f} -> {ext}"),
            None => println!("{f} -> no extension"),
        }
    }
}
```

Output:

```
notes.md -> md
photo.tar.gz -> gz
Makefile -> no extension
```

Note that `photo.tar.gz` yields `gz`, because `rfind` locates the *last* dot — exactly what we want here.

</details>

## 📖 Additional Resources

- [The Rust Book - The Slice Type](https://doc.rust-lang.org/book/ch04-03-slices.html)
- [Rust by Example - Strings](https://doc.rust-lang.org/rust-by-example/std/str.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/day-23">← Day 23: Slices</a>
  <a href="/week-04/day-25">Day 25: Common Ownership Errors →</a>
</div>
