---
title: "Day 11 - Project: Temperature Converter"
description: "Learn about project: temperature converter in Rust"
---

# Day 11: Project: Temperature Converter

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

Build a complete temperature converter that combines everything from Week 1 and 2, functions, `match`, loops, string parsing, and `Result`-based error handling, into one small, working program.

## 📚 The Concept (3 min)

Today is a project day. Instead of learning one new feature, you'll practice *composing* the features you already know. This is where Rust starts to click: individually, functions, `match`, and `Result` are simple; together, they form the shape of almost every real Rust program.

Think of the converter as a tiny assembly line. Raw material (a string like `"98.6F"`) enters at one end. Each station does exactly one job: one function splits the number from the unit, `parse()` turns text into an `f64`, a `match` decides which formula applies, and the result rolls off the line, or gets rejected with a clear error message if something was malformed. No station needs to know about the others; each takes an input, produces an output.

The math itself is trivial:

- Fahrenheit to Celsius: `(f - 32) × 5/9`
- Celsius to Fahrenheit: `c × 9/5 + 32`

The engineering is what matters. Notice three deliberate choices in today's code:

1. **Pure functions for the math.** `fahrenheit_to_celsius(f: f64) -> f64` takes a number and returns a number. No printing, no input reading. That makes it trivially testable and reusable.
2. **`Result` for anything that can fail.** Parsing user input can fail two ways, bad number, unknown unit, so `convert` returns `Result<String, String>` and *describes* what went wrong instead of crashing.
3. **`match` as the traffic director.** One `match` on the unit character routes to the right formula; another `match` on the `Result` decides whether to print a success or an error.

::: tip Key Insight
Separate *computation* from *input/output*. Functions that just transform values (`f64` in, `f64` out) are easy to test and reuse; keep parsing, printing, and error handling at the edges of your program.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The core formulas as pure functions, plus a loop that prints a conversion table:

```rust
fn fahrenheit_to_celsius(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}

fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}

fn main() {
    let body_temp_f = 98.6;
    let boiling_c = 100.0;

    println!("{}°F = {:.1}°C", body_temp_f, fahrenheit_to_celsius(body_temp_f));
    println!("{}°C = {:.1}°F", boiling_c, celsius_to_fahrenheit(boiling_c));

    // A quick conversion table using a loop
    println!("\n°C -> °F");
    for c in (0..=40).step_by(10) {
        let f = celsius_to_fahrenheit(c as f64);
        println!("{:>3}°C = {:>5.1}°F", c, f);
    }
}
```

Note the details: literals are `32.0` not `32` (Rust never mixes integers and floats implicitly), `{:.1}` rounds to one decimal, and `{:>5.1}` right-aligns in a 5-character column.

### Example 2: Practical Application

The full converter: it parses strings like `"100C"` or `"98.6F"`, handles bad input gracefully, and reports every outcome:

```rust
fn convert(input: &str) -> Result<String, String> {
    let input = input.trim();
    if input.len() < 2 {
        return Err(format!("'{}' is too short — expected e.g. 100F or 37.5C", input));
    }

    // Split the value from the unit (last character)
    let (value_part, unit) = input.split_at(input.len() - 1);
    let value: f64 = value_part
        .parse()
        .map_err(|_| format!("'{}' is not a valid number", value_part))?;

    match unit {
        "F" | "f" => Ok(format!("{}°F = {:.1}°C", value, (value - 32.0) * 5.0 / 9.0)),
        "C" | "c" => Ok(format!("{}°C = {:.1}°F", value, value * 9.0 / 5.0 + 32.0)),
        _ => Err(format!("unknown unit '{}' — use C or F", unit)),
    }
}

fn main() {
    let inputs = ["100C", "98.6F", "0c", "-40F", "12X", "abcF"];

    for input in inputs {
        match convert(input) {
            Ok(result) => println!("✓ {}", result),
            Err(msg) => println!("✗ {}", msg),
        }
    }
}
```

