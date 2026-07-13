---
title: "Day 72 - Lifetime Syntax"
description: "Learn about lifetime syntax in Rust"
---

# Day 72: Lifetime Syntax

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Learn to write generic lifetime parameters, `fn longest&lt;'a&gt;(x: &'a str, y: &'a str) -> &'a str`, and understand exactly what that contract promises the compiler.

## 📚 The Concept (3 min)

Yesterday we saw *why* the compiler sometimes can't infer how long a returned reference is valid. Today we write the annotation that resolves it.

Lifetime parameters are declared in angle brackets after the function name, just like generic type parameters, and always start with an apostrophe: `'a`, `'b` (short lowercase names by convention). You then attach them to references: `&'a str` reads "a string slice valid for at least lifetime `'a`."

Take the classic example:

```text
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str
```

This says: "there exists some region of code `'a`; both inputs are valid for it, and the returned reference is valid for it too." When you call `longest`, the compiler picks the *concrete* `'a` as the **overlap** of the two arguments' lifetimes, effectively the shorter of the two. The result may only be used inside that overlap. That's the whole trick: you gave the compiler a rule it can check at every call site.

Note what this does *not* do: it doesn't keep anything alive, and it doesn't pick which input is returned. It's a constraint, not behavior. If a caller passes one long-lived and one short-lived string, and then tries to use the result after the short one is dropped, compilation fails, even if at runtime the long one would have been returned. The compiler enforces the conservative contract you wrote.

You'll also see lifetimes combined with generics and trait bounds: `fn foo&lt;'a, T: Display&gt;(x: &'a T) -> &'a T`. Same idea, lifetimes come first in the parameter list.

::: tip Key Insight
`&'a str` in a signature means "valid for *at least* `'a`". When two inputs share `'a`, the concrete lifetime chosen at the call site is the overlap of both, so the output can't be used beyond the shorter-lived argument.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The canonical `longest` function, now compiling thanks to `'a`:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("borrow checker");
    let s2 = String::from("lifetimes");
    let result = longest(&s1, &s2);
    println!("longest: {}", result);
}
```

### Example 2: Practical Application

Different lifetimes for different roles, the output is only tied to the first parameter, so the second can be short-lived:

```rust
// Output borrows only from `text`, so it gets 'a.
// `pattern` gets its own independent lifetime 'b.
fn until_pattern<'a, 'b>(text: &'a str, pattern: &'b str) -> &'a str {
    match text.find(pattern) {
        Some(i) => &text[..i],
        None => text,
    }
}

fn main() {
    let article = String::from("Rust is fast. Rust is safe.");
    let prefix;
    {
        let sep = String::from("."); // short-lived pattern
        prefix = until_pattern(&article, &sep);
    } // `sep` dropped here — but `prefix` borrows from `article`, so it's fine
    println!("prefix: {}", prefix);
}
```

::: details Output
```
longest: borrow checker
```
Example 2:
```
prefix: Rust is fast
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Lifetime parameters are declared like generics: `fn f&lt;'a&gt;(x: &'a str) -> &'a str`  
✅ Sharing one `'a` across two inputs constrains the output to the *overlap* (effectively the shorter) of their lifetimes  
✅ Use separate lifetimes (`'a`, `'b`) when a parameter doesn't flow into the output, it frees callers from unnecessary constraints  
✅ Annotations are checked contracts, not runtime behavior, they never affect what the function does

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Tying every parameter to the same `'a` out of habit, this over-constrains callers when only one input reaches the output (see Example 2)
- Returning `&'a`-annotated references to local variables, the annotation can't rescue a dangling reference; `return &local` never compiles
- Forgetting to declare the lifetime: writing `fn f(x: &'a str)` without `&lt;'a&gt;` after the function name is error `E0261` (undeclared lifetime)
:::

## ✅ Quick Challenge

Write `first_longer_than&lt;'a&gt;(items: &'a [String], min: usize) -> Option&lt;&'a str&gt;` that returns the first string longer than `min` characters. Start from this compiling skeleton:

```rust
fn first_longer_than(items: &[String], min: usize) -> Option<String> {
    // Currently clones — rewrite to return Option<&str> with a lifetime instead
    items.iter().find(|s| s.len() > min).cloned()
}

fn main() {
    let words = vec![String::from("hi"), String::from("lifetime"), String::from("ok")];
    println!("{:?}", first_longer_than(&words, 3));
}
```

<details>
<summary>💡 Hint</summary>

The output borrows from `items`, so both share `'a`: `fn first_longer_than&lt;'a&gt;(items: &'a [String], min: usize) -> Option&lt;&'a str&gt;`. Use `.find()` and `.map(|s| s.as_str())`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn first_longer_than<'a>(items: &'a [String], min: usize) -> Option<&'a str> {
    items.iter().find(|s| s.len() > min).map(|s| s.as_str())
}

fn main() {
    let words = vec![String::from("hi"), String::from("lifetime"), String::from("ok")];
    println!("{:?}", first_longer_than(&words, 3));
    println!("{:?}", first_longer_than(&words, 20));
}
```

Output:
```
Some("lifetime")
None
```

No clone needed, the returned `&str` borrows directly from the slice, and `'a` documents that relationship.

</details>

## 📖 Additional Resources

- [The Rust Book - Lifetime Annotation Syntax](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html)
- [Rust by Example - Explicit Annotation](https://doc.rust-lang.org/rust-by-example/scope/lifetime/explicit.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/day-71">← Day 71: Lifetime Annotations Intro</a>
  <a href="/week-11/day-73">Day 73: Lifetime Elision Rules →</a>
</div>
