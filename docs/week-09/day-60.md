---
title: "Day 60 - Trait Definitions"
description: "Learn about trait definitions in Rust"
---

# Day 60: Trait Definitions

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Define your own traits, Rust's way of declaring shared behavior, including required methods and default method implementations.

## 📚 The Concept (3 min)

Suppose you are building a news aggregator that handles articles, tweets, and podcast episodes. Each type stores different data, but your feed only cares about one thing: "give me a one-line summary." A trait lets you name that capability once and require every content type to provide it.

A trait is a collection of method signatures that describes behavior a type can implement. You declare one with the `trait` keyword:

```rust
trait Summary {
    fn summarize(&self) -> String;
}
```

Any type that implements `Summary` must provide a `summarize` method with exactly this signature. This is similar to interfaces in Java, TypeScript, or Go, but with two important twists. First, traits can supply **default implementations**: write a method body inside the trait, and implementors get it for free unless they override it. Second, default methods can call other methods of the same trait, even ones that have no body yet. That lets you build rich behavior on top of a tiny required core, a type implements one small method and inherits several derived ones.

Traits are the backbone of Rust's abstraction story. `println!("{}", x)` works because of the `Display` trait; `for` loops work because of `Iterator`; `==` works because of `PartialEq`. When you write `#[derive(Debug, Clone)]` you are asking the compiler to auto-implement traits. Today we only *define* traits, tomorrow (Day 61) we implement them on our own types, and Day 62 uses them to constrain generics.

::: tip Key Insight
A trait defines *what* a type can do, never *what data it holds*. Default methods let you express "if you can do X, you automatically can do Y", the required methods form a minimal contract, the defaults provide the payoff.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{} by {}", self.title, self.author)
    }
}

fn main() {
    let post = Article {
        title: String::from("Traits in Rust"),
        author: String::from("Ferris"),
    };
    println!("{}", post.summarize());
}
```

### Example 2: Practical Application

Default methods that build on one required method:

```rust
trait Greeter {
    // Required: implementors must provide this
    fn name(&self) -> String;

    // Defaults: come for free, may be overridden
    fn greet(&self) -> String {
        format!("Hello, {}!", self.name())
    }

    fn greet_loudly(&self) -> String {
        self.greet().to_uppercase()
    }
}

struct English;
struct Pirate;

impl Greeter for English {
    fn name(&self) -> String {
        String::from("World")
    }
}

impl Greeter for Pirate {
    fn name(&self) -> String {
        String::from("Matey")
    }

    // Override the default
    fn greet(&self) -> String {
        format!("Ahoy, {}!", self.name())
    }
}

fn main() {
    let plain = English;
    let pirate = Pirate;

    println!("{}", plain.greet());
    println!("{}", pirate.greet());
    println!("{}", pirate.greet_loudly());
}
```

::: details Output
Example 1:
```
Traits in Rust by Ferris
```

Example 2:
```
Hello, World!
Ahoy, Matey!
AHOY, MATEY!
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `trait Name { fn method(&self) -> T; }` declares a shared capability; signatures end in `;` when required  
✅ Methods with bodies inside the trait are default implementations that implementors inherit  
✅ Default methods can call required methods, a tiny required core can power many derived behaviors  
✅ Implementors override a default simply by providing their own version in `impl Trait for Type`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Forgetting `&self` in trait method signatures, `fn summarize() -> String` is an associated function, not a method, and cannot be called with dot syntax on an instance
- Trying to access fields inside a default method (`self.title`), the trait knows nothing about implementors' data; it can only call other trait methods
- Calling a trait method without the trait in scope, if a trait lives in another module you must `use` it before its methods are visible on a value
:::

## ✅ Quick Challenge

Define a trait `Shape` with a required method `area(&self) -> f64` and a default method `describe(&self) -> String` that returns `"Shape with area X"`. Implement it for a `Circle` struct.

```rust
// Starter code
struct Circle {
    radius: f64,
}

fn main() {
    let c = Circle { radius: 2.0 };
    // Define the Shape trait, implement it, then:
    // println!("{}", c.describe());
    println!("radius: {}", c.radius);
}
```

<details>
<summary>💡 Hint</summary>

The default `describe` body can call `self.area()` even though `area` has no body in the trait. Use `std::f64::consts::PI` for the circle area.

</details>

<details>
<summary>✅ Solution</summary>

```rust
trait Shape {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("Shape with area {}", self.area())
    }
}

struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn main() {
    let c = Circle { radius: 2.0 };
    println!("{}", c.describe());
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Traits: Defining Shared Behavior](https://doc.rust-lang.org/book/ch10-02-traits.html)
- [Rust by Example - Traits](https://doc.rust-lang.org/rust-by-example/trait.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/day-59">← Day 59: Generic Structs</a>
  <a href="/week-09/day-61">Day 61: Implementing Traits →</a>
</div>
