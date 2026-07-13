---
title: "Day 41 - Error Handling Strategies"
description: "Learn about error handling strategies in Rust"
---

# Day 41: Error Handling Strategies

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 6</span>
</div>

## 🎯 Today's Goal

Choose the right error handling strategy for any situation, panic, `Option`, `Result` with a custom error type, or automatic error conversion with `From`, and design error enums that make failures self-explanatory.

## 📚 The Concept (3 min)

By now you know the mechanics: `panic!`, `Option`, `Result`, and the `?` operator. Today is about *strategy*, deciding which tool fits which failure.

Think of it like a hospital triage desk. Some situations are unrecoverable emergencies: a bug in your own logic, an impossible state. That's `panic!` territory, stop everything, because continuing would make things worse. Some situations are simple absences: a key isn't in the map, a list is empty. That's `Option`, "nothing here" is a normal answer, not a failure. And some situations are genuine, expected failures with a *reason*: the file doesn't exist, the input isn't a number, the network dropped. That's `Result`, the caller deserves to know what went wrong and decide what to do about it.

The intermediate-level skill is designing the `E` in `Result<T, E>`. Three common strategies, in increasing order of polish:

1. **`String` errors**, fine for quick scripts, but callers can't match on them.
2. **A custom error enum**, one variant per failure mode. Callers can `match` and react differently to each. Implement `Display` for human-readable messages and `std::error::Error` so it composes with the rest of the ecosystem.
3. **`From` conversions**, when your function calls code that returns *other* error types (like `ParseIntError`), implement `From` so the `?` operator converts them into your error type automatically. No manual `map_err` at every call site.

Libraries usually expose custom error enums (so users can react precisely); applications often collapse everything into one app-level error type near `main`.

::: tip Key Insight
The error type is part of your API. A well-designed error enum tells callers *every way* a function can fail, the compiler then forces them to handle each one. `panic!` is only for bugs, never for expected failures.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A custom error enum with one variant per failure mode, plus `Display` so errors print nicely:

```rust
use std::fmt;

#[derive(Debug)]
enum ConfigError {
    MissingKey(String),
    InvalidPort(String),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::MissingKey(key) => write!(f, "missing key: {}", key),
            ConfigError::InvalidPort(value) => write!(f, "invalid port: {}", value),
        }
    }
}

impl std::error::Error for ConfigError {}

fn get_port(config: &str) -> Result<u16, ConfigError> {
    let line = config
        .lines()
        .find(|l| l.starts_with("port="))
        .ok_or_else(|| ConfigError::MissingKey("port".to_string()))?;

    let value = &line["port=".len()..];
    value
        .parse()
        .map_err(|_| ConfigError::InvalidPort(value.to_string()))
}

fn main() {
    let good = "host=localhost\nport=8080";
    let bad = "host=localhost\nport=eighty";

    match get_port(good) {
        Ok(port) => println!("Connecting on port {}", port),
        Err(e) => println!("Config error: {}", e),
    }

    match get_port(bad) {
        Ok(port) => println!("Connecting on port {}", port),
        Err(e) => println!("Config error: {}", e),
    }
}
```

Note the two strategies inside `get_port`: `ok_or_else` upgrades an `Option` into a `Result`, and `map_err` translates a foreign error (`ParseIntError`) into our own type.

### Example 2: Practical Application

Implementing `From` lets `?` do the error conversion for you, no `map_err` needed:

```rust
use std::fmt;
use std::num::ParseIntError;

#[derive(Debug)]
enum AgeError {
    NotANumber(ParseIntError),
    OutOfRange(i64),
}

impl fmt::Display for AgeError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AgeError::NotANumber(e) => write!(f, "not a number ({})", e),
            AgeError::OutOfRange(n) => write!(f, "{} is not a realistic age", n),
        }
    }
}

impl std::error::Error for AgeError {}

// This impl is what lets `?` convert ParseIntError -> AgeError for us
impl From<ParseIntError> for AgeError {
    fn from(e: ParseIntError) -> Self {
        AgeError::NotANumber(e)
    }
}

fn parse_age(input: &str) -> Result<u8, AgeError> {
    let n: i64 = input.trim().parse()?; // ParseIntError auto-converts via From
    if !(0..=130).contains(&n) {
        return Err(AgeError::OutOfRange(n));
    }
    Ok(n as u8)
}

fn main() {
    for input in ["42", "abc", "200"] {
        match parse_age(input) {
            Ok(age) => println!("{:?} -> valid age: {}", input, age),
            Err(e) => println!("{:?} -> error: {}", input, e),
        }
    }
}
```

