---
title: "Day 71 - Lifetime Annotations Intro"
description: "Learn about lifetime annotations intro in Rust"
---

# Day 71: Lifetime Annotations Intro

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Understand what lifetimes are, why the borrow checker needs them, and read your first "does not live long enough" error without panicking.

## 📚 The Concept (3 min)

Every reference in Rust has a **lifetime**: the span of code during which the data it points to is guaranteed to be valid. Most of the time the compiler figures lifetimes out silently. But sometimes it can't, and that's when you meet annotations like `'a`.

Here's the motivating problem. Imagine a function that takes two string slices and returns the longer one: `fn longest(x: &str, y: &str) -> &str`. The returned reference points to *either* `x` *or* `y`, the compiler can't know which one at compile time. So it can't know how long the returned reference is valid. If `y` came from a `String` that gets dropped early, and `longest` returned `y`, you'd have a dangling reference. Rust refuses to compile this ambiguity and asks you to annotate the relationship.

A lifetime annotation like `&'a str` does **not** change how long anything lives. It's purely descriptive: it tells the compiler "these references are related; the output lives at most as long as the shortest input." The borrow checker then verifies every caller respects that contract.

The key mental shift: lifetimes are not something you *set*, they're something you *describe*. The data already has a lifetime determined by scope; annotations just name it so the compiler can connect the dots between function inputs and outputs.

Today we look at why the checker complains; tomorrow (Day 72) we write the syntax to fix it.

::: tip Key Insight
Lifetime annotations never extend or shorten how long data lives. They only *describe* relationships between references so the borrow checker can prove no reference outlives its data.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The classic dangling-reference scenario the borrow checker exists to prevent:

```rust
fn main() {
    let r;
    {
        let x = 5;
        r = &x; // borrow of `x`
        println!("inside inner scope, r = {}", r); // fine here
    }
    // `x` is dropped at the end of the inner scope.
    // Uncommenting the next line is a compile error:
    // println!("r = {}", r); // error[E0597]: `x` does not live long enough
    println!("Rust prevented a dangling reference at compile time!");
}
```

### Example 2: Practical Application

A function returning a reference works fine when the compiler can see the output comes from exactly one input:

```rust
// Only one input reference, so the output's lifetime is unambiguous.
// (The compiler infers this, no annotation needed. Day 73 explains why.)
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main() {
    let sentence = String::from("lifetimes describe relationships");
    let word = first_word(&sentence);
    println!("first word: {}", word);
    println!("full sentence still usable: {}", sentence);
}
```

::: details Output
```
inside inner scope, r = 5
Rust prevented a dangling reference at compile time!
```
Example 2:
```
first word: lifetimes
full sentence still usable: lifetimes describe relationships
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Every reference has a lifetime, the region of code where the borrowed data is valid  
✅ The borrow checker rejects any reference that might outlive its data (a dangling reference)  
✅ Annotations like `'a` describe relationships between references; they never change how long data actually lives  
✅ Explicit annotations are only needed when the compiler can't infer the relationship, e.g. multiple input references feeding one output reference

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Thinking `'a` makes data "live longer", it can't; scope determines lifetime, annotations only document it
- Trying to return a reference to a local variable from a function, no annotation can fix that; return an owned value instead
- Panicking at error `E0597` ("does not live long enough"), read it simply as "this reference is used after its data was dropped"
:::

## ✅ Quick Challenge

The code below compiles, but `r` borrows the wrong variable. Change it so `r` borrows data that lives until the final `println!`, without moving the `println!`.

```rust
fn main() {
    let long_lived = String::from("I live until the end of main");
    {
        let short_lived = String::from("I die early");
        let r = &short_lived;
        println!("r = {}", r);
    }
    println!("done: {}", long_lived);
}
```

Now try moving `let r = ...` outside the inner block while still borrowing `short_lived`, observe the compiler error, then fix it by borrowing `long_lived` instead.

<details>
<summary>💡 Hint</summary>

`r` must not outlive whatever it borrows. If `r` is declared in the outer scope, it must borrow a value from the outer scope (or longer).

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let long_lived = String::from("I live until the end of main");
    let r;
    {
        // Borrowing `short_lived` here would be E0597.
        // Borrow the outer, longer-lived value instead:
        r = &long_lived;
    }
    println!("r = {}", r);
    println!("done: {}", long_lived);
}
```

Output:
```
r = I live until the end of main
done: I live until the end of main
```

The borrow now points at data that outlives `r`, so the borrow checker is satisfied.

</details>

## 📖 Additional Resources

- [The Rust Book - Validating References with Lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html)
- [Rust by Example - Lifetimes](https://doc.rust-lang.org/rust-by-example/scope/lifetime.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/">← Week 11 Overview</a>
  <a href="/week-11/day-72">Day 72: Lifetime Syntax →</a>
</div>
