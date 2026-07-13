---
title: "Day 7 - Control Flow"
description: "Learn about control flow in Rust"
---

# Day 7: Control Flow

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

Branch your programs with `if`/`else` and repeat work with `loop`, `while`, and `for`, and use both as *expressions* that produce values, not just statements.

## 📚 The Concept (3 min)

Control flow is how your program makes decisions and repeats work. Think of a recipe: "**if** the dough is sticky, add flour; knead **while** it's lumpy; **for each** of the 12 cookies, bake 10 minutes." Every non-trivial program is built from exactly these two moves, branching and looping.

Rust's `if` looks familiar from other languages, with two twists. First, the condition **must** be a `bool`, Rust never treats `1` or a non-empty string as "truthy" the way JavaScript or Python do. Second, `if` is an *expression*: it evaluates to a value, so you can write `let size = if count > 10 { "big" } else { "small" };`. That's why Rust has no ternary operator, it doesn't need one. Both branches must produce the same type, and the compiler checks this for you.

For repetition, Rust gives you three loops, from most to least manual:

- `loop`, repeats forever until you `break`. Uniquely, `break` can carry a value out of the loop: `let x = loop { break 42; };`
- `while`, repeats as long as a condition holds. Great when you don't know the iteration count up front.
- `for`, iterates over anything iterable, most commonly a range like `1..=10` (inclusive) or `0..10` (exclusive of 10). This is the loop you'll reach for 90% of the time: no manual counter, no off-by-one bugs.

Ranges compose nicely with methods, `(1..=3).rev()` counts down `3, 2, 1`. And unlike C, none of these constructs need parentheses around the condition, but the braces around the body are always required.

::: tip Key Insight
In Rust, `if` and `loop` are **expressions**, not just statements, they can produce values you assign with `let`. This replaces the ternary operator and makes "compute a value by branching" a single, type-checked construct.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let temperature = 23;

    if temperature > 30 {
        println!("It's hot outside!");
    } else if temperature > 15 {
        println!("Nice weather today.");
    } else {
        println!("Bring a jacket.");
    }

    // `if` is an expression — it returns a value
    let category = if temperature > 20 { "warm" } else { "cool" };
    println!("Category: {}", category);
}
```

### Example 2: Practical Application

```rust
fn main() {
    // Countdown with a `for` loop over a reversed range
    for second in (1..=3).rev() {
        println!("T-minus {}...", second);
    }
    println!("Liftoff!");

    // `while` loop: keep doubling until we pass 100
    let mut population = 10;
    let mut days = 0;
    while population <= 100 {
        population *= 2;
        days += 1;
    }
    println!("Population hit {} after {} days", population, days);

    // `loop` with a break value: find the first multiple of 7 above 50
    let mut n = 50;
    let answer = loop {
        n += 1;
        if n % 7 == 0 {
            break n;
        }
    };
    println!("First multiple of 7 above 50: {}", answer);
}
```

::: details Output
```
Example 1:
Nice weather today.
Category: warm

Example 2:
T-minus 3...
T-minus 2...
T-minus 1...
Liftoff!
Population hit 160 after 4 days
First multiple of 7 above 50: 56
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `if` conditions must be a real `bool`, no truthy/falsy coercion in Rust  
✅ `if` is an expression: `let x = if cond { a } else { b };` replaces the ternary operator, and both branches must have the same type  
✅ Three loops: `loop` (infinite until `break`), `while` (condition-driven), `for` (iterate a range or collection, your default choice)  
✅ `loop` can return a value via `break value;`, and ranges like `1..=10` / `(1..=3).rev()` make counting loops safe and readable

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a non-bool as a condition.** `if count { ... }`, this does NOT compile. Rust demands `if count != 0 { ... }`. Coming from Python or JS, this is the #1 control-flow error message you'll see: `expected 'bool', found integer`.
- **Mismatched branch types in an `if` expression.** `let x = if flag { 5 } else { "five" };`, this does NOT compile, because `x` can't be both an integer and a string. Every branch of an `if` used as a value must produce the same type.
- **Off-by-one with range syntax.** `1..10` stops at 9; `1..=10` includes 10. Forgetting the `=` in an inclusive range silently skips your last iteration, the compiler can't catch this one, so read your ranges carefully.
:::

## ✅ Quick Challenge

Classic FizzBuzz: print the numbers 1 through 15, but print `Fizz` for multiples of 3, `Buzz` for multiples of 5, and `FizzBuzz` for multiples of both.

```rust
// Starter code
fn main() {
    // Print numbers 1 through 15.
    // For multiples of 3 print "Fizz", multiples of 5 print "Buzz",
    // and multiples of both print "FizzBuzz".
    for n in 1..=15 {
        // Your code here
        println!("{}", n);
    }
}
```

<details>
<summary>💡 Hint</summary>

Check the "multiple of both" case **first**, a number divisible by both 3 and 5 is divisible by 15, so test `n % 15 == 0` before the individual checks, or the earlier branches will steal it.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    for n in 1..=15 {
        if n % 15 == 0 {
            println!("FizzBuzz");
        } else if n % 3 == 0 {
            println!("Fizz");
        } else if n % 5 == 0 {
            println!("Buzz");
        } else {
            println!("{}", n);
        }
    }
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Control Flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html)
- [Rust by Example - Flow of Control](https://doc.rust-lang.org/rust-by-example/flow_control.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-01/day-06">← Day 6: Functions</a>
  <a href="/week-02/">Week 2 Overview →</a>
</div>
