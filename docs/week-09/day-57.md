---
title: "Day 57 - Generics Basics"
description: "Learn about generics basics in Rust"
---

# Day 57: Generics Basics

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Understand what generics are and why Rust uses them, and write your first function with a type parameter that works across many concrete types.

## 📚 The Concept (3 min)

By now you've written functions that take `i32`, `String`, or `Vec` values. But what happens when the *logic* is identical and only the *type* changes? Copy-pasting `first_i32`, `first_char`, and `first_str` is a maintenance nightmare. Generics solve this: they let you write code once, with a placeholder for the type, and let the compiler fill in the concrete type at each call site.

Think of a generic like a blank on a form: "Return the first element of a slice of ____." You don't care what goes in the blank, the procedure is the same. In Rust, that blank is written as a type parameter, conventionally named `T`, declared in angle brackets right after the function name: `fn first<T>(items: &[T]) -> &T`.

Here's the part that surprises people coming from dynamic languages: generics in Rust have **zero runtime cost**. At compile time, Rust performs *monomorphization*, it stamps out a separate, fully concrete copy of your generic function for every type you actually use it with. Calling `first` on an `&[i32]` and on an `&[&str]` produces two specialized functions in the binary, each as fast as if you'd written them by hand.

You've actually been using generics since Week 4 without noticing. `Option<T>`, `Result<T, E>`, and `Vec<T>` are all generic types, `Option<u32>` and `Option<String>` are the same blueprint filled in with different types. This week just teaches you to build those blueprints yourself.

::: tip Key Insight
A generic type parameter `T` is a compile-time placeholder. Rust monomorphizes it, generating a concrete copy per type used, so generic code is exactly as fast as hand-written type-specific code.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn first<T>(items: &[T]) -> &T {
    &items[0]
}

fn main() {
    let numbers = [10, 20, 30];
    let words = ["alpha", "beta", "gamma"];

    println!("first number: {}", first(&numbers));
    println!("first word: {}", first(&words));
}
```

One function, two completely different element types. The compiler generates a version for `i32` and a version for `&str`.

### Example 2: Practical Application

```rust
fn swap<T, U>(pair: (T, U)) -> (U, T) {
    (pair.1, pair.0)
}

fn main() {
    let a = swap((1, "one"));
    let b = swap(("pi", 3.14));
    println!("{:?}", a);
    println!("{:?}", b);

    // You have been using generics all along:
    let maybe: Option<u32> = Some(7);
    if let Some(n) = maybe {
        println!("Option<u32> held {}", n);
    }
}
```

::: details Output
```
("one", 1)
(3.14, "pi")
Option<u32> held 7
```
:::

A function can take *multiple* type parameters (`T` and `U` here), and each is inferred independently from the arguments you pass.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Generics eliminate duplicated functions that differ only in type, write the logic once with a placeholder like `T`  
✅ Type parameters are declared in angle brackets after the name: `fn first<T>(items: &[T]) -> &T`  
✅ Monomorphization means generics cost nothing at runtime, the compiler stamps out a concrete copy per type used  
✅ `Option<T>`, `Result<T, E>`, and `Vec<T>` are generics you've already been using since earlier weeks

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting to declare the parameter.** Writing `fn first(items: &[T])` without the `<T>` after the function name makes the compiler complain "cannot find type `T` in this scope", the angle-bracket list is the *declaration*, the rest are *uses*.
- **Assuming you can do anything with a `T`.** Inside a plain generic function, `T` could be *any* type, so `a + b` or `a > b` does NOT compile, the compiler has no proof `T` supports those operations. You'll fix this with trait bounds on Day 62.
- **Thinking generics are like dynamic typing.** `T` is fixed to one concrete type per call at compile time. A `Vec<T>` can't hold an `i32` *and* a `String` at once, that's a different tool (trait objects, later in the course).
:::

## ✅ Quick Challenge

Write a generic function `last<T>(items: &[T]) -> Option<&T>` that returns `Some` with a reference to the last element, or `None` if the slice is empty. Call it with an integer array and a string array.

```rust
fn main() {
    let scores = [88, 92, 75];
    // TODO: write a generic function `last<T>` that returns Option<&T>
    // (Some for the last element, None for an empty slice), then call it
    // with `scores` AND with an array of &str.
    println!("{}", scores.len());
}
```

<details>
<summary>💡 Hint</summary>

Use `items.is_empty()` to guard the empty case, and `items.len() - 1` to index the last element. Returning `Option<&T>` means you never panic on an empty slice, this mirrors how `slice::last` works in the standard library.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn last<T>(items: &[T]) -> Option<&T> {
    if items.is_empty() {
        None
    } else {
        Some(&items[items.len() - 1])
    }
}

fn main() {
    let scores = [88, 92, 75];
    let names = ["Ana", "Bo"];
    let empty: [i32; 0] = [];

    println!("{:?}", last(&scores));
    println!("{:?}", last(&names));
    println!("{:?}", last(&empty));
}
```

Output:

```
Some(75)
Some("Bo")
None
```

</details>

## 📖 Additional Resources

- [The Rust Book - Generic Data Types](https://doc.rust-lang.org/book/ch10-01-syntax.html)
- [Rust by Example - Generics](https://doc.rust-lang.org/rust-by-example/generics.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/">← Week 9 Overview</a>
  <a href="/week-09/day-58">Day 58: Generic Functions →</a>
</div>
