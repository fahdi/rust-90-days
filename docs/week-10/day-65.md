---
title: "Day 65 - Default Implementations"
description: "Learn about default implementations in Rust"
---

# Day 65: Default Implementations

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 10</span>
</div>

## 🎯 Today's Goal

Learn how to give trait methods default bodies so implementors get useful behavior for free, and how implementors can override those defaults when they need custom behavior.

## 📚 The Concept (3 min)

Imagine you're building a notification system with ten different channels: email, SMS, Slack, push, and so on. Every channel needs a `send` method, but almost all of them format the message the same way. Without default implementations, you'd copy the formatting code into every single `impl` block, ten copies of identical logic to keep in sync.

Rust traits solve this by letting you write a method body directly inside the trait definition. Any type implementing the trait gets that behavior automatically unless it chooses to override it. Only the methods without bodies, the *required* methods, must be written by each implementor.

This enables a powerful design pattern: define a small set of required methods, then build a rich set of default methods on top of them. Default methods can call required methods, even though those required methods have no body yet inside the trait. The standard library uses this everywhere. `Iterator` requires only one method, `next`, yet gives you over 70 default methods (`map`, `filter`, `count`, `sum`, ...) built on top of it. Implement one method, inherit an entire toolkit.

Overriding works exactly like normal implementation: write the method in your `impl` block and your version wins. One caveat, from inside an overriding method you cannot call the trait's default version of that same method; the default is fully replaced.

::: tip Key Insight
Design traits with a *minimal required core* plus default methods layered on top. Implementors write the one or two methods only they can know, and inherit everything else, just like `Iterator` gives you 70+ methods for implementing only `next`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
trait Greeter {
    // Required: no body, implementor must provide it
    fn name(&self) -> String;

    // Default: has a body, uses the required method
    fn greet(&self) -> String {
        format!("Hello, {}!", self.name())
    }
}

struct English;
struct Pirate;

impl Greeter for English {
    fn name(&self) -> String {
        String::from("Alice")
    }
    // greet() inherited from the trait
}

impl Greeter for Pirate {
    fn name(&self) -> String {
        String::from("Captain Flint")
    }
    // Override the default
    fn greet(&self) -> String {
        format!("Ahoy, {}!", self.name())
    }
}

fn main() {
    println!("{}", English.greet());
    println!("{}", Pirate.greet());
}
```

### Example 2: Practical Application

```rust
trait Notifier {
    fn channel(&self) -> String;
    fn recipient(&self) -> String;

    // Defaults built on the two required methods
    fn format_message(&self, body: &str) -> String {
        format!("[{}] to {}: {}", self.channel(), self.recipient(), body)
    }

    fn send(&self, body: &str) {
        println!("SENDING {}", self.format_message(body));
    }
}

struct Email {
    address: String,
}

struct Sms {
    number: String,
}

impl Notifier for Email {
    fn channel(&self) -> String {
        String::from("EMAIL")
    }
    fn recipient(&self) -> String {
        self.address.clone()
    }
}

impl Notifier for Sms {
    fn channel(&self) -> String {
        String::from("SMS")
    }
    fn recipient(&self) -> String {
        self.number.clone()
    }
    // SMS messages must be short: override the default
    fn format_message(&self, body: &str) -> String {
        let short: String = body.chars().take(10).collect();
        format!("[SMS] {} -> {}...", self.number, short)
    }
}

fn main() {
    let email = Email { address: String::from("dev@example.com") };
    let sms = Sms { number: String::from("+1-555-0100") };

    email.send("Your build passed successfully");
    sms.send("Your build passed successfully");
}
```

::: details Output
```
SENDING [EMAIL] to dev@example.com: Your build passed successfully
SENDING [SMS] +1-555-0100 -> Your build...
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A trait method with a body is a default implementation; implementors get it for free  
✅ Default methods can call required methods that implementors will define later  
✅ Implementors override a default simply by providing their own version in the `impl` block  
✅ The "minimal core + rich defaults" pattern (like `Iterator::next`) keeps traits easy to implement but powerful to use

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Trying to call the trait's default version from an overriding method, there's no `super` for traits; the default is completely replaced.
- Putting shared logic in every `impl` block instead of a default method, creating copies that drift out of sync.
- Forgetting that default methods can't access struct fields directly, they can only work through other trait methods on `self`.
:::

## ✅ Quick Challenge

Create a `Shape` trait with a required method `area(&self) -> f64` and a default method `describe(&self) -> String` that returns `"A shape with area X"`. Implement it for `Circle` (radius) and `Square` (side), and override `describe` for `Square` only.

```rust
// Starter code
trait Shape {
    fn area(&self) -> f64;
    // TODO: add a default describe() method here
}

struct Circle { radius: f64 }
struct Square { side: f64 }

fn main() {
    // TODO: implement the trait, then print both descriptions
    let _c = Circle { radius: 1.0 };
    let _s = Square { side: 3.0 };
}
```

<details>
<summary>💡 Hint</summary>

The default `describe` can call `self.area()` even though `area` has no body in the trait. Use `format!("A shape with area {}", self.area())`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
trait Shape {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("A shape with area {}", self.area())
    }
}

struct Circle { radius: f64 }
struct Square { side: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 {
        3.14159 * self.radius * self.radius
    }
}

impl Shape for Square {
    fn area(&self) -> f64 {
        self.side * self.side
    }
    fn describe(&self) -> String {
        format!("A perfect square covering {} units", self.area())
    }
}

fn main() {
    let c = Circle { radius: 1.0 };
    let s = Square { side: 3.0 };
    println!("{}", c.describe()); // A shape with area 3.14159
    println!("{}", s.describe()); // A perfect square covering 9 units
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Traits: Default Implementations](https://doc.rust-lang.org/book/ch10-02-traits.html#default-implementations)
- [Rust by Example - Traits](https://doc.rust-lang.org/rust-by-example/trait.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-10/day-64">← Day 64: Where Clauses</a>
  <a href="/week-10/day-66">Day 66: Trait Objects (dyn) →</a>
</div>
