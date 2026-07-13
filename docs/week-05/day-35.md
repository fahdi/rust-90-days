---
title: "Day 35 - Result T, E "
description: "Learn about result t, e  in Rust"
---

# Day 35: Result&lt;T, E&gt;

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Write functions that return `Result<T, E>` instead of crashing, and handle both the success and error cases explicitly with `match` and helper methods like `unwrap_or`.

## 📚 The Concept (3 min)

Yesterday you met `Option<T>`, which answers "is there a value or not?" Today's type, `Result<T, E>`, answers a richer question: "did this operation succeed, and if not, **why**?"

`Result` is an enum with two variants:

```rust
enum Result<T, E> {
    Ok(T),   // success, carrying a value of type T
    Err(E),  // failure, carrying an error of type E
}
```

Think of it like a package delivery. When the courier rings your doorbell, you either get the box you ordered (`Ok(package)`) or a slip explaining what went wrong (`Err("address not found")`). Crucially, you always get *something*, the failure isn't silent, and the slip tells you the reason. That's the difference from `Option`: `None` just says "nothing here," while `Err(E)` carries a description of the failure.

In languages with exceptions, errors travel through an invisible side channel, any call might throw, and the function signature won't warn you. Rust puts errors in the return type itself. If a function returns `Result<f64, String>`, the compiler forces every caller to acknowledge that it might fail. You literally cannot get at the `f64` without deciding what to do about the `String` error case first.

You've already been using `Result` without noticing: `"42".parse::<i32>()` returns `Result<i32, ParseIntError>`, and file operations like `File::open` return `Result` too. It's everywhere in the standard library.

The `E` type is up to you: a `String` for quick scripts, or a custom enum (as in Example 2) when callers need to distinguish between different failure modes.

::: tip Key Insight
`Result<T, E>` makes failure part of a function's signature. The compiler forces callers to handle the error case before they can touch the success value, errors can't be silently ignored.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let good: Result<i32, std::num::ParseIntError> = "42".parse::<i32>();
    let bad: Result<i32, std::num::ParseIntError> = "4x2".parse::<i32>();

    match good {
        Ok(n) => println!("Parsed successfully: {}", n),
        Err(e) => println!("Failed to parse: {}", e),
    }

    match bad {
        Ok(n) => println!("Parsed successfully: {}", n),
        Err(e) => println!("Failed to parse: {}", e),
    }

    // Handy shortcuts when you just need a fallback
    let with_default = "oops".parse::<i32>().unwrap_or(0);
    println!("With default: {}", with_default);
}
```

### Example 2: Practical Application

A tiny ATM: `withdraw` returns `Ok` with the new balance, or a custom error enum that tells the caller exactly *why* the request failed.

```rust
#[derive(Debug)]
enum AtmError {
    InsufficientFunds { balance: f64 },
    InvalidAmount,
}

fn withdraw(balance: f64, amount: f64) -> Result<f64, AtmError> {
    if amount <= 0.0 {
        return Err(AtmError::InvalidAmount);
    }
    if amount > balance {
        return Err(AtmError::InsufficientFunds { balance });
    }
    Ok(balance - amount)
}

fn main() {
    let requests = [50.0, 500.0, -20.0];
    let balance = 120.0;

    for amount in requests {
        match withdraw(balance, amount) {
            Ok(new_balance) => {
                println!("Withdrew ${:.2}, new balance: ${:.2}", amount, new_balance)
            }
            Err(AtmError::InsufficientFunds { balance }) => {
                println!("Declined: only ${:.2} available", balance)
            }
            Err(AtmError::InvalidAmount) => {
                println!("Declined: amount must be positive")
            }
        }
    }
}
```

::: details Output
Example 1:
```
Parsed successfully: 42
Failed to parse: invalid digit found in string
With default: 0
```

Example 2:
```
Withdrew $50.00, new balance: $70.00
Declined: only $120.00 available
Declined: amount must be positive
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Result<T, E>` has two variants: `Ok(T)` for success and `Err(E)` for failure with a reason  
✅ Unlike `Option`, the `Err` variant carries data explaining *why* the operation failed  
✅ `match` gives you exhaustive handling; `unwrap_or(default)` is a quick fallback when the error details don't matter  
✅ A custom error enum (like `AtmError`) lets callers react differently to each failure mode

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Sprinkling `.unwrap()` everywhere.** `unwrap()` panics the moment it hits an `Err`, crashing your program, it turns a recoverable error back into an unrecoverable one. Fine in quick experiments; in real code, `match`, `unwrap_or`, or `?` are almost always better.
- **Forgetting that `Result` is `#[must_use]`.** If you call a function returning `Result` and ignore the return value, the compiler warns you, because a silently dropped `Err` is a bug waiting to happen. Handle it or explicitly discard it with `let _ = ...`.
- **Reaching for the value without unwrapping the `Result` first.** Writing `let n: i32 = "42".parse();` does NOT compile, `parse` gives you a `Result<i32, _>`, not an `i32`. The wrapper exists precisely so you must deal with the failure case before using the value.
:::

## ✅ Quick Challenge

Write `parse_age`, which turns user input into a validated age. It should return `Err("not a number")` when parsing fails, `Err("unrealistic age")` when the value is 0 or above 120, and `Ok(age)` otherwise.

```rust
// Starter code
fn parse_age(input: &str) -> Result<u8, String> {
    // TODO:
    // 1. Try to parse `input` into a u8
    // 2. If parsing fails, return Err("not a number".to_string())
    // 3. If the number is 0 or greater than 120, return Err("unrealistic age".to_string())
    // 4. Otherwise return Ok(age)
    Err("not implemented".to_string())
}

fn main() {
    for input in ["30", "abc", "200", "0"] {
        println!("{:?} -> {:?}", input, parse_age(input));
    }
}
```

<details>
<summary>💡 Hint</summary>

`input.parse()` returns a `Result<u8, ParseIntError>`. Use `match` on it: in the `Err(_)` arm, `return` your own error string; in the `Ok(n)` arm, keep the number and then run the range check. Note that `"200"` parses fine into a `u8` (max 255), it's your range check that must reject it.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn parse_age(input: &str) -> Result<u8, String> {
    let age: u8 = match input.parse() {
        Ok(n) => n,
        Err(_) => return Err("not a number".to_string()),
    };

    if age == 0 || age > 120 {
        return Err("unrealistic age".to_string());
    }

    Ok(age)
}

fn main() {
    for input in ["30", "abc", "200", "0"] {
        println!("{:?} -> {:?}", input, parse_age(input));
    }
}
```

Output:

```
"30" -> Ok(30)
"abc" -> Err("not a number")
"200" -> Err("unrealistic age")
"0" -> Err("unrealistic age")
```

</details>

## 📖 Additional Resources

- [The Rust Book - Recoverable Errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)
- [Rust by Example - Result](https://doc.rust-lang.org/rust-by-example/error/result.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/day-34">← Day 34: Option&lt;T&gt;</a>
  <a href="/week-06/">Week 6 Overview →</a>
</div>
