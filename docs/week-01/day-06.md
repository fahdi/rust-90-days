---
title: "Day 6 - Functions"
description: "Learn about functions in Rust"
---

# Day 6: Functions

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

By the end of this lesson you'll be able to define your own functions with typed parameters and return values, and understand why Rust treats the last expression in a function body as the return value.

## 📚 The Concept (3 min)

You've been using a function since Day 1: `main` is the function where every Rust program starts. Today you'll write your own.

Think of a function as a vending machine: you put specific things in (parameters), something happens inside, and you get a specific thing back (the return value). The machine's front panel tells you exactly what coins it accepts and what it dispenses — and that's precisely what a Rust function signature does:

```rust
fn add(a: i32, b: i32) -> i32
```

Reading left to right: `fn` declares a function named `add`, it takes two parameters `a` and `b` (both `i32`), and the `-> i32` says it hands back an `i32`. Unlike some languages, Rust *requires* you to annotate every parameter type and the return type. This isn't busywork — signatures become contracts. The compiler uses them to catch mistakes at every call site, and other programmers use them as documentation that can never go stale.

The part that surprises newcomers: Rust is an *expression-based* language. The last expression in a function body — written **without a semicolon** — is the return value:

```rust
fn double(x: i32) -> i32 {
    x * 2   // no semicolon: this value is returned
}
```

Adding a semicolon turns an expression into a *statement*, which evaluates to nothing (the unit type, written `()` ). So `x * 2;` returns nothing, and the compiler will complain that your function promised an `i32` but delivered nothing. The `return` keyword exists too, but it's idiomatic to reserve it for early exits.

Naming convention: functions use `snake_case` — `calculate_total`, not `calculateTotal`.

::: tip Key Insight
The last expression in a function body, written without a semicolon, is the return value. A semicolon turns it into a statement that returns nothing — this one character is the difference between compiling and not.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

fn add(a: i32, b: i32) -> i32 {
    a + b // no semicolon: this expression is the return value
}

fn main() {
    greet("Rustacean");

    let sum = add(4, 6);
    println!("4 + 6 = {}", sum);

    // Functions can be called before or after their definition
    let doubled = double(21);
    println!("21 doubled is {}", doubled);
}

fn double(x: i32) -> i32 {
    x * 2
}
```

Note that `double` is defined *after* `main` — order doesn't matter, as long as the function is in scope. `greet` has no `->` arrow, meaning it returns nothing (it just performs an action).

### Example 2: Practical Application

Small, single-purpose functions compose into readable programs. Here three functions team up to build a temperature report:

```rust
fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0
}

fn describe_temp(fahrenheit: f64) -> &'static str {
    if fahrenheit >= 80.0 {
        "hot"
    } else if fahrenheit >= 50.0 {
        "mild"
    } else {
        "cold"
    }
}

fn report(city: &str, celsius: f64) {
    let f = celsius_to_fahrenheit(celsius);
    println!("{}: {}°C is {:.1}°F — {}", city, celsius, f, describe_temp(f));
}

fn main() {
    report("Lahore", 35.0);
    report("Grand Rapids", 12.0);
    report("Reykjavik", -3.0);
}
```

Notice `describe_temp`: the whole `if`/`else if`/`else` chain is an *expression*, and whichever branch runs becomes the return value — no `return` keyword needed. (The `&'static str` return type just means "a string that lives for the whole program" — string literals qualify. More on this in the ownership week.)

::: details Output
```
Hello, Rustacean!
4 + 6 = 10
21 doubled is 42
```

Example 2:
```
Lahore: 35°C is 95.0°F — hot
Grand Rapids: 12°C is 53.6°F — mild
Reykjavik: -3°C is 26.6°F — cold
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Declare functions with `fn name(param: Type) -> ReturnType { ... }` — parameter and return types are mandatory, never inferred  
✅ The last expression without a semicolon is the return value; use `return` only for early exits  
✅ A function with no `->` arrow returns the unit type `()` — it does something rather than produces something  
✅ Function definition order doesn't matter, and names use `snake_case` by convention

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **The stray semicolon.** Writing `x * 2;` as the last line of a function that declares `-> i32` fails with "mismatched types: expected `i32`, found `()`". The semicolon converted your return expression into a statement. This is the single most common beginner error with functions — this does NOT compile.
- **Omitting parameter types.** `fn add(a, b)` does NOT compile. Rust infers types for local `let` bindings, but function signatures must be fully annotated — they're the public contract of your code.
- **Expecting a value from a `println!`-only function.** `let x = greet("Sam");` compiles, but `x` is `()`, not a string — so `x + 1` or printing it as a number fails. If you need a value out, the function must declare and return one.
:::

## ✅ Quick Challenge

Write two functions for working with rectangles: `area` takes a width and height (both `u32`) and returns the area, and `is_square` takes the same parameters and returns `true` when the rectangle is a square. Call both from `main` and print the results.

```rust
// Starter code
// Write a function `area` that takes width and height (u32)
// and returns the area. Then write `is_square` that returns
// true when width equals height.

fn main() {
    // Call your functions here:
    // println!("Area: {}", area(4, 5));
    // println!("Square? {}", is_square(4, 4));
}
```

<details>
<summary>💡 Hint</summary>

`area` needs the signature `fn area(width: u32, height: u32) -> u32`. For `is_square`, remember that a comparison like `width == height` is already a `bool` expression — you can return it directly, no `if` statement required.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn area(width: u32, height: u32) -> u32 {
    width * height
}

fn is_square(width: u32, height: u32) -> bool {
    width == height
}

fn main() {
    println!("Area: {}", area(4, 5));
    println!("Square? {}", is_square(4, 4));
    println!("Square? {}", is_square(4, 5));
}
```

Output:
```
Area: 20
Square? true
Square? false
```

</details>

## 📖 Additional Resources

- [The Rust Book - Chapter 3.3: Functions](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html)
- [Rust by Example - Functions](https://doc.rust-lang.org/rust-by-example/fn.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-01/day-05">← Day 5: Tuples & Arrays</a>
  <a href="/week-01/day-07">Day 7: Control Flow →</a>
</div>
