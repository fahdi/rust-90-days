---
title: "Day 14 - Project: CLI Calculator"
description: "Learn about project: cli calculator in Rust"
---

# Day 14: Project: CLI Calculator

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

Build a working command-line calculator that reads arguments with `std::env::args`, parses them into numbers, and reports errors cleanly with `Result` and exit codes — tying together everything from Week 2.

## 📚 The Concept (3 min)

You've spent two weeks collecting parts: ownership, `String` vs `&str`, `match`, `Result`, and yesterday's Cargo tooling. Today you assemble them into a real program. A CLI calculator is the "hello world" of real software: tiny, but it forces you through the full pipeline every command-line tool follows — **read input → validate → compute → report**.

Input arrives via `std::env::args()`, an iterator over the arguments the shell passed to your program. Two things surprise newcomers. First, the item at index 0 is the *program's own name*, so `calc 2 + 3` gives you four arguments, not three. Second, every argument is a `String` — the shell doesn't know or care that `"2"` is a number. Converting `"2"` into `2.0` is your job, via `str::parse()`, which returns a `Result` because the user might have typed `"banana"`.

That's the deeper lesson of this project: at the edge of your program, *everything is untrusted text*. Think of your calculator as a restaurant kitchen. The dining room (the shell) hands you order slips (strings). Before cooking, you check each slip: is this a dish we serve (a valid operator)? Are the quantities readable (parseable numbers)? A bad slip gets sent back with a clear note (`eprintln!` + non-zero exit code) — you don't burn the kitchen down (`panic!`).

Separating the *calculation* (a pure function returning `Result<f64, String>`) from the *I/O shell* (`main`, which parses args and prints) is the pattern to internalize. The pure core is easy to test and reuse; the messy edges stay in one place. Rust's `match` makes both halves pleasant: one `match` dispatches on the operator, another turns `Ok`/`Err` into output.

::: tip Key Insight
Validate at the boundary, then trust the core. Arguments arrive as untrusted `String`s — parse them into typed values *once*, up front, handling every `Result`. After that, your calculation logic works with clean `f64` values and never has to worry about bad input.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The pure core: a `calculate` function that maps an operator string to an operation, returning `Result` instead of panicking.

```rust
fn calculate(a: f64, op: &str, b: f64) -> Result<f64, String> {
    match op {
        "+" => Ok(a + b),
        "-" => Ok(a - b),
        "*" | "x" => Ok(a * b),
        "/" => {
            if b == 0.0 {
                Err(String::from("cannot divide by zero"))
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("unknown operator: {}", op)),
    }
}

fn main() {
    println!("{:?}", calculate(10.0, "+", 5.0));
    println!("{:?}", calculate(10.0, "/", 0.0));
    println!("{:?}", calculate(10.0, "?", 5.0));
}
```

::: details Output
```
Ok(15.0)
Err("cannot divide by zero")
Err("unknown operator: ?")
```
:::

### Example 2: Practical Application

The full tool: wire the core to real command-line arguments. Errors go to stderr and set a non-zero exit code, like a proper Unix citizen.

```rust
use std::env;
use std::process;

fn calculate(a: f64, op: &str, b: f64) -> Result<f64, String> {
    match op {
        "+" => Ok(a + b),
        "-" => Ok(a - b),
        "*" | "x" => Ok(a * b),
        "/" => {
            if b == 0.0 {
                Err(String::from("cannot divide by zero"))
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("unknown operator: {}", op)),
    }
}

fn parse_number(s: &str) -> f64 {
    match s.parse() {
        Ok(n) => n,
        Err(_) => {
            eprintln!("Error: '{}' is not a valid number", s);
            process::exit(1);
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != 4 {
        eprintln!("Usage: calc <number> <operator> <number>");
        eprintln!("Example: calc 12 x 4");
        process::exit(1);
    }

    let a = parse_number(&args[1]);
    let op = &args[2];
    let b = parse_number(&args[3]);

    match calculate(a, op, b) {
        Ok(result) => println!("{} {} {} = {}", a, op, b, result),
        Err(msg) => {
            eprintln!("Error: {}", msg);
            process::exit(1);
        }
    }
}
```

