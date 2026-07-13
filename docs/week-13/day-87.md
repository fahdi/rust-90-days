---
title: "Day 87 - Macros: macro_rules!"
description: "Learn about macros: macro_rules! in Rust"
---

# Day 87: Macros: macro_rules!

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 13</span>
</div>

## 🎯 Today's Goal

Write your own declarative macros with `macro_rules!`, using fragment specifiers and repetition (`$(...)*`) to generate code that plain functions cannot express.

## 📚 The Concept (3 min)

You have used macros since day one: `println!`, `vec!`, `format!`. The `!` marks a call that runs at *compile time*, transforming tokens into code before type checking. Why not just use functions? Because functions cannot take a variable number of arguments, cannot accept arbitrary syntax like `"{} + {}"` format strings verified at compile time, and cannot generate items (structs, impls, other functions).

`macro_rules!` defines a macro by pattern matching on token trees. Each rule has a matcher and a template:

- **Fragment specifiers** classify what a metavariable captures: `$x:expr` (an expression), `$name:ident` (an identifier), `$t:ty` (a type), `$s:stmt`, `$l:literal`, and so on.
- **Repetition** captures many fragments: `$( $item:expr ),*` matches a comma-separated list of expressions; in the template, `$( ... )*` expands once per captured item. `+` means "one or more", `?` means "zero or one".
- **Multiple rules** are tried top to bottom, like a `match`, this is how `vec![]`, `vec![1, 2, 3]`, and `vec![0; 10]` can all share one name.

A crucial property is *hygiene*: variables introduced inside a macro expansion live in their own scope and cannot accidentally capture or clobber variables at the call site. This is why Rust macros are far safer than C's textual `#define`.

Declarative macros shine for eliminating structural boilerplate: builders for tests, mini-DSLs, generating near-identical impls for many types. When you need to *parse Rust code itself* and derive logic from struct fields, you graduate to procedural macros, tomorrow's lesson.

::: tip Key Insight
`macro_rules!` is pattern matching on syntax. A macro never sees values, only tokens, it runs before your program does, and its output must be valid Rust that then gets type-checked as usual. If the expansion is wrong, the error points at generated code, so keep rules small and readable.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Multiple rules and fragment specifiers.

```rust
macro_rules! describe {
    () => {
        println!("nothing to describe");
    };
    ($val:expr) => {
        println!("{} = {:?}", stringify!($val), $val);
    };
    ($val:expr, $label:literal) => {
        println!("{}: {:?}", $label, $val);
    };
}

fn main() {
    describe!();
    describe!(2 + 2);
    let scores = vec![90, 85, 77];
    describe!(scores, "exam scores");
}
```

### Example 2: Practical Application

Repetition: build a `HashMap` literal and generate functions from a list of names.

```rust
use std::collections::HashMap;

macro_rules! map {
    ( $( $key:expr => $value:expr ),* $(,)? ) => {{
        let mut m = HashMap::new();
        $( m.insert($key, $value); )*
        m
    }};
}

macro_rules! make_greeters {
    ( $( $name:ident ),* ) => {
        $(
            fn $name() -> String {
                format!("Hello from {}!", stringify!($name))
            }
        )*
    };
}

make_greeters!(alice, bob);

fn main() {
    let capitals = map! {
        "France" => "Paris",
        "Japan" => "Tokyo",
    };
    println!("Japan -> {}", capitals["Japan"]);
    println!("{} entries", capitals.len());
    println!("{}", alice());
    println!("{}", bob());
}
```

::: details Output
Example 1:
```
nothing to describe
2 + 2 = 4
exam scores: [90, 85, 77]
```

Example 2:
```
Japan -> Tokyo
2 entries
Hello from alice!
Hello from bob!
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `macro_rules!` rules are tried top to bottom; each pairs a token pattern with a code template, letting one macro handle several call shapes  
✅ Fragment specifiers (`expr`, `ident`, `ty`, `literal`, ...) constrain what each `$metavariable` may capture  
✅ `$( ... ),*` repetition is the workhorse, it is how `vec!` accepts any number of elements and how you generate many similar items at once  
✅ Macro hygiene keeps expansion-local variables separate from the call site, unlike C preprocessor macros

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Using `()` instead of `{}` around a multi-statement expansion that must be an expression: wrap the body in an extra pair of braces, where the outer braces delimit the rule and the inner ones form a block expression
- Repetition separator mismatch: a matcher of `$( $x:expr ),*` will not accept a trailing comma unless you add `$(,)?`, callers with `map!{a => 1,}` otherwise get a cryptic "no rules expected this token"
- Forgetting `#[macro_export]` (or proper module ordering) when using the macro from another module/crate, `macro_rules!` macros are only visible after their textual definition point
:::

## ✅ Quick Challenge

Write a macro `max_of!` that takes one or more expressions and returns the largest, e.g. `max_of!(3, 9, 4)` returns `9`. Use a recursive rule: one expression is its own max; otherwise compare the first against the max of the rest.

```rust
// Starter code
macro_rules! max_of {
    ($x:expr) => { $x };
    // add a rule for two-or-more expressions
}

fn main() {
    println!("{}", max_of!(7));
    // println!("{}", max_of!(3, 9, 4)); // should print 9
}
```

<details>
<summary>💡 Hint</summary>

The second rule matches `($x:expr, $( $rest:expr ),+)` and expands to `std::cmp::max($x, max_of!($( $rest ),+))`, the macro calls itself with one fewer argument each time.

</details>

<details>
<summary>✅ Solution</summary>

```rust
macro_rules! max_of {
    ($x:expr) => { $x };
    ($x:expr, $( $rest:expr ),+) => {
        std::cmp::max($x, max_of!($( $rest ),+))
    };
}

fn main() {
    println!("{}", max_of!(7));        // 7
    println!("{}", max_of!(3, 9, 4));  // 9
    println!("{}", max_of!(1, 2, 30, 4, 5)); // 30
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Relevant Chapter](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-13/day-86">← Day 86: Tokio Runtime Intro</a>
  <a href="/week-13/day-88">Day 88: Procedural Macros Overview →</a>
</div>
