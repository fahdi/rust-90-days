---
title: "Day 2 - Variables & Mutability"
description: "Learn about variables & mutability in Rust"
---

# Day 2: Variables & Mutability

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Beginner</span>
  <span class="week">📅 Week 1</span>
</div>

## 🎯 Today's Goal

Declare variables with `let`, understand why they're immutable by default, opt in to mutation with `mut`, and use shadowing to transform a value under the same name.

## 📚 The Concept (3 min)

Yesterday you used `let` to store values. Today's twist: in Rust, variables are **immutable by default**. Once you write `let x = 5;`, that binding is a promise, `x` is 5, full stop. Reassigning it is a compile error. This does NOT compile:

```
let x = 5;
x = 6; // error[E0384]: cannot assign twice to immutable variable `x`
```

Think of an immutable variable as a label on a sealed jar: anyone who reads the label can trust the contents haven't changed since it was sealed. A huge share of bugs in mutable-by-default languages come from something changing a value when you didn't expect it. Rust flips the default: nothing changes unless you *explicitly* allow it with `let mut x = 5;`. When you spot `mut` while reading Rust code, it's a signal, "watch this one, it moves."

Rust also offers **shadowing**: you can declare a *new* variable with the same name as an earlier one by using `let` again. This isn't mutation, the old variable is replaced by a brand-new binding, which may even have a *different type*. Shadowing is idiomatic for pipelines where one value goes through transformations: parse it, scale it, format it, same name, evolving value, no stray `mut` left behind.

Finally there are **constants**, declared with `const`. They require a type annotation, must be computable at compile time, and by convention use SCREAMING_SNAKE_CASE at the top of a file or module, perfect for values like `MAX_SCORE` or `SECONDS_PER_HOUR`.

::: tip Key Insight
Immutability by default is a feature, not a restriction: when you see a plain `let`, you *know* that value never changes. Reach for `mut` only when a value genuinely needs to change in place, and for shadowing when you're transforming a value step by step.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let x = 5;
    println!("x is {}", x);

    let mut count = 0;
    count += 1;
    count += 1;
    println!("count is {}", count);
}
```

### Example 2: Practical Application

```rust
const MAX_SCORE: u32 = 100;

fn main() {
    let score = 87;
    println!("Raw score: {}/{}", score, MAX_SCORE);

    // Shadowing: rebind the same name, even with a new type
    let score = score as f64 / MAX_SCORE as f64;
    println!("As a fraction: {}", score);

    let score = format!("{:.0}%", score * 100.0);
    println!("Displayed: {}", score);
}
```

::: details Output
Example 1:

```
x is 5
count is 2
```

Example 2:

```
Raw score: 87/100
As a fraction: 0.87
Displayed: 87%
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `let` bindings are immutable by default, reassignment is a compile error (E0384)  
✅ `let mut` opts in to mutation and signals "this value changes" to every reader  
✅ Shadowing (a second `let` with the same name) creates a new variable and can even change its type  
✅ `const` requires a type annotation, uses SCREAMING_SNAKE_CASE, and is fixed at compile time

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Reassigning without `mut`**, `let x = 5;` followed by `x = 6;` fails to compile. Fix it with `let mut x` if you truly need mutation, or shadow with a fresh `let`.
- **Confusing shadowing with mutation**, `let x = x + 1;` works on an *immutable* variable because it creates a new binding; `x += 1;` does not, because it mutates the existing one.
- **Trying to change type through `mut`**, `let mut s = 5; s = "five";` fails: mutation can never change a variable's type. Only shadowing (`let s = "five";`) can.
:::

## ✅ Quick Challenge

Build a step tracker: make `steps` mutable and accumulate three walks (250, 500, and 1000 steps), then shadow `steps` with a formatted String like `"1750 steps"` and print it.

```rust
fn main() {
    let steps = 0;
    // 1. Make `steps` mutable, then add 250, 500, and 1000 to it.
    // 2. Shadow `steps` with a String like "1750 steps".
    // 3. Print the final value.
    println!("{}", steps);
}
```

<details>
<summary>💡 Hint</summary>

Step 1 needs `let mut steps = 0;` and `steps += 250;`. Step 2 is a *new* binding: `let steps = format!("{} steps", steps);`, shadowing lets the name switch from an integer to a String, which `mut` alone could never do.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let mut steps = 0;
    steps += 250;
    steps += 500;
    steps += 1000;
    let steps = format!("{} steps", steps);
    println!("{}", steps);
}
```

Output:

```
1750 steps
```

</details>

## 📖 Additional Resources

- [The Rust Book - Variables and Mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html)
- [Rust by Example - Variable Bindings](https://doc.rust-lang.org/rust-by-example/variable_bindings.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-01/day-01">← Day 1: Hello Rust</a>
  <a href="/week-01/day-03">Day 3: Data Types →</a>
</div>
