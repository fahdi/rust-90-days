---
title: "Day 33 - Enums Basics"
description: "Learn about enums basics in Rust"
---

# Day 33: Enums Basics

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Define your own enum types, attach data to their variants, and use `match` to handle every possible case, the foundation for `Option` and `Result`, which you'll meet tomorrow.

## 📚 The Concept (3 min)

Yesterday you used structs to group related data together. Enums solve the opposite problem: a value that must be **exactly one of a fixed set of possibilities**. A traffic light is red, yellow, *or* green, never two at once, and never anything else. A struct says "this AND that"; an enum says "this OR that."

You define an enum with the `enum` keyword and list its **variants**:

```rust
enum Direction {
    North,
    South,
    East,
    West,
}
```

Now `Direction` is a real type. A variable of type `Direction` holds one of those four variants, the compiler guarantees it. You refer to a variant with the `::` path syntax: `Direction::North`.

What makes Rust enums far more powerful than enums in C or Java is that **each variant can carry its own data**:

```rust
enum Shape {
    Circle(f64),                          // tuple-style payload
    Rectangle(f64, f64),                  // multiple values
    Triangle { base: f64, height: f64 },  // named fields, like a struct
}
```

A `Shape` is one type, but a circle carries a radius while a rectangle carries a width and height. In other languages you'd need an interface plus three classes; in Rust it's one enum.

The natural partner of enums is `match`. When you match on an enum, the compiler forces you to handle **every** variant. Add a fifth variant next month and every `match` that forgot about it becomes a compile error, not a 3 a.m. production bug. This pairing is why "make invalid states unrepresentable" is a Rust mantra: encode your states as enum variants and whole categories of bugs disappear.

Like structs, enums can have methods via `impl` blocks, you'll see that in Example 2.

::: tip Key Insight
An enum is a type that is exactly one of several variants, and each variant can carry its own data. `match` forces you to handle every variant, so the compiler, not your users, catches forgotten cases.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Define a simple enum, print it with `Debug`, and branch on it with `match`:

```rust
#[derive(Debug)]
enum Direction {
    North,
    South,
    East,
    West,
}

fn compass_label(dir: &Direction) -> &str {
    match dir {
        Direction::North => "N (0°)",
        Direction::South => "S (180°)",
        Direction::East => "E (90°)",
        Direction::West => "W (270°)",
    }
}

fn main() {
    let heading = Direction::East;
    println!("Heading: {:?}", heading);
    println!("Compass: {}", compass_label(&heading));

    // Enums work great in collections too
    let route = [Direction::North, Direction::West, Direction::South];
    for step in &route {
        println!("Turn {:?}", step);
    }
}
```

### Example 2: Practical Application

Variants carrying different data, plus a method that computes the right answer per variant:

```rust
#[derive(Debug)]
enum Shape {
    Circle(f64),              // radius
    Rectangle(f64, f64),      // width, height
    Triangle { base: f64, height: f64 },
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r) => std::f64::consts::PI * r * r,
            Shape::Rectangle(w, h) => w * h,
            Shape::Triangle { base, height } => 0.5 * base * height,
        }
    }
}

fn main() {
    let shapes = vec![
        Shape::Circle(2.0),
        Shape::Rectangle(3.0, 4.5),
        Shape::Triangle { base: 6.0, height: 2.0 },
    ];

    for shape in &shapes {
        println!("{:?} has area {:.2}", shape, shape.area());
    }
}
```

Notice how `match` **destructures** each variant's payload: `Circle(r)` binds the radius to `r` so you can use it on the right side of the arrow. One `Vec` holds three different "kinds" of value because they're all the same type: `Shape`.

::: details Output
Example 1:
```
Heading: East
Compass: E (90°)
Turn North
Turn West
Turn South
```

Example 2:
```
Circle(2.0) has area 12.57
Rectangle(3.0, 4.5) has area 13.50
Triangle { base: 6.0, height: 2.0 } has area 6.00
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ An enum defines a type whose value is exactly one of a fixed set of variants, "this OR that", vs. a struct's "this AND that"  
✅ Variants can carry data: unit (`North`), tuple-style (`Circle(f64)`), or struct-style (`Triangle { base, height }`)  
✅ `match` on an enum must be exhaustive, the compiler errors if you forget a variant, which makes refactoring safe  
✅ Enums get `impl` blocks and methods just like structs, and `#[derive(Debug)]` lets you print them with `{:?}`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the `EnumName::` prefix.** Writing `let d = North;` does NOT compile, Rust has no idea what `North` is. Variants live in the enum's namespace: `Direction::North`. (A `use Direction::*;` import can shorten this, but learn the full path first.)
- **Non-exhaustive `match`.** Matching only `Red` and `Green` on a three-variant traffic light does NOT compile: "non-exhaustive patterns: `Yellow` not covered." Either handle every variant or add a catch-all `_ => ...` arm, but prefer listing variants explicitly so new ones can't slip through unhandled.
- **Reaching for a struct + booleans instead of an enum.** Modeling a connection as `is_connected: bool, is_connecting: bool` allows the nonsense state where both are `true`. An enum `ConnectionState { Disconnected, Connecting, Connected }` makes that state impossible to even construct.
:::

## ✅ Quick Challenge

Define a `TrafficLight` enum with variants `Red`, `Yellow`, and `Green`, then write a function `seconds_to_wait` that returns how long each light lasts: Red = 30, Yellow = 5, Green = 45. Print the wait time for all three lights.

```rust
// Starter code
// 1. Define the TrafficLight enum here
// 2. Write fn seconds_to_wait(light: &TrafficLight) -> u32

fn main() {
    // 3. Call seconds_to_wait for each variant and print the result
}
```

<details>
<summary>💡 Hint</summary>

Derive `Debug` on the enum so you can print variants with `{:?}`. Inside `seconds_to_wait`, use a `match` with one arm per variant, each arm is just an expression like `TrafficLight::Red => 30,` and `match` itself returns the value.

</details>

<details>
<summary>✅ Solution</summary>

```rust
#[derive(Debug)]
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn seconds_to_wait(light: &TrafficLight) -> u32 {
    match light {
        TrafficLight::Red => 30,
        TrafficLight::Yellow => 5,
        TrafficLight::Green => 45,
    }
}

fn main() {
    let lights = [TrafficLight::Red, TrafficLight::Yellow, TrafficLight::Green];
    for light in &lights {
        println!("{:?} lasts {} seconds", light, seconds_to_wait(light));
    }
}
```

Output:

```
Red lasts 30 seconds
Yellow lasts 5 seconds
Green lasts 45 seconds
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 6.1: Defining an Enum](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html)
- [Rust by Example - Enums](https://doc.rust-lang.org/rust-by-example/custom_types/enum.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/day-32">← Day 32: Tuple Structs</a>
  <a href="/week-05/day-34">Day 34: Option&lt;T&gt; →</a>
</div>
