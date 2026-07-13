---
title: "Day 58 - Generic Functions"
description: "Learn about generic functions in Rust"
---

# Day 58: Generic Functions

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Write generic functions that actually *do* something with their type parameters — comparing, selecting, and returning generic values — and learn how type inference and the turbofish decide what `T` becomes.

## 📚 The Concept (3 min)

Yesterday you wrote `first<T>`, which only moved a reference around. Real generic functions usually need to *operate* on their values: compare them, print them, clone them. The moment you try, the compiler pushes back. Write `if item > largest` inside a plain `fn largest<T>(...)` and you get: *"binary operation `>` cannot be applied to type `&T`"*. **This does NOT compile** — and that's a feature. The compiler refuses because `T` could be a type with no notion of ordering (what would `>` mean for a `File` handle?).

The fix is a *bound*: `fn largest<T: PartialOrd>(list: &[T]) -> &T`. Read it as "for any type T that can be compared with less-than/greater-than." You're making a deal with the compiler: you restrict which types are allowed in, and in exchange you're allowed to use the operations those types guarantee. We'll go deep on bounds on Day 62; today you just need `PartialOrd` to make comparisons work.

The second thing every generic function needs is an answer to "how does Rust know what `T` is?" Usually: inference. Call `pick(true, 100, 250)` and Rust sees two `i32` arguments, so `T = i32`. But sometimes there's nothing to infer from — `"42".parse()` could parse into an `i32`, an `f64`, a `u8`... When inference is ambiguous, you name the type explicitly with the *turbofish* syntax: `"42".parse::<i32>()`. The name comes from `::<>` looking vaguely like a fish. You'll use it constantly with `parse` and `collect`.

::: tip Key Insight
A generic function can only use operations its bounds guarantee. No bound = you can only move, reference, or drop a `T`. Add `T: PartialOrd` and you may compare; the bound is the contract that makes the body compile.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

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
    let chars = vec!['y', 'm', 'a', 'q'];

    println!("largest number: {}", largest(&numbers));
    println!("largest char: {}", largest(&chars));
}
```

This is the classic from the Rust Book: one `largest` for numbers, chars, strings — anything comparable.

### Example 2: Practical Application

```rust
fn pick<T>(condition: bool, a: T, b: T) -> T {
    if condition { a } else { b }
}

fn main() {
    // Type inference figures out T from the arguments
    let fee = pick(true, 100, 250);
    let tier = pick(fee > 150, "premium", "standard");
    println!("fee: {}, tier: {}", fee, tier);

    // Turbofish: name T explicitly when the compiler cannot infer it
    let parsed = "42".parse::<i32>().unwrap();
    println!("parsed + fee = {}", parsed + fee);

    let squares = (1..=5).map(|x| x * x).collect::<Vec<i32>>();
    println!("squares: {:?}", squares);
}
```

::: details Output
```
largest number: 100
largest char: y
```

Example 2:

```
fee: 100, tier: standard
parsed + fee = 142
squares: [1, 4, 9, 16, 25]
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Operations on `T` require bounds: `fn largest<T: PartialOrd>` unlocks `>` and `<` inside the body  
✅ Rust infers `T` from the arguments at each call site — `pick(true, 100, 250)` makes `T = i32` automatically  
✅ When inference can't decide (`parse`, `collect`), use the turbofish: `parse::<i32>()`, `collect::<Vec<i32>>()`  
✅ Both arguments of `pick(cond, a, b)` must be the *same* `T` — one type parameter means one concrete type per call

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Comparing without a bound.** `fn max<T>(a: T, b: T)` with `a > b` in the body fails with "binary operation `>` cannot be applied" — the bound `T: PartialOrd` is not optional, it's what *permits* the comparison.
- **Mixing types in one parameter.** `pick(true, 1, "one")` does NOT compile: `T` was inferred as an integer from the second argument, so `"one"` mismatches. If you genuinely need two types, declare two parameters (`<T, U>`).
- **A bare `collect()` with no target type.** `let v = (1..5).collect();` fails with "type annotations needed" — `collect` can build a `Vec`, `HashSet`, `String`, and more. Annotate the variable or use the turbofish.
:::

## ✅ Quick Challenge

The starter has a `smallest_i32` that only works for integers. Rewrite it as a generic `smallest<T>` (with the bound it needs) so it also works on a vector of `&str`, and print both results.

```rust
fn smallest_i32(list: &[i32]) -> &i32 {
    let mut smallest = &list[0];
    for item in list {
        if item < smallest {
            smallest = item;
        }
    }
    smallest
}

fn main() {
    let nums = vec![7, 2, 9, 4];
    println!("{}", smallest_i32(&nums));
    // TODO: rewrite smallest_i32 as a generic `smallest<T>` so this works:
    // println!("{}", smallest(&vec!["pear", "apple", "quince"]));
}
```

<details>
<summary>💡 Hint</summary>

Mirror today's `largest` example: the only operation the body uses is `<`, so the single bound `T: PartialOrd` is all you need. Change `&[i32]` / `&i32` to `&[T]` / `&T`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn smallest<T: PartialOrd>(list: &[T]) -> &T {
    let mut smallest = &list[0];
    for item in list {
        if item < smallest {
            smallest = item;
        }
    }
    smallest
}

fn main() {
    let nums = vec![7, 2, 9, 4];
    let fruits = vec!["pear", "apple", "quince"];

    println!("{}", smallest(&nums));
    println!("{}", smallest(&fruits));
}
```

Output:

```
2
apple
```

</details>

## 📖 Additional Resources

- [The Rust Book - Generic Data Types](https://doc.rust-lang.org/book/ch10-01-syntax.html)
- [Rust by Example - Generic Functions](https://doc.rust-lang.org/rust-by-example/generics/gen_fn.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/day-57">← Day 57: Generics Basics</a>
  <a href="/week-09/day-59">Day 59: Generic Structs →</a>
</div>