Build it with `cargo new calc`, drop this into `src/main.rs`, then run `cargo run -- 12 x 4` (the `--` separates Cargo's arguments from your program's).

::: details Output
```
$ cargo run -- 12 x 4
12 x 4 = 48

$ cargo run -- 10 / 0
Error: cannot divide by zero

$ cargo run -- 7.5 + 2.5
7.5 + 2.5 = 10
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `env::args()` yields the program name at index 0, so `calc 2 + 3` produces **four** arguments — check `args.len()` before indexing  
✅ Every argument is a `String`; use `parse()` (which returns a `Result`) to convert text to numbers, and handle the `Err` case  
✅ Keep the calculation pure (`fn calculate(...) -> Result<f64, String>`) and confine I/O, `eprintln!`, and `process::exit` to `main`  
✅ Report failures on stderr with a non-zero exit code instead of panicking — that's what makes a CLI tool script-friendly

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the program name is `args[0]`.** Learners write `args[0]` expecting the first number and get something like `target/debug/calc`, which fails to parse. Your operands live at indices 1 and 3.
- **Passing `*` for multiplication in the shell.** The shell expands a bare `*` into every filename in the current directory before your program ever runs, so `calc 3 * 4` may receive a dozen arguments. Quote it (`'*'`) or accept an alternative like `x`, as we did.
- **Calling `parse()` without telling Rust the target type.** `let a = args[1].parse();` alone can't infer what to parse into. This does NOT compile — you must anchor the type somewhere, e.g. `let a: f64 = args[1].parse().unwrap();` or `args[1].parse::<f64>()`.
:::

## ✅ Quick Challenge

Extend the calculator's core with two new operators: `%` (remainder) and `^` (power). Remainder by zero should return an `Err`, just like division. The starter below compiles as-is — make the two commented test lines print `Ok(1.0)` and `Ok(1024.0)`.

```rust
// Starter code
fn calculate(a: f64, op: &str, b: f64) -> Result<f64, String> {
    match op {
        "+" => Ok(a + b),
        // TODO: add "%" (remainder) and "^" (power)
        _ => Err(format!("unknown operator: {}", op)),
    }
}

fn main() {
    println!("{:?}", calculate(2.0, "+", 3.0));
    println!("{:?}", calculate(10.0, "%", 3.0)); // should print Ok(1.0)
    println!("{:?}", calculate(2.0, "^", 10.0)); // should print Ok(1024.0)
}
```

<details>
<summary>💡 Hint</summary>

Add two new arms to the `match`. Rust's `%` operator works on `f64` directly, but guard against `b == 0.0` first. For power, there's no `^` math operator in Rust (`^` is bitwise XOR on integers) — use the method `a.powf(b)` instead.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn calculate(a: f64, op: &str, b: f64) -> Result<f64, String> {
    match op {
        "+" => Ok(a + b),
        "%" => {
            if b == 0.0 {
                Err(String::from("cannot take remainder of division by zero"))
            } else {
                Ok(a % b)
            }
        }
        "^" => Ok(a.powf(b)),
        _ => Err(format!("unknown operator: {}", op)),
    }
}

fn main() {
    println!("{:?}", calculate(2.0, "+", 3.0));
    println!("{:?}", calculate(10.0, "%", 3.0)); // Ok(1.0)
    println!("{:?}", calculate(2.0, "^", 10.0)); // Ok(1024.0)
}
```

Output:

```
Ok(5.0)
Ok(1.0)
Ok(1024.0)
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 12: An I/O Project (accepting command line arguments)](https://doc.rust-lang.org/book/ch12-01-accepting-command-line-arguments.html)
- [Rust by Example - Program arguments](https://doc.rust-lang.org/rust-by-example/std_misc/arg.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/day-13">← Day 13: Cargo Fundamentals</a>
  <a href="/week-03/">Week 3 Overview →</a>
</div>