::: details Output
```
Connecting on port 8080
Config error: invalid port: eighty
```

Example 2:

```
"42" -> valid age: 42
"abc" -> error: not a number (invalid digit found in string)
"200" -> error: 200 is not a realistic age
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Match the tool to the failure: `panic!` for bugs, `Option` for normal absence, `Result` for expected failures with a reason  
✅ A custom error enum with one variant per failure mode lets callers `match` and react precisely  
✅ Implement `Display` and `std::error::Error` on your error types so they print well and compose with other libraries  
✅ Implementing `From<OtherError>` for your error type makes `?` convert foreign errors automatically, no `map_err` at every call site

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using `String` as the error type everywhere.** `Result<T, String>` compiles, but callers can only display the message, they can't `match` on failure kinds to retry, prompt again, or fall back. Enums make each failure a distinct, handleable case.
- **Panicking on expected failures.** Calling `.unwrap()` on user input like `"abc".parse::<u16>().unwrap()` crashes the whole program on bad input. Reserve `unwrap`/`expect` for cases you can *prove* can't fail (or for quick prototypes and tests).
- **Forgetting the `From` impl and expecting `?` to convert.** If `parse_age` returned `Result<u8, AgeError>` but had no `impl From<ParseIntError> for AgeError`, then `let n: i64 = input.parse()?;` would fail with "the trait `From<ParseIntError>` is not implemented", this does NOT compile. The `?` operator only converts errors when a matching `From` impl exists.
:::

## ✅ Quick Challenge

Refactor `divide` so it stops panicking and instead returns `Result<f64, DivisionByZero>`, where `DivisionByZero` is your own error type implementing `Display` and `std::error::Error`. Then handle both the success and failure cases in `main` with a `match`.

```rust
// Starter code: refactor divide() to return a Result instead of panicking
fn divide(a: f64, b: f64) -> f64 {
    if b == 0.0 {
        panic!("division by zero!"); // replace this strategy
    }
    a / b
}

fn main() {
    println!("10 / 2 = {}", divide(10.0, 2.0));
    // Uncommenting this line would crash the program:
    // println!("10 / 0 = {}", divide(10.0, 0.0));
}
```

<details>
<summary>💡 Hint</summary>

A unit struct (`struct DivisionByZero;`) works fine as an error type when there's only one failure mode, no enum needed. Derive `Debug`, write a short `impl fmt::Display`, add the empty `impl std::error::Error for DivisionByZero {}`, and change the return type to `Result<f64, DivisionByZero>`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::fmt;

#[derive(Debug)]
struct DivisionByZero;

impl fmt::Display for DivisionByZero {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "cannot divide by zero")
    }
}

impl std::error::Error for DivisionByZero {}

fn divide(a: f64, b: f64) -> Result<f64, DivisionByZero> {
    if b == 0.0 {
        Err(DivisionByZero)
    } else {
        Ok(a / b)
    }
}

fn main() {
    match divide(10.0, 2.0) {
        Ok(result) => println!("10 / 2 = {}", result),
        Err(e) => println!("Error: {}", e),
    }

    match divide(10.0, 0.0) {
        Ok(result) => println!("10 / 0 = {}", result),
        Err(e) => println!("Error: {}", e),
    }
}
```

Output:

```
10 / 2 = 5
Error: cannot divide by zero
```

</details>

## 📖 Additional Resources

- [The Rust Book - Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Rust by Example - Error Handling](https://doc.rust-lang.org/rust-by-example/error.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-06/day-40">← Day 40: Project: Config Parser</a>
  <a href="/week-06/day-42">Day 42: Project: JSON-like Data Structure →</a>
</div>