The `?` after `parse()` is doing real work: if parsing fails, `map_err` converts the parse error into our own message and `?` returns it immediately. The happy path stays flat and readable.

::: details Output
```
✓ 100°C = 212.0°F
✓ 98.6°F = 37.0°C
✓ 0°C = 32.0°F
✓ -40°F = -40.0°C
✗ unknown unit 'X' — use C or F
✗ 'abc' is not a valid number
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Keep math in pure functions (`f64` in, `f64` out) and do printing/parsing separately, small pieces compose into full programs  
✅ Float literals need the decimal point: write `32.0`, not `32`, when working with `f64`  
✅ `Result<String, String>` plus `?` and `map_err` turns bad input into helpful error messages instead of panics  
✅ Format specifiers like `{:.1}` (one decimal) and `{:>5.1}` (right-aligned, width 5) make numeric output readable

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Mixing integer and float math.** `(f - 32) * 5 / 9` does NOT compile when `f` is `f64`, Rust refuses to mix `f64` and integer literals. Even in pure integer math, `5 / 9` is `0` (integer division), which silently breaks the formula in other languages. Always write `32.0`, `5.0`, `9.0`.
- **Calling `.unwrap()` on `parse()`.** `"abc".parse::<f64>().unwrap()` compiles fine but *panics* at runtime on bad input. In anything user-facing, handle the `Result` with `match`, `?`, or `map_err` like Example 2 does.
- **Slicing strings by bytes.** `&input[..1]` panics if the string starts with a multi-byte character (like `°`). `split_at` has the same byte-index caveat, it's safe here only because we validated the input first. When unsure, iterate with `.chars()` instead of indexing.
:::

## ✅ Quick Challenge

Extend the converter with Kelvin support. Implement `celsius_to_kelvin` (Kelvin = Celsius + 273.15) and `kelvin_to_celsius`, which must return `None` for physically impossible inputs below absolute zero (negative Kelvin).

```rust
// Starter code
fn celsius_to_kelvin(c: f64) -> f64 {
    // TODO: Kelvin = Celsius + 273.15
    0.0
}

fn kelvin_to_celsius(k: f64) -> Option<f64> {
    // TODO: return None if k is below 0.0 (impossible temperature),
    // otherwise Some(k - 273.15)
    None
}

fn main() {
    println!("25°C = {}K", celsius_to_kelvin(25.0));

    match kelvin_to_celsius(300.0) {
        Some(c) => println!("300K = {:.2}°C", c),
        None => println!("Invalid: below absolute zero!"),
    }
}
```

<details>
<summary>💡 Hint</summary>

`celsius_to_kelvin` is a one-liner, just return the expression (no semicolon). For `kelvin_to_celsius`, an `if k < 0.0 { None } else { Some(...) }` expression is all you need; remember `Some(...)` wraps the successful value.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn celsius_to_kelvin(c: f64) -> f64 {
    c + 273.15
}

fn kelvin_to_celsius(k: f64) -> Option<f64> {
    if k < 0.0 {
        None
    } else {
        Some(k - 273.15)
    }
}

fn main() {
    println!("25°C = {}K", celsius_to_kelvin(25.0));

    match kelvin_to_celsius(300.0) {
        Some(c) => println!("300K = {:.2}°C", c),
        None => println!("Invalid: below absolute zero!"),
    }

    match kelvin_to_celsius(-10.0) {
        Some(c) => println!("-10K = {:.2}°C", c),
        None => println!("Invalid: below absolute zero!"),
    }
}
```

Output:

```
25°C = 298.15K
300K = 26.85°C
Invalid: below absolute zero!
```

</details>

## 📖 Additional Resources

- [The Rust Book - Programming a Guessing Game (parsing input)](https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html)
- [Rust by Example - Functions](https://doc.rust-lang.org/rust-by-example/fn.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/day-10">← Day 10: Comments & Docs</a>
  <a href="/week-02/day-12">Day 12: Modules Basics →</a>
</div>
