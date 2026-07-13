---
title: "Day 62 - Trait Bounds"
description: "Learn about trait bounds in Rust"
---

# Day 62: Trait Bounds

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Constrain generic type parameters with trait bounds so generic code can actually *use* the values it receives, comparing, printing, adding, while staying fully type-checked.

## 📚 The Concept (3 min)

Here is the problem trait bounds solve. Write a generic `fn largest&lt;T&gt;(list: &[T]) -> &T` and try `if item > largest` inside, the compiler refuses: "binary operation `>` cannot be applied to type `&T`". And rightly so: `T` could be *anything*, including types that cannot be compared. Unlike C++ templates, Rust type-checks generic code once, at the definition, not at each call site, so the definition must declare what it needs.

A trait bound is that declaration: `fn largest&lt;T: PartialOrd&gt;(list: &[T]) -> &T` says "any `T`, as long as it implements `PartialOrd`". Now `>` works inside the function, and callers passing a non-comparable type get a clear error at the call site instead of a template-spew from the guts of your function.

Three equivalent syntaxes, from most to least compact:

1. `impl Trait` in argument position: `fn notify(item: &impl Summary)`, great for simple cases.
2. Inline bounds: `fn notify&lt;T: Summary&gt;(item: &T)`, needed when two parameters must be the *same* type.
3. `where` clauses: `fn notify&lt;T&gt;(item: &T) where T: Summary`, keeps signatures readable when bounds pile up.

Bounds also work on `impl` blocks. `impl&lt;T: Display&gt; Wrapper&lt;T&gt;` means those methods exist only when the inner type is printable, a technique called conditional implementation. This solves the "can't add `self.x + self.y`" wall you hit on Day 59: bound `T: std::ops::Add` and arithmetic compiles.

::: tip Key Insight
A trait bound is a contract checked in both directions: inside the function you may only use abilities you declared, and callers may only pass types that have them. Errors surface at the boundary with precise messages, never deep inside generic code at runtime.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The classic `largest` function, made legal with a bound:

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("largest number: {}", largest(&numbers));

    let words = vec!["pear", "apple", "zucchini", "mango"];
    println!("largest word: {}", largest(&words));
}
```

### Example 2: Practical Application

Bounds on impl blocks, methods that exist only for capable types:

```rust
use std::fmt::Display;

struct Wrapper<T> {
    value: T,
}

impl<T> Wrapper<T> {
    fn new(value: T) -> Self {
        Wrapper { value }
    }
}

// This method exists ONLY when T is printable and comparable
impl<T: Display + PartialOrd> Wrapper<T> {
    fn cmp_display(&self, other: &Wrapper<T>) {
        if self.value >= other.value {
            println!("larger value is {}", self.value);
        } else {
            println!("larger value is {}", other.value);
        }
    }
}

fn main() {
    let a = Wrapper::new(3.14);
    let b = Wrapper::new(2.71);
    a.cmp_display(&b);

    let x = Wrapper::new("hello");
    let y = Wrapper::new("world");
    x.cmp_display(&y);
}
```

::: details Output
Example 1:
```
largest number: 100
largest word: zucchini
```

Example 2:
```
larger value is 3.14
larger value is world
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `&lt;T: Trait&gt;` restricts a generic parameter to types implementing that trait, unlocking the trait's methods inside  
✅ Generic code is type-checked at the definition, you can only use abilities your bounds declare  
✅ `impl Trait`, inline `&lt;T: Trait&gt;`, and `where` clauses are three syntaxes for the same constraint  
✅ Bounds on `impl` blocks (`impl&lt;T: Display&gt; Wrapper&lt;T&gt;`) conditionally add methods only for capable inner types

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Using `==`, `&gt;`, `+`, or `println!("{}")` on an unbounded `T`, the fix is adding `PartialEq`, `PartialOrd`, `Add`, or `Display` bounds, not casting
- Confusing `fn f(a: &impl Summary, b: &impl Summary)` with `fn f&lt;T: Summary&gt;(a: &T, b: &T)`, the first allows two *different* concrete types, the second forces both arguments to be the same type
- Reaching for `T: Display` when you only need debugging output, most of your own types don't implement `Display`, but `#[derive(Debug)]` plus a `T: std::fmt::Debug` bound works everywhere
:::

## ✅ Quick Challenge

Write a generic function `print_pairs&lt;T&gt;` that takes a slice of `T` and prints each adjacent pair, marking which of the two is bigger. Choose the bounds it needs.

```rust
// Starter code
fn main() {
    let data = vec![3, 9, 4, 4, 7];
    // Call print_pairs(&data) once you've written it.
    println!("{:?}", data);
}
```

<details>
<summary>💡 Hint</summary>

You need `PartialOrd` for the comparison and `Display` for printing: `fn print_pairs&lt;T: PartialOrd + Display&gt;(items: &[T])`. Use `windows(2)` or index pairs.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::fmt::Display;

fn print_pairs<T: PartialOrd + Display>(items: &[T]) {
    for pair in items.windows(2) {
        let (a, b) = (&pair[0], &pair[1]);
        if a > b {
            println!("{} vs {}: first is bigger", a, b);
        } else if b > a {
            println!("{} vs {}: second is bigger", a, b);
        } else {
            println!("{} vs {}: equal", a, b);
        }
    }
}

fn main() {
    let data = vec![3, 9, 4, 4, 7];
    print_pairs(&data);
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Traits as Parameters](https://doc.rust-lang.org/book/ch10-02-traits.html#traits-as-parameters)
- [Rust by Example - Bounds](https://doc.rust-lang.org/rust-by-example/generics/bounds.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/day-61">← Day 61: Implementing Traits</a>
  <a href="/week-09/day-63">Day 63: Multiple Trait Bounds →</a>
</div>
