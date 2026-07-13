---
title: "Day 8 - Loops"
description: "Learn about loops in Rust"
---

# Day 8: Loops

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 2</span>
</div>

## 🎯 Today's Goal

Use Rust's three loop constructs, `loop`, `while`, and `for`, and know exactly when to reach for each one, including how to break out of a loop with a value.

## 📚 The Concept (3 min)

Yesterday (Day 7) you used `if`/`else` to make decisions once. Loops let you make them repeatedly. Rust gives you three tools, and each has a distinct job, think of them as three settings on a washing machine.

**`loop`** is the "run until I say stop" setting. It repeats forever until you explicitly `break`. This sounds dangerous, but it's Rust's most honest loop: when you genuinely don't know how many iterations you need (retrying a network call, reading user input until it's valid), `loop` says so in the code. Uniquely, `break` can hand a value back out: `let x = loop { break 42; };`, the loop itself is an expression, just like `if` was on Day 7.

**`while`** is the "run while a condition holds" setting. It checks the condition *before* every iteration, so it may run zero times. Use it when the stopping condition is a test on changing state.

**`for`** is the workhorse, probably 90% of the loops you'll write. It iterates over anything iterable: ranges like `1..=10`, and the arrays you met on Day 5. Unlike C-style `for(i=0; i<n; i++)`, Rust's `for` can't have off-by-one index bugs because there's no manual index to get wrong.

Two extras that make Rust loops pleasant: `continue` skips to the next iteration, and *loop labels* like `'outer:` let you break out of nested loops in one jump instead of juggling flag variables.

::: tip Key Insight
Prefer `for` whenever you're iterating over something (a range or collection); reserve `while` for condition-driven repetition and `loop` for "repeat until break", and remember that `break` can return a value from a `loop`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // 1. `loop`: repeats forever until you `break`
    let mut count = 0;
    let result = loop {
        count += 1;
        if count == 5 {
            break count * 10; // break can return a value!
        }
    };
    println!("loop result: {}", result);

    // 2. `while`: repeats while a condition holds
    let mut fuel = 3;
    while fuel > 0 {
        println!("Countdown: {}", fuel);
        fuel -= 1;
    }

    // 3. `for`: iterates over a range or collection
    for i in 1..=3 {
        println!("for iteration {}", i);
    }
}
```

### Example 2: Practical Application

```rust
fn main() {
    let prices = [12.99, 4.50, 89.99, 2.75, 24.00];
    let budget = 50.0;

    let mut total = 0.0;
    let mut skipped = 0;

    for price in prices {
        if total + price > budget {
            skipped += 1;
            continue; // too expensive, skip this item
        }
        total += price;
    }

    println!("Spent: ${:.2}", total);
    println!("Items skipped: {}", skipped);

    // Labeled loops: break out of nested loops cleanly
    'outer: for row in 0..3 {
        for col in 0..3 {
            if row * col == 4 {
                println!("Found target at row {}, col {}", row, col);
                break 'outer;
            }
        }
    }
}
```

::: details Output
```
Spent: $44.24
Items skipped: 1
Found target at row 2, col 2
```
(Example 1 prints: `loop result: 50`, the countdown from 3 to 1, then `for iteration 1` through `3`.)
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `loop` runs forever until `break`, and `break value;` lets the loop produce a value  
✅ `while` checks its condition before each pass, so it can run zero times  
✅ `for x in collection` is the idiomatic default, no manual indexing, no off-by-one bugs  
✅ `continue` skips one iteration; labels like `'outer:` let `break` escape nested loops

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Confusing `1..5` with `1..=5`.** The first is *exclusive* (1, 2, 3, 4); the second is *inclusive* (1 through 5). Off-by-one bugs in Rust almost always come from picking the wrong range operator.
- **Forgetting `mut` on the loop variable you're updating.** `let fuel = 3; while fuel > 0 { fuel -= 1; }` does NOT compile, you're mutating an immutable binding (Day 2 strikes again). Declare it `let mut fuel = 3;`.
- **Trying to `break` a `while` or `for` with a value.** `break value;` only works inside `loop`. In `while`/`for`, the "did the condition end it or did I?" question makes a return value ambiguous, so Rust forbids it.
:::

## ✅ Quick Challenge

Write the classic FizzBuzz for the numbers 1 through 15: print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for multiples of both, and the number itself otherwise.

```rust
fn main() {
    // Print FizzBuzz for 1..=15:
    // multiples of 3 -> "Fizz", of 5 -> "Buzz", of both -> "FizzBuzz"
    for n in 1..=15 {
        println!("{}", n); // replace this with your logic
    }
}
```

<details>
<summary>💡 Hint</summary>

Check the "multiple of both" case *first* (`n % 15 == 0`), otherwise the `% 3` branch will win at 15 and you'll never print "FizzBuzz".

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

Output ends with: `13`, `14`, `FizzBuzz`.

</details>

## 📖 Additional Resources

- [The Rust Book - Repetition with Loops](https://doc.rust-lang.org/book/ch03-05-control-flow.html#repetition-with-loops)
- [Rust by Example - Loops](https://doc.rust-lang.org/rust-by-example/flow_control/loop.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-02/">← Week 2 Overview</a>
  <a href="/week-02/day-09">Day 9: Pattern Matching →</a>
</div>
