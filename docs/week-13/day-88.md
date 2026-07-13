---
title: "Day 88 - Procedural Macros Overview"
description: "Learn about procedural macros overview in Rust"
---

# Day 88: Procedural Macros Overview

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Expert</span>
  <span class="week">📅 Week 13</span>
</div>

## 🎯 Today's Goal

Understand the three kinds of procedural macros, derive, attribute, and function-like, what code a `#[derive(...)]` actually generates for you, and when a proc macro is worth the extra crate it requires.

## 📚 The Concept (3 min)

You have been *consuming* procedural macros all course: `#[derive(Debug)]`, `#[derive(Clone)]`, serde's `#[derive(Serialize)]`, yesterday's `#[tokio::main]`. Unlike `macro_rules!`, which pattern-matches tokens declaratively, a proc macro is an ordinary Rust *function* that the compiler runs at build time: it receives a `TokenStream` of your code and returns a `TokenStream` of generated code. Full Turing-complete access to the syntax tree.

There are three flavors:

1. **Derive macros**, `#[derive(MyTrait)]` on a struct/enum. The macro reads the type's fields and emits an `impl` block. This is 90% of real-world usage (serde, thiserror, clap).
2. **Attribute macros**, `#[route(GET, "/users")]` or `#[tokio::main]`. They receive the annotated item and may rewrite it entirely.
3. **Function-like macros**, `sql!(SELECT * FROM users)`. Called like `macro_rules!` macros but implemented as a function, so they can parse arbitrary grammar.

The catch: proc macros must live in their own crate with `proc-macro = true` in Cargo.toml, because the compiler loads them as plugins while compiling *your* crate. The ecosystem trio you will see everywhere is `syn` (parse tokens into an AST), `quote` (turn templated Rust back into tokens), and `proc-macro2` (a portable token type).

Since a single-file lesson cannot host a proc-macro crate, today's examples work the other direction: we use built-in derives, then hand-write the exact impl a derive would generate. Seeing the expansion demystifies the magic, a derive macro is just a robot writing the boilerplate you are about to write.

::: tip Key Insight
A derive macro does not change your type, it only *adds* an `impl` block next to it. Anything `#[derive(...)]` produces, you could write by hand; the macro exists to keep that boilerplate in sync with the fields automatically. When debugging a derive, `cargo expand` shows you exactly the code it emitted.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Built-in derive macros generating trait impls from the field list.

```rust
#[derive(Debug, Clone, PartialEq, Default)]
struct Config {
    host: String,
    port: u16,
    verbose: bool,
}

fn main() {
    let base = Config::default(); // from derive(Default)
    let mut prod = base.clone();  // from derive(Clone)
    prod.host = String::from("example.com");
    prod.port = 443;

    println!("{:?}", base);       // from derive(Debug)
    println!("{:?}", prod);
    println!("changed: {}", base != prod); // from derive(PartialEq)
}
```

### Example 2: Practical Application

What the robot writes: a hand-rolled `Debug` impl identical in spirit to the derive's output.

```rust
use std::fmt;

struct Point {
    x: i32,
    y: i32,
}

// This is (essentially) what `#[derive(Debug)]` expands to:
impl fmt::Debug for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Point")
            .field("x", &self.x)
            .field("y", &self.y)
            .finish()
    }
}

#[derive(Debug)]
struct DerivedPoint {
    x: i32,
    y: i32,
}

fn main() {
    let manual = Point { x: 3, y: -1 };
    let derived = DerivedPoint { x: 3, y: -1 };
    println!("manual : {:?}", manual);
    println!("derived: {:?}", derived);
    println!("pretty :\n{:#?}", manual);
}
```

::: details Output
Example 1:
```
Config { host: "", port: 0, verbose: false }
Config { host: "example.com", port: 443, verbose: false }
changed: true
```

Example 2:
```
manual : Point { x: 3, y: -1 }
derived: DerivedPoint { x: 3, y: -1 }
pretty :
Point {
    x: 3,
    y: -1,
}
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A proc macro is a compile-time function: `TokenStream` in, `TokenStream` out, with full programmatic control, far more powerful than `macro_rules!` pattern templates  
✅ The three kinds are derive (`#[derive(X)]` adds impls), attribute (`#[x]` rewrites items), and function-like (`x!(...)` parses custom grammar)  
✅ Proc macros must live in a dedicated crate (`proc-macro = true`); `syn` parses, `quote!` generates, `proc-macro2` bridges  
✅ Derives only append code, every generated impl is ordinary Rust you could write yourself, inspectable with `cargo expand`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Trying to define a proc macro in the same crate that uses it, the compiler refuses; you need a separate `my-macros` crate and a normal dependency on it
- Deriving traits whose bounds your fields cannot meet, e.g. `#[derive(Clone)]` on a struct holding a non-`Clone` field, the error appears at the derive site and confuses people into blaming the macro
- Reaching for a proc macro when `macro_rules!` or plain generics would do, proc macros add a compile-time dependency chain (syn is famously slow to build) and harder-to-debug errors
:::

## ✅ Quick Challenge

Play "derive robot" yourself: given the struct below, hand-write the `PartialEq` impl that `#[derive(PartialEq)]` would generate (compare every field), then verify with two test values.

```rust
// Starter code
struct Rgb {
    r: u8,
    g: u8,
    b: u8,
}

// impl PartialEq for Rgb { ... }

fn main() {
    let red = Rgb { r: 255, g: 0, b: 0 };
    let also_red = Rgb { r: 255, g: 0, b: 0 };
    let _ = (red, also_red);
    // println!("{}", red == also_red); // should print true
}
```

<details>
<summary>💡 Hint</summary>

`PartialEq` needs one method: `fn eq(&self, other: &Self) -> bool`. The derive compares fields joined with `&&`: `self.r == other.r && ...`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Rgb {
    r: u8,
    g: u8,
    b: u8,
}

impl PartialEq for Rgb {
    fn eq(&self, other: &Self) -> bool {
        self.r == other.r && self.g == other.g && self.b == other.b
    }
}

fn main() {
    let red = Rgb { r: 255, g: 0, b: 0 };
    let also_red = Rgb { r: 255, g: 0, b: 0 };
    let blue = Rgb { r: 0, g: 0, b: 255 };
    println!("{}", red == also_red); // true
    println!("{}", red == blue);     // false
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Macros](https://doc.rust-lang.org/book/ch20-05-macros.html)
- [The Rust Reference - Procedural Macros](https://doc.rust-lang.org/reference/procedural-macros.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-13/day-87">← Day 87: Macros: macro_rules!</a>
  <a href="/week-13/day-89">Day 89: Unsafe Rust Intro →</a>
</div>
