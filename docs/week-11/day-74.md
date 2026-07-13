---
title: "Day 74 - Struct Lifetimes"
description: "Learn about struct lifetimes in Rust"
---

# Day 74: Struct Lifetimes

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Learn to store references inside structs with lifetime parameters like `struct Excerpt&lt;'a&gt;`, and understand the constraint this puts on every instance: the struct cannot outlive what it borrows.

## 📚 The Concept (3 min)

So far our structs have owned their data (`String`, `Vec`). But sometimes owning is wasteful. A parser walking through a 10 MB document shouldn't copy every token into a new `String`, it should hand out cheap `&str` slices pointing into the original buffer. To store a reference in a struct, the struct itself must declare a lifetime parameter:

```text
struct Excerpt<'a> {
    part: &'a str,
}
```

Read this as: "an `Excerpt` is generic over some lifetime `'a`, and its `part` field is a reference that must be valid for at least as long as the whole struct." The consequence flips around: **an instance of `Excerpt` cannot outlive the data `part` points to.** Drop the source `String` while an `Excerpt` still borrows it, and the borrow checker rejects the program.

This is the standard borrowed-view pattern used all over real Rust: `std::str::Split` borrows the string it splits, serde's zero-copy deserialization borrows the input buffer, regex `Captures` borrow the haystack. The struct is a lightweight *view*; the owner lives elsewhere.

Methods on such structs use the same lifetime: `impl&lt;'a&gt; Excerpt&lt;'a&gt; { ... }`. Thanks to elision rule 3 from yesterday, methods returning references rarely need extra annotations.

Design guidance: use lifetime-parameterized structs for short-lived views created and consumed nearby (parsers, iterators, search results). If the struct needs to be stored long-term, sent across threads, or returned far up the call stack, own the data instead, fighting the borrow checker to keep views alive is a sign you wanted `String` all along.

::: tip Key Insight
A struct holding `&'a T` is a *view*, and the borrow checker guarantees the view is torn down before the data it points into. If an instance must outlive its source, it can't hold a reference, it must own.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A struct borrowing a slice of a `String`:

```rust
struct Excerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();

    let excerpt = Excerpt { part: first_sentence };
    println!("excerpt: {}", excerpt.part);
    // `excerpt` must be dropped before `novel`; here both end with main, so it's fine.
}
```

### Example 2: Practical Application

A zero-copy key=value config parser, every field borrows from the one source string:

```rust
struct ConfigEntry<'a> {
    key: &'a str,
    value: &'a str,
}

impl<'a> ConfigEntry<'a> {
    fn parse(line: &'a str) -> Option<ConfigEntry<'a>> {
        let (key, value) = line.split_once('=')?;
        Some(ConfigEntry { key: key.trim(), value: value.trim() })
    }
}

fn main() {
    let source = String::from("host = localhost\nport = 8080\ninvalid line");
    for line in source.lines() {
        match ConfigEntry::parse(line) {
            Some(e) => println!("{} -> {}", e.key, e.value),
            None => println!("skipped: {:?}", line),
        }
    }
}
```

No allocation per entry, every `&str` points into `source`.

::: details Output
```
excerpt: Call me Ishmael
```
Example 2:
```
host -> localhost
port -> 8080
skipped: "invalid line"
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Structs holding references must declare a lifetime parameter: `struct S&lt;'a&gt; { field: &'a str }`  
✅ The rule it enforces: no instance of the struct may outlive the data its fields borrow  
✅ Impl blocks repeat the parameter, `impl&lt;'a&gt; S&lt;'a&gt;`, but elision keeps most method signatures clean  
✅ Borrowed structs are for short-lived zero-copy views (parsers, iterators); own the data (`String`, `Vec`) when instances need independent lifetimes

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Building a constructor that borrows a local: `fn new() -> Excerpt&lt;'???&gt;` creating a `String` inside and returning a view of it can never compile, the source dies with the function
- Storing a view struct in a longer-lived collection than its source, E0597 will point at the source, not the struct, which confuses people
- Reaching for `&'a String` as a field type, use `&'a str` (or `&'a [T]` over `&'a Vec&lt;T&gt;`); borrowing the owner type adds indirection with no benefit
:::

## ✅ Quick Challenge

Add a method `word_count(&self) -> usize` and a method `first_word(&self) -> &str` to `Excerpt`. Starter code (compiles as-is):

```rust
struct Excerpt<'a> {
    part: &'a str,
}

fn main() {
    let text = String::from("the quick brown fox");
    let ex = Excerpt { part: &text };
    println!("{}", ex.part);
    // println!("{} words, first: {}", ex.word_count(), ex.first_word());
}
```

<details>
<summary>💡 Hint</summary>

Write `impl&lt;'a&gt; Excerpt&lt;'a&gt; { ... }`. Both methods need no explicit lifetimes in their signatures, elision rule 3 ties the returned `&str` to `&self`. `split_whitespace()` gives you both answers.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Excerpt<'a> {
    part: &'a str,
}

impl<'a> Excerpt<'a> {
    fn word_count(&self) -> usize {
        self.part.split_whitespace().count()
    }

    fn first_word(&self) -> &str {
        self.part.split_whitespace().next().unwrap_or("")
    }
}

fn main() {
    let text = String::from("the quick brown fox");
    let ex = Excerpt { part: &text };
    println!("{}", ex.part);
    println!("{} words, first: {}", ex.word_count(), ex.first_word());
}
```

Output:
```
the quick brown fox
4 words, first: the
```

</details>

## 📖 Additional Resources

- [The Rust Book - Lifetime Annotations in Struct Definitions](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html#lifetime-annotations-in-struct-definitions)
- [Rust by Example - Structs with Lifetimes](https://doc.rust-lang.org/rust-by-example/scope/lifetime/struct.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/day-73">← Day 73: Lifetime Elision Rules</a>
  <a href="/week-11/day-75">Day 75: Static Lifetime →</a>
</div>
