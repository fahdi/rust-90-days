---
title: "Day 59 - Generic Structs"
description: "Learn about generic structs in Rust"
---

# Day 59: Generic Structs

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Define structs with generic type parameters so a single definition can hold values of any type, and write `impl` blocks for those generic structs.

## 📚 The Concept (3 min)

Yesterday you made functions generic. Today we apply the same idea to data. Imagine you need a `Point` struct for a plotting library. Some users plot pixel coordinates (`i32`), others plot measurements (`f64`). Without generics you would copy-paste `PointI32`, `PointF64`, `PointU8`... and every method three times. That is exactly the duplication generics eliminate.

A generic struct declares one or more type parameters in angle brackets after its name: `struct Point&lt;T&gt; { x: T, y: T }`. Here `T` is a placeholder that gets filled in when you create a value: `Point { x: 5, y: 10 }` becomes a `Point&lt;i32&gt;`, while `Point { x: 1.0, y: 4.0 }` becomes a `Point&lt;f64&gt;`. Note that with a single `T`, both fields must be the *same* type, mixing `5` and `4.0` is a compile error. If you want independent field types, declare two parameters: `struct Pair&lt;T, U&gt;`.

Methods come from a generic `impl` block: `impl&lt;T&gt; Point&lt;T&gt; { ... }`. The `&lt;T&gt;` right after `impl` declares the parameter so Rust knows `Point&lt;T&gt;` uses a generic, not a concrete type named `T`. You can also implement methods for one specific instantiation, `impl Point&lt;f64&gt;`, which is how the standard library gives `Vec&lt;u8&gt;` a few extra methods.

This is the same machinery behind `Option&lt;T&gt;`, `Vec&lt;T&gt;`, and `HashMap&lt;K, V&gt;`, you have been using generic structs (and enums) since week one.

::: tip Key Insight
Monomorphization: at compile time Rust generates a separate concrete copy of the struct and its methods for every type you actually use. `Point&lt;i32&gt;` and `Point&lt;f64&gt;` are two distinct types with zero runtime cost, generics in Rust are free at runtime.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.5, y: 4.5 };

    println!("integer.x = {}", integer.x());
    println!("float.x = {}", float.x());
    println!("float.y = {}", float.y);
}
```

### Example 2: Practical Application

```rust
struct Pair<T, U> {
    first: T,
    second: U,
}

impl<T, U> Pair<T, U> {
    fn new(first: T, second: U) -> Self {
        Pair { first, second }
    }

    fn swap(self) -> Pair<U, T> {
        Pair {
            first: self.second,
            second: self.first,
        }
    }
}

// Methods only for one concrete instantiation
impl Pair<f64, f64> {
    fn sum(&self) -> f64 {
        self.first + self.second
    }
}

fn main() {
    let label = Pair::new("temperature", 21.5);
    println!("{} = {}", label.first, label.second);

    let swapped = label.swap();
    println!("swapped: {} then {}", swapped.first, swapped.second);

    let coords = Pair::new(3.0, 4.5);
    println!("sum = {}", coords.sum());
}
```

::: details Output
Example 1:
```
integer.x = 5
float.x = 1.5
float.y = 4.5
```

Example 2:
```
temperature = 21.5
swapped: 21.5 then temperature
sum = 7.5
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `struct Point&lt;T&gt;` defines one struct that works for any type; the concrete type is inferred at construction  
✅ A single parameter `T` forces all `T` fields to the same type; use `&lt;T, U&gt;` for independent field types  
✅ Generic methods need `impl&lt;T&gt; Point&lt;T&gt;`, the `&lt;T&gt;` after `impl` declares the parameter  
✅ `impl Point&lt;f64&gt;` adds methods available only on that concrete instantiation, and monomorphization makes it all zero-cost

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Writing `Point { x: 5, y: 4.0 }` with `struct Point&lt;T&gt;`, one `T` means both fields must match; the compiler will complain the second field "expected integer, found floating-point number"
- Forgetting the `&lt;T&gt;` after `impl` (`impl Point&lt;T&gt;` instead of `impl&lt;T&gt; Point&lt;T&gt;`), Rust then looks for a concrete type literally named `T` and errors with "cannot find type `T`"
- Trying to do arithmetic like `self.x + self.y` inside a plain generic impl, `T` has no known operations yet; that needs trait bounds (Day 62)
:::

## ✅ Quick Challenge

Create a generic `Wrapper&lt;T&gt;` struct holding a single `value: T`. Give it a `new` constructor and an `into_inner` method that consumes the wrapper and returns the value. Test it with a `String` and an `i32`.

```rust
// Starter code
struct Wrapper<T> {
    value: T,
}

fn main() {
    // Construct a Wrapper<i32> and a Wrapper<String>,
    // then unwrap both with into_inner and print them.
}
```

<details>
<summary>💡 Hint</summary>

`into_inner` should take `self` by value (not `&self`) so it can move `self.value` out and return `T`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Wrapper<T> {
    value: T,
}

impl<T> Wrapper<T> {
    fn new(value: T) -> Self {
        Wrapper { value }
    }

    fn into_inner(self) -> T {
        self.value
    }
}

fn main() {
    let number = Wrapper::new(42);
    let name = Wrapper::new(String::from("Rust"));

    println!("number: {}", number.into_inner());
    println!("name: {}", name.into_inner());
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Generic Data Types](https://doc.rust-lang.org/book/ch10-01-syntax.html)
- [Rust by Example - Generics](https://doc.rust-lang.org/rust-by-example/generics.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/day-58">← Day 58: Generic Functions</a>
  <a href="/week-09/day-60">Day 60: Trait Definitions →</a>
</div>
