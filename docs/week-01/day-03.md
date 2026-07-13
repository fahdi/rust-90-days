---
title: "Day 3 - Data Types"
description: "Learn about data types in Rust"
---

# Day 3: Data Types

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

By the end of this lesson you'll be able to choose the right scalar type (integer, float, bool, char) for a value, group related values with tuples and arrays, and convert between numeric types with `as`.

## 📚 The Concept (3 min)

Rust is a **statically typed** language: the compiler must know the type of every value at compile time. Most of the time it figures types out on its own (that's *type inference*), but when several types are possible, like parsing a string into a number, you have to annotate.

Think of types as differently sized boxes in a warehouse. A `u8` is a tiny box that holds whole numbers from 0 to 255, perfect for an age or a color channel. An `i64` is a huge box that holds numbers into the quintillions, positive or negative. Picking the right box matters: a small box overflows if you stuff too much in, and using giant boxes everywhere wastes space.

Rust's **scalar types** come in four groups:

- **Integers**: signed `i8`, `i16`, `i32`, `i64`, `i128`, `isize` and unsigned `u8` through `u128`, `usize`. The default is `i32`. The `u` types can never be negative.
- **Floating point**: `f32` and `f64` (the default). These hold decimals like `3.14`.
- **Boolean**: `bool`, either `true` or `false`.
- **Character**: `char`, a single Unicode scalar value written in *single* quotes, it can hold `'A'`, `'ß'`, or even `'🦀'` (it's 4 bytes, not 1).

Rust also has two built-in **compound types**: a *tuple* groups a fixed number of values of possibly different types, like `("Coffee", 12.99, 3)`, and an *array* holds a fixed number of values of the *same* type, like `[u32; 5]`.

One thing that surprises newcomers: Rust never converts numbers implicitly. Adding an integer to a float without an explicit `as` cast is a compile error, not a silent coercion.

::: tip Key Insight
Rust never silently converts between numeric types. If you want a `u32` to act like an `f64`, you must say so explicitly with `as`, the compiler forces every conversion to be visible in your code.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Integers: signed (i) and unsigned (u), sized in bits
    let age: u8 = 34;              // 0 to 255
    let population: i64 = 8_100_000_000; // underscores for readability

    // Floats: f32 and f64 (default)
    let pi: f64 = 3.14159;

    // Boolean
    let is_learning_rust: bool = true;

    // Character: a single Unicode scalar, in single quotes
    let grade: char = 'A';
    let emoji: char = '🦀';

    println!("age: {} (u8)", age);
    println!("population: {} (i64)", population);
    println!("pi: {} (f64)", pi);
    println!("learning rust: {}", is_learning_rust);
    println!("grade: {} {}", grade, emoji);
}
```

### Example 2: Practical Application

A tiny point-of-sale calculation that mixes tuples, arrays, and explicit numeric conversion:

```rust
fn main() {
    // A tuple groups values of different types
    let item: (&str, f64, u32) = ("Coffee beans", 12.99, 3);
    let (name, price, quantity) = item; // destructuring

    // Integer math stays integer; convert with `as` for float math
    let subtotal = price * quantity as f64;
    let tax_rate: f64 = 0.06;
    let total = subtotal + subtotal * tax_rate;

    println!("Item: {}", name);
    println!("Subtotal: ${:.2}", subtotal);
    println!("Total with tax: ${:.2}", total);

    // An array: fixed length, all elements the same type
    let weekly_sales: [u32; 5] = [120, 95, 143, 110, 87];
    let sum: u32 = weekly_sales.iter().sum();
    println!("Units sold this week: {}", sum);
    println!("Average per day: {}", sum / weekly_sales.len() as u32);
}
```

::: details Output
```
Item: Coffee beans
Subtotal: $38.97
Total with tax: $41.31
Units sold this week: 555
Average per day: 111
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Rust infers most types, but ambiguous cases (like `"42".parse()`) need an annotation such as `let n: u32 = ...`  
✅ Integer types encode size and sign in the name: `u8` is 0 to 255, `i32` is the default, `usize` indexes collections  
✅ `char` uses single quotes and holds any Unicode scalar (4 bytes), it is not a 1-byte C-style char  
✅ Numeric conversions are always explicit: `quantity as f64`, mixing `u32` and `f64` without a cast won't compile

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Mixing numeric types in arithmetic.** `let x: u32 = 3; let y = 2.5 * x;`, this does NOT compile. Rust refuses to guess whether you wanted float or integer math; write `2.5 * x as f64` instead.
- **Confusing `'a'` with `"a"`.** Single quotes make a `char`, double quotes make a string slice. `let c: char = "a";` does NOT compile, the types are completely different.
- **Expecting integer division to produce decimals.** `5 / 2` is `2`, not `2.5`, because both operands are integers. Cast first (`5 as f64 / 2 as f64`) or use float literals (`5.0 / 2.0`) when you need the fractional part.
:::

## ✅ Quick Challenge

Convert a Celsius temperature to Fahrenheit using the formula `(C × 9/5) + 32`, then use a `bool` to record whether it's a hot day (above 80.0°F). Print all three values.

```rust
// Starter code
fn main() {
    let celsius: f64 = 27.5;

    // 1. Convert celsius to fahrenheit: (C * 9/5) + 32
    // 2. Store whether it is above 80.0 F in a bool called `is_hot`
    // 3. Print both values

    println!("Temperature: {}°C", celsius);
}
```

<details>
<summary>💡 Hint</summary>

Use float literals (`9.0`, `5.0`, `32.0`) in the formula so all the math stays in `f64`, no casting needed. A comparison like `fahrenheit > 80.0` already produces a `bool`, so you can assign it directly.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let celsius: f64 = 27.5;

    let fahrenheit = (celsius * 9.0 / 5.0) + 32.0;
    let is_hot: bool = fahrenheit > 80.0;

    println!("Temperature: {}°C", celsius);
    println!("That is {:.1}°F", fahrenheit);
    println!("Hot day? {}", is_hot);
}
```

Output:

```
Temperature: 27.5°C
That is 81.5°F
Hot day? true
```

</details>

## 📖 Additional Resources

- [The Rust Book - Data Types](https://doc.rust-lang.org/book/ch03-02-data-types.html)
- [Rust by Example - Primitives](https://doc.rust-lang.org/rust-by-example/primitives.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-01/day-02">← Day 2: Variables & Mutability</a>
  <a href="/week-01/day-04">Day 4: Strings vs &str →</a>
</div>
