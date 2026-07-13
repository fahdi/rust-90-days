---
title: "Day 4 - Strings vs &str"
description: "Learn about strings vs &str in Rust"
---

# Day 4: Strings vs &str

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

Understand the difference between the owned `String` type and the borrowed `&str` slice, and know which one to use in variables, function parameters, and return types.

## 📚 The Concept (3 min)

Rust has two main string types, and mixing them up is the number one source of confusion for newcomers coming from languages with a single string type.

**`String`** is an owned, growable buffer of UTF-8 text stored on the heap. You own it, you can mutate it, push more text onto it, and when it goes out of scope, Rust frees the memory. Think of it as a whiteboard you bought: you can write on it, erase it, and extend it — but you're also responsible for it.

**`&str`** (pronounced "string slice") is a borrowed *view* into string data that lives somewhere else. It's just a pointer plus a length — it doesn't own anything and can't grow. It's like a photo of part of someone's whiteboard: you can read it, but you can't write on the original through the photo, and the whiteboard must outlive your photo.

String *literals* like `"hello"` have the type `&'static str`: they're baked directly into your compiled binary, so the borrowed data lives for the entire program.

Why two types? Performance and clarity. Passing a `&str` is cheap (copying two machine words) and communicates "I only need to read this." Passing a `String` transfers ownership — the caller gives the value away. If Rust only had `String`, every function call would either move the value or force a heap copy.

The practical rules of thumb:

- **Store** text you need to keep or modify as `String`.
- **Accept** text in function parameters as `&str` — thanks to deref coercion, callers can pass either a literal or `&my_string`.
- **Return** freshly built text as `String`, because a function can't return a borrow of data it created locally (the data would be dropped at the end of the function).

::: tip Key Insight
`String` owns its text on the heap; `&str` is a cheap, read-only borrow of text that lives elsewhere. Accept `&str` in parameters, store and return `String`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // A string literal: type is &str, baked into the binary
    let greeting: &str = "Hello, Rustacean!";

    // An owned, growable String, built from a literal
    let mut name = String::from("Ada");

    // Strings can grow; &str cannot
    name.push_str(" Lovelace");

    println!("{}", greeting);
    println!("Name: {}", name);
    println!("Name length: {} bytes", name.len());

    // Borrow a &str slice from a String (cheap, no copy)
    let first_name: &str = &name[0..3];
    println!("First name slice: {}", first_name);
}
```

### Example 2: Practical Application

```rust
// Accept &str: works with literals AND borrowed Strings
fn shout(text: &str) -> String {
    format!("{}!!!", text.to_uppercase())
}

fn main() {
    // Case 1: pass a string literal directly
    let from_literal = shout("rust is fast");

    // Case 2: pass a String by reference (deref coercion: &String -> &str)
    let owned = String::from("strings are utf-8");
    let from_string = shout(&owned);

    println!("{}", from_literal);
    println!("{}", from_string);

    // `owned` is still usable — we only lent it out
    println!("Original still intact: {}", owned);
}
```

::: details Output
```
RUST IS FAST!!!
STRINGS ARE UTF-8!!!
Original still intact: strings are utf-8
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `String` is owned, heap-allocated, and growable — use it when you need to build or keep text  
✅ `&str` is a borrowed slice (pointer + length) — cheap to pass, read-only, can't outlive its owner  
✅ Function parameters should usually be `&str`; deref coercion lets callers pass `&my_string` or a literal  
✅ Convert between them with `String::from("...")` / `"...".to_string()` one way and `&my_string` (or `my_string.as_str()`) the other

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Passing a `String` where a `&str` is expected without `&`.** `shout(owned)` fails with "expected `&str`, found `String`" — you must borrow it: `shout(&owned)`. This does NOT compile because the types are genuinely different; the `&` triggers the automatic `&String` → `&str` coercion.
- **Trying to mutate through a `&str`.** Code like `let s = "hi"; s.push_str(" there");` does NOT compile — `push_str` only exists on `String`, because a slice has no buffer to grow. Convert first: `let mut s = String::from("hi");`.
- **Concatenating two `String`s with `+` directly.** `let c = a + b;` does NOT compile when both are `String` — the `+` operator needs a `&str` on the right side: `let c = a + &b;`. Also note that `+` *moves* `a`, so `a` is unusable afterward; `format!("{}{}", a, b)` avoids both surprises.
:::

## ✅ Quick Challenge

Complete the `describe` function so it accepts any text — a string literal or a borrowed `String` — and returns an owned `String` in the format `"cargo has 5 characters"`. The `main` function is already wired up to test both call styles.

```rust
// Write `describe` so it accepts BOTH a literal and a String,
// and returns an owned String like: "cargo has 5 characters"
fn describe(word: &str) -> String {
    // Your code here: use format! and word.len()
    String::new()
}

fn main() {
    let literal_result = describe("cargo");
    let owned_word = String::from("borrowing");
    let owned_result = describe(&owned_word);

    println!("{}", literal_result);
    println!("{}", owned_result);
}
```

<details>
<summary>💡 Hint</summary>

`format!` works just like `println!` but returns a `String` instead of printing. You can use `word` twice inside it: once for the text itself and once for `word.len()`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn describe(word: &str) -> String {
    format!("{} has {} characters", word, word.len())
}

fn main() {
    let literal_result = describe("cargo");
    let owned_word = String::from("borrowing");
    let owned_result = describe(&owned_word);

    println!("{}", literal_result);
    println!("{}", owned_result);
}
```

Output:

```
cargo has 5 characters
borrowing has 9 characters
```

</details>

## 📖 Additional Resources

- [The Rust Book - Storing UTF-8 Encoded Text with Strings](https://doc.rust-lang.org/book/ch08-02-strings.html)
- [Rust by Example - Strings](https://doc.rust-lang.org/rust-by-example/std/str.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-01/day-03">← Day 3: Data Types</a>
  <a href="/week-01/day-05">Day 5: Tuples & Arrays →</a>
</div>
