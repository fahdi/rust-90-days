---
title: "Day 9 - Pattern Matching"
description: "Learn about pattern matching in Rust"
---

# Day 9: Pattern Matching

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

By the end of this lesson you'll be able to use `match` to branch on values, ranges, and multiple patterns at once, and understand why the compiler forces you to handle every possible case.

## 📚 The Concept (3 min)

Yesterday you wrote loops with `if`/`else` chains to make decisions. Today you meet `match`, Rust's most powerful control-flow tool, think of it as a `switch` statement that went to the gym.

A `match` takes a value and compares it against a series of **patterns**, top to bottom. The first pattern that fits wins, and its arm runs. Picture a coin sorting machine: you drop a coin in the top, and it falls through a series of slots until it hits the one shaped exactly like it. Each slot is a pattern; the coin is your value.

What makes `match` special compared to a `switch` in C or JavaScript:

1. **It's exhaustive.** The compiler checks that your patterns cover *every* possible value. Match on a `u8` and forget a case? Compile error. This eliminates a whole class of "oops, I forgot that scenario" bugs before your program ever runs.
2. **It's an expression.** Like `if` in Rust, a `match` produces a value, so you can write `let label = match score { ... };` and assign the result directly.
3. **Patterns are rich.** You can match exact values (`5`), several values at once (`2 | 3`), inclusive ranges (`1..=6`), destructure tuples (`(x, 0)`), and add extra conditions with guards (`t if t < -10`).

The underscore pattern `_` is the "everything else" slot at the bottom of the machine, it matches any value you haven't handled explicitly. You'll use it constantly, but place it last: patterns are tried in order, and `_` swallows everything that reaches it.

Pattern matching becomes even more powerful next week when you meet enums like `Option` and `Result`, `match` is *the* way to work with them. Today builds that muscle on simple values.

::: tip Key Insight
`match` is **exhaustive**: the compiler refuses to build your program unless every possible value is handled. This turns forgotten edge cases from runtime surprises into compile-time errors.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let dice_roll = 4;

    match dice_roll {
        1 => println!("Critical fail!"),
        2 | 3 => println!("Not great..."),
        4 | 5 => println!("Pretty good!"),
        6 => println!("Critical success!"),
        _ => println!("That's not a valid die"),
    }

    // match is an expression: it returns a value
    let description = match dice_roll {
        1..=2 => "low",
        3..=4 => "mid",
        5..=6 => "high",
        _ => "invalid",
    };
    println!("Your roll of {dice_roll} is {description}");
}
```

Note the three pattern styles: exact values (`1`), multiple options with `|` (`2 | 3`), and inclusive ranges (`1..=2`). The `_` arm handles every other `i32`, which keeps the compiler happy.

### Example 2: Practical Application

```rust
fn categorize_temp(celsius: i32) -> &'static str {
    match celsius {
        t if t < -10 => "dangerously cold",
        -10..=0 => "freezing",
        1..=15 => "chilly",
        16..=25 => "comfortable",
        26..=35 => "hot",
        _ => "extreme heat",
    }
}

fn main() {
    let readings = [-15, -3, 12, 22, 31, 40];

    for temp in readings {
        println!("{temp}°C → {}", categorize_temp(temp));
    }

    // Destructuring a tuple in a match
    let point = (0, 7);
    match point {
        (0, 0) => println!("Point is at the origin"),
        (x, 0) => println!("Point is on the x-axis at x={x}"),
        (0, y) => println!("Point is on the y-axis at y={y}"),
        (x, y) => println!("Point is at ({x}, {y})"),
    }
}
```

Two new tricks here: a **match guard** (`t if t < -10`) adds a boolean condition to a pattern, and tuple patterns **destructure** the value, binding its parts to names like `x` and `y` that you can use inside the arm.

::: details Output
```
-15°C → dangerously cold
-3°C → freezing
12°C → chilly
22°C → comfortable
31°C → hot
40°C → extreme heat
Point is on the y-axis at y=7
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `match` compares a value against patterns top to bottom; the first matching arm runs  
✅ Matches must be exhaustive, cover every case or add a `_` catch-all arm  
✅ Patterns can be exact values, `|` alternatives, `1..=6` ranges, tuple destructuring, and `if` guards  
✅ `match` is an expression: every arm can produce a value you assign with `let`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the catch-all arm.** Matching an `i32` against only `1 => ...` and `2 => ...` does NOT compile, the compiler reports "non-exhaustive patterns" because billions of other integers aren't handled. Add a `_` arm or cover the full range.
- **Putting `_` first.** Arms are tried in order, so a `_` at the top matches everything and the compiler warns that all later arms are unreachable dead code. The catch-all always goes last.
- **Mismatched arm types.** When you use `match` as an expression, every arm must return the same type. `match n { 0 => "zero", _ => 1 }` does NOT compile, one arm is a string, the other an integer.
:::

## ✅ Quick Challenge

Write the classic FizzBuzz using a single `match` on the tuple `(n % 3, n % 5)`. For each number 1 through 15, return `"Fizz"` if divisible by 3, `"Buzz"` if divisible by 5, `"FizzBuzz"` if divisible by both, and the number itself otherwise.

```rust
fn fizzbuzz(n: u32) -> String {
    // Replace this with a match on (n % 3, n % 5)
    n.to_string()
}

fn main() {
    for n in 1..=15 {
        println!("{}", fizzbuzz(n));
    }
}
```

<details>
<summary>💡 Hint</summary>

A number divisible by 3 makes `n % 3` equal `0`. Match the tuple against `(0, 0)`, `(0, _)`, `(_, 0)`, and `_`, in that order. Why must `(0, 0)` come first?

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn fizzbuzz(n: u32) -> String {
    match (n % 3, n % 5) {
        (0, 0) => String::from("FizzBuzz"),
        (0, _) => String::from("Fizz"),
        (_, 0) => String::from("Buzz"),
        _ => n.to_string(),
    }
}

fn main() {
    for n in 1..=15 {
        println!("{}", fizzbuzz(n));
    }
}
```

`(0, 0)` must come first because arms are checked in order, if `(0, _)` were first, 15 would print "Fizz" instead of "FizzBuzz".

</details>

## 📖 Additional Resources

- [The Rust Book - Ch 6.2: The match Control Flow Construct](https://doc.rust-lang.org/book/ch06-02-match.html)
- [Rust by Example - Flow of Control: match](https://doc.rust-lang.org/rust-by-example/flow_control/match.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/day-08">← Day 8: Loops</a>
  <a href="/week-02/day-10">Day 10: Comments & Docs →</a>
</div>
