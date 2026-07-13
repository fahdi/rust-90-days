---
title: "Day 50 - Closure Syntax Variations"
description: "Learn about closure syntax variations in Rust"
---

# Day 50: Closure Syntax Variations

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Recognize and write every form a Rust closure can take, from fully annotated to one-line minimal, and know exactly which parts of the syntax are optional and when the compiler needs your help.

## 📚 The Concept (3 min)

Yesterday you met closures. Today we tackle a small but confusing fact: the *same* closure can be written four different ways, and you'll see all four in real codebases.

A regular function forces you to spell everything out: parameter types, return type, braces. Closures relax those rules because the compiler can usually *infer* the types from how the closure is used. Think of it like a text message versus a legal contract. A contract (a `fn`) must be explicit because strangers will read it, it's part of your public API. A text message (a closure) is between you and someone with full context, the compiler is standing right there watching how you call it, so "u no the type" is enough.

Here's the full spectrum, all equivalent:

```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }  // function, for comparison
let add_one_v2 = |x: u32| -> u32 { x + 1 }; // fully annotated closure
let add_one_v3 = |x: u32|        { x + 1 }; // return type inferred
let add_one_v4 = |x|               x + 1  ; // everything inferred
```

The rules that govern what you can drop:

1. **Parameter types** are optional *if* the compiler can infer them from a call or from context (like being passed to `.map()`).
2. **The return type** is optional, but if you *do* write `-> Type`, the body **must** be wrapped in braces.
3. **Braces** are optional when the body is a single expression.

One catch: inference happens *once*. The first call locks in the types, and the closure keeps them forever.

::: tip Key Insight
Closure syntax is regular function syntax with the ceremony made optional. Every piece you omit, the compiler infers from usage, and once inferred at the first call site, the types are locked in permanently.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Every variation side by side, producing identical results:

```rust
fn add_one_fn(x: u32) -> u32 { x + 1 }

fn main() {
    // Fully annotated closure: types and braces, just like a fn
    let add_one_v1 = |x: u32| -> u32 { x + 1 };

    // Drop the return type: Rust infers it from the body
    let add_one_v2 = |x: u32| { x + 1 };

    // Drop the braces too: single expressions don't need them
    let add_one_v3 = |x: u32| x + 1;

    // Drop everything optional: types inferred from first use
    let add_one_v4 = |x| x + 1;

    println!("fn: {}", add_one_fn(5));
    println!("v1: {}", add_one_v1(5));
    println!("v2: {}", add_one_v2(5));
    println!("v3: {}", add_one_v3(5));
    println!("v4: {}", add_one_v4(5));
}
```

### Example 2: Practical Application

Different syntax forms have natural homes, zero-parameter closures, inferred multi-parameter one-liners, and annotated multi-line bodies:

```rust
fn main() {
    let prices = vec![19.99, 5.50, 42.00, 3.25];

    // Zero-parameter closure: empty pipes
    let tax_rate = || 0.08;

    // Two parameters, types inferred from the call below
    let with_tax = |price, rate| price * (1.0 + rate);

    // Multi-line body: braces required, annotations aid readability
    let format_price = |price: f64| -> String {
        format!("${:.2}", price)
    };

    let total: f64 = prices
        .iter()
        .map(|p| with_tax(*p, tax_rate()))
        .sum();

    println!("Items: {}", prices.len());
    println!("Total with tax: {}", format_price(total));
}
```

::: details Output
```
fn: 6
v1: 6
v2: 6
v3: 6
v4: 6
```

```
Items: 4
Total with tax: $76.40
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Closures use pipes `|x|` instead of parentheses; parameter and return types are optional when inferable  
✅ A single-expression body needs no braces: `|x| x + 1` is complete  
✅ Writing an explicit return type (`-> u32`) forces you to add braces around the body  
✅ Type inference is one-shot: the first call fixes the closure's types for good

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Calling an inferred closure with two different types.** `let id = |x| x; id(5); id("hi");`, this does NOT compile. The call `id(5)` locks the parameter to an integer, so `id("hi")` is a type mismatch. Closures are not generic; if you need that, write a generic `fn`.
- **Annotating the return type without braces.** `let f = |x: u32| -> u32 x + 1;`, this does NOT compile. The grammar requires `-> Type` to be followed by a block: `|x: u32| -> u32 { x + 1 }`.
- **A closure that is never called.** `let f = |x| x + 1;` with no call site, this does NOT compile ("type annotations needed"). With nothing to infer from, the compiler can't pick a type for `x`; either call it or annotate it.
:::

## ✅ Quick Challenge

Write two closures in different styles and use them together: a zero-parameter closure `greeting` that returns `"Hello"`, and a one-line closure `shout` that uppercases a name and appends `"!"`. Use them to greet everyone in the list.

```rust
fn main() {
    let names = vec!["ada", "grace", "alan"];

    // TODO 1: write a zero-parameter closure `greeting` that returns "Hello"
    // TODO 2: write a one-line closure `shout` that uppercases a &str
    //         and appends "!" (no braces needed -- single expression)
    // TODO 3: uncomment the println! below and make it work

    for name in &names {
        // println!("{}, {}", greeting(), shout(name));
        let _ = name;
    }
}
```

<details>
<summary>💡 Hint</summary>

A zero-parameter closure is just empty pipes: `let f = || some_value;`. For `shout`, `format!("{}!", name.to_uppercase())` is a single expression, so you can skip the braces entirely. Annotate the parameter as `&str`, string methods make inference trickier.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let names = vec!["ada", "grace", "alan"];

    // Zero parameters: just empty pipes
    let greeting = || "Hello";

    // Single expression: no braces required
    let shout = |name: &str| format!("{}!", name.to_uppercase());

    for name in &names {
        println!("{}, {}", greeting(), shout(name));
    }
}
```

Output:

```
Hello, ADA!
Hello, GRACE!
Hello, ALAN!
```

</details>

## 📖 Additional Resources

- [The Rust Book - Closures](https://doc.rust-lang.org/book/ch13-01-closures.html)
- [Rust by Example - Closures](https://doc.rust-lang.org/rust-by-example/fn/closures.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/">← Week 8 Overview</a>
  <a href="/week-08/day-51">Day 51: move Closures →</a>
</div>
