---
title: "Day 49 - Closures Introduction"
description: "Learn about closures introduction in Rust"
---

# Day 49: Closures Introduction

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Write closures with Rust's `|args| body` syntax and use them to capture variables from the surrounding scope, the skill that makes iterator adapters like `map` and `filter` (which you used all week) finally click.

## 📚 The Concept (3 min)

A closure is an anonymous function you can store in a variable and pass around. You've already been using them: every time you wrote `.map(|x| x * 2)` this week, that `|x| x * 2` was a closure. Today we look at what's actually happening.

The syntax is compact: parameters go between pipes, followed by the body.

```rust
let add_one = |x: u32| -> u32 { x + 1 };  // fully annotated
let add_one = |x| x + 1;                   // inferred — same thing
```

Unlike a regular `fn`, closures usually don't need type annotations. The compiler infers types from the first call site. Note the trade-off: once you call `add_one(5)`, the closure is locked to integers, calling it later with a float won't compile, because a closure gets one concrete set of types, not generics.

The real superpower is **environment capture**. A regular function can only see its parameters and globals. A closure can reach out and grab variables from the scope where it's defined:

```rust
let tax_rate = 0.08;
let with_tax = |price: f64| price * (1.0 + tax_rate);  // captures tax_rate
```

Think of a function as a vending machine: it only works with the coins you insert (parameters). A closure is more like a personal assistant, it takes your instructions *and* remembers context from the room it was hired in. That's why `with_tax` knows about `tax_rate` without being handed it.

Rust captures variables in the least restrictive way that works: by shared reference if it only reads, by mutable reference if it mutates, and by value if it must take ownership. We'll dig into those capture modes (and the `move` keyword, plus the `Fn`/`FnMut`/`FnOnce` traits) tomorrow, today is about getting comfortable writing and calling closures.

::: tip Key Insight
A closure = an anonymous function **plus** the environment it was created in. That captured environment is what separates `|x| x * rate` from any regular `fn`, and it's why closures are the natural companions of iterator adapters.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // A closure that adds two numbers — types are inferred
    let add = |a, b| a + b;
    println!("add(3, 4) = {}", add(3, 4));

    // A closure that captures a variable from its environment
    let multiplier = 5;
    let scale = |x| x * multiplier;
    println!("scale(10) = {}", scale(10));

    // Closures can have annotated types and a block body, just like fns
    let describe = |n: i32| -> String {
        if n % 2 == 0 {
            format!("{} is even", n)
        } else {
            format!("{} is odd", n)
        }
    };
    println!("{}", describe(7));
    println!("{}", describe(12));
}
```

### Example 2: Practical Application

```rust
fn main() {
    let orders = vec![
        ("Coffee", 4.50),
        ("Sandwich", 8.25),
        ("Cookie", 2.00),
        ("Salad", 9.75),
    ];

    // Environment capture: the discount rate lives OUTSIDE the closure
    let discount_rate = 0.10;
    let apply_discount = |price: f64| price * (1.0 - discount_rate);

    // Closures shine with iterator adapters like map and filter
    let discounted: Vec<(&str, f64)> = orders
        .iter()
        .map(|(name, price)| (*name, apply_discount(*price)))
        .collect();

    println!("--- Receipt (10% off) ---");
    for (name, price) in &discounted {
        println!("{:<10} ${:.2}", name, price);
    }

    // Another closure: keep only items under a threshold
    let budget = 5.0;
    let total: f64 = discounted
        .iter()
        .filter(|(_, price)| *price < budget)
        .map(|(_, price)| price)
        .sum();

    println!("Items under ${:.2} total: ${:.2}", budget, total);
}
```

::: details Output
```
add(3, 4) = 7
scale(10) = 50
7 is odd
12 is even
```

Example 2:

```
--- Receipt (10% off) ---
Coffee     $4.05
Sandwich   $7.42
Cookie     $1.80
Salad      $8.78
Items under $5.00 total: $5.85
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Closure syntax is `|params| body`, braces are only needed for multi-line bodies  
✅ Closures capture variables from the enclosing scope; regular `fn` functions cannot  
✅ Parameter and return types are usually inferred, but get locked to one concrete type at the first call  
✅ Closures are the idiomatic argument to iterator adapters like `map`, `filter`, and `sort_by_key`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Calling an inferred closure with two different types.** `let f = |x| x; f(5); f("hi");`, this does NOT compile. Type inference locks the closure to `i32` after the first call, so the `&str` call is a type mismatch. If you need genuine polymorphism, use a generic `fn` instead.
- **Expecting a plain `fn` to capture local variables.** A nested `fn helper()` inside `main` cannot use `main`'s locals, `fn` items have no environment. If the compiler says "can't capture dynamic environment in a fn item", you wanted a closure.
- **Forgetting that capture borrows the variable.** While a closure holds a shared borrow of `threshold`, you can't mutate `threshold`, the borrow checker treats the closure like any other outstanding reference. Mutate before defining the closure, or after its last use.
:::

## ✅ Quick Challenge

You have a week of temperatures in Celsius. Write two closures, one that converts Celsius to Fahrenheit, and one that captures a `threshold` variable to decide which days are "warm", then chain them with `filter` and `map` to print every warm day in Fahrenheit.

```rust
// Starter code
fn main() {
    let temperatures = vec![18.5, 22.0, 25.3, 19.8, 30.1, 16.4];
    let threshold = 20.0;

    // TODO 1: Write a closure `to_fahrenheit` that converts Celsius to
    //         Fahrenheit: f = c * 9.0 / 5.0 + 32.0

    // TODO 2: Write a closure `is_warm` that captures `threshold` and
    //         returns true when a Celsius temperature exceeds it

    // TODO 3: Use both with iterator adapters to print each warm day
    //         in Fahrenheit

    println!("Temperatures: {:?}", temperatures);
}
```

<details>
<summary>💡 Hint</summary>

`temperatures.iter()` yields `&f64` items, so give `is_warm` a `&f64` parameter (`|c: &f64| *c > threshold`) and dereference with `*c` inside `map` before converting. `to_fahrenheit` doesn't capture anything, that's fine, closures aren't required to.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let temperatures = vec![18.5, 22.0, 25.3, 19.8, 30.1, 16.4];
    let threshold = 20.0;

    let to_fahrenheit = |c: f64| c * 9.0 / 5.0 + 32.0;
    let is_warm = |c: &f64| *c > threshold;

    let warm_days: Vec<f64> = temperatures
        .iter()
        .filter(|c| is_warm(c))
        .map(|c| to_fahrenheit(*c))
        .collect();

    println!("Warm days in Fahrenheit:");
    for f in &warm_days {
        println!("{:.1}°F", f);
    }
}
```

Output:

```
Warm days in Fahrenheit:
71.6°F
77.5°F
86.2°F
```

</details>

## 📖 Additional Resources

- [The Rust Book - Chapter 13.1: Closures](https://doc.rust-lang.org/book/ch13-01-closures.html)
- [Rust by Example - Closures](https://doc.rust-lang.org/rust-by-example/fn/closures.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/day-48">← Day 48: Custom Iterators</a>
  <a href="/week-08/">Week 8 Overview →</a>
</div>
