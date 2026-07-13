---
title: "Day 70 - Operator Overloading"
description: "Learn about operator overloading in Rust"
---

# Day 70: Operator Overloading

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 10</span>
</div>

## 🎯 Today's Goal

Learn how to make operators like `+`, `*`, and `==` work on your own types by implementing the traits in `std::ops`, and see where the associated `Output` type fits in.

## 📚 The Concept (3 min)

Say you're writing a 2D game and constantly combining positions and velocities. Writing `position.add(velocity)` everywhere works, but `position + velocity` reads like the math it represents. Rust lets you earn that syntax, not by magic, but through ordinary traits.

Every operator in Rust is sugar for a trait method from `std::ops`. `a + b` literally calls `Add::add(a, b)`; `a * b` calls `Mul::mul`; `-a` calls `Neg::neg`; `a += b` calls `AddAssign::add_assign`. Comparison operators come from `std::cmp` instead: `==` is `PartialEq` (usually just `#[derive(PartialEq)]`), and `<` comes from `PartialOrd`. There's no way to invent brand-new operators or change precedence, you can only give meaning to the existing ones for your types. That restraint keeps Rust code readable: `+` always means "the `Add` trait," never something exotic.

Yesterday's associated types show up immediately: `Add` declares `type Output`, the type the addition *produces*. Usually `Output = Self` (point + point = point), but not always, subtracting two timestamps naturally yields a duration, a different type entirely. The implementor decides once, and the compiler infers it at every `+`.

One ownership note: `Add::add` takes `self` by value, so `a + b` *moves* both operands unless your type is `Copy`. For small math-y structs, deriving `Copy` and `Clone` makes operators feel as ergonomic as built-in numbers.

::: tip Key Insight
Operators are just trait method calls: `a + b` is `Add::add(a, b)`. The associated `Output` type decides what the operation produces, and it doesn't have to be `Self`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::ops::Add;

#[derive(Debug, Clone, Copy, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    let a = Point { x: 1, y: 2 };
    let b = Point { x: 3, y: 4 };
    let sum = a + b; // calls Add::add(a, b)

    println!("{:?} + {:?} = {:?}", a, b, sum);
    println!("equal? {}", sum == Point { x: 4, y: 6 });
}
```

### Example 2: Practical Application

```rust
use std::ops::{Add, Mul, Neg};

#[derive(Debug, Clone, Copy)]
struct Vec2 {
    x: f64,
    y: f64,
}

impl Add for Vec2 {
    type Output = Vec2;
    fn add(self, rhs: Vec2) -> Vec2 {
        Vec2 { x: self.x + rhs.x, y: self.y + rhs.y }
    }
}

// Scalar multiplication: Vec2 * f64 — mixed operand types!
impl Mul<f64> for Vec2 {
    type Output = Vec2;
    fn mul(self, scalar: f64) -> Vec2 {
        Vec2 { x: self.x * scalar, y: self.y * scalar }
    }
}

impl Neg for Vec2 {
    type Output = Vec2;
    fn neg(self) -> Vec2 {
        Vec2 { x: -self.x, y: -self.y }
    }
}

fn main() {
    let position = Vec2 { x: 10.0, y: 5.0 };
    let velocity = Vec2 { x: 1.5, y: -0.5 };
    let dt = 2.0;

    // physics update reads like the math
    let new_position = position + velocity * dt;
    println!("new position: {:?}", new_position);

    let reversed = -velocity;
    println!("reversed velocity: {:?}", reversed);
}
```

::: details Output
```
Point { x: 1, y: 2 } + Point { x: 3, y: 4 } = Point { x: 4, y: 6 }
equal? true
```
Example 2:
```
new position: Vec2 { x: 13.0, y: 4.0 }
reversed velocity: Vec2 { x: -1.5, y: 0.5 }
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Operators map to `std::ops` traits: `+` → `Add`, `*` → `Mul`, `-x` → `Neg`, `+=` → `AddAssign`; `==` comes from `PartialEq`  
✅ The associated `Output` type declares what the operation produces, it can differ from `Self`  
✅ `Mul&lt;f64&gt; for Vec2` shows the generic parameter is the right-hand side, allowing mixed-type operations  
✅ Operator methods take `self` by value, so derive `Copy` on small math types to keep operands usable afterward

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Being surprised that `let c = a + b;` moves `a` and `b`, without `Copy`, both are consumed by the operator call.
- Implementing `Vec2 * f64` and expecting `f64 * Vec2` to work, operand order matters; the reverse needs a separate `impl Mul&lt;Vec2&gt; for f64`.
- Overloading operators with non-obvious meanings (e.g. `+` that appends to a log file), readers assume mathematical semantics, so surprising behavior is a maintenance trap.
:::

## ✅ Quick Challenge

Create a `Money` struct with `cents: i64`. Implement `Add` (money + money = money) and `Mul&lt;i64&gt;` (money * quantity = money), then compute the total for 3 coffees at $4.50 plus one muffin at $3.25.

```rust
// Starter code
#[derive(Debug, Clone, Copy)]
struct Money {
    cents: i64,
}

fn main() {
    let coffee = Money { cents: 450 };
    let muffin = Money { cents: 325 };
    // TODO: implement Add and Mul<i64>, then:
    // let total = coffee * 3 + muffin;
    println!("{:?} {:?}", coffee, muffin);
}
```

<details>
<summary>💡 Hint</summary>

You need `use std::ops::{Add, Mul};`, then two impl blocks: `impl Add for Money` and `impl Mul&lt;i64&gt; for Money`, both with `type Output = Money;`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::ops::{Add, Mul};

#[derive(Debug, Clone, Copy)]
struct Money {
    cents: i64,
}

impl Add for Money {
    type Output = Money;
    fn add(self, rhs: Money) -> Money {
        Money { cents: self.cents + rhs.cents }
    }
}

impl Mul<i64> for Money {
    type Output = Money;
    fn mul(self, qty: i64) -> Money {
        Money { cents: self.cents * qty }
    }
}

fn main() {
    let coffee = Money { cents: 450 };
    let muffin = Money { cents: 325 };

    let total = coffee * 3 + muffin;
    println!("total = ${}.{:02}", total.cents / 100, total.cents % 100);
    // total = $16.75
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Operator Overloading](https://doc.rust-lang.org/book/ch20-02-advanced-traits.html#default-generic-type-parameters-and-operator-overloading)
- [Rust by Example - Operator Overloading](https://doc.rust-lang.org/rust-by-example/trait/ops.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-10/day-69">← Day 69: Project: Generic Data Store</a>
  <a href="/week-11/">Week 11 Overview →</a>
</div>
