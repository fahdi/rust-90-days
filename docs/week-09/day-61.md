---
title: "Day 61 - Implementing Traits"
description: "Learn about implementing traits in Rust"
---

# Day 61: Implementing Traits

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 9</span>
</div>

## 🎯 Today's Goal

Implement traits, both your own and standard library traits like `Display`, on your types, and understand the orphan rule that governs where an `impl` may live.

## 📚 The Concept (3 min)

Yesterday you defined traits; today you put them to work. The syntax is `impl TraitName for TypeName { ... }`, and inside the block you provide a body for every required method. One type can implement any number of traits, and one trait can be implemented by any number of types, this many-to-many relationship is what makes traits so flexible.

The real payoff is implementing *standard library* traits on your own types. Want `println!("{}", my_value)` to work? Implement `std::fmt::Display`. Want `my_a == my_b`? Implement `PartialEq` (or derive it). Want `my_vec.sort()`? Implement `Ord`. Your custom types plug into the entire ecosystem, every function that says "give me anything that's `Display`" now accepts your type. This is how a three-field struct you wrote this morning can flow through formatting macros, sorting algorithms, and hash maps written years before your struct existed.

One rule keeps this sane: the **orphan rule** (coherence). You may write `impl Trait for Type` only if the trait *or* the type is defined in your own crate. You can implement your `Summary` on `Vec&lt;String&gt;` (your trait), and you can implement `Display` on your `Temperature` (your type), but you cannot implement `Display` on `Vec&lt;String&gt;`, both are foreign. Without this rule two crates could provide conflicting implementations and the compiler could not choose between them.

::: tip Key Insight
Implementing a standard trait is opting your type into existing infrastructure. One `impl Display for Temperature` block unlocks `println!("{}")`, `format!`, `.to_string()`, and every API bounded on `Display`, you write the code once and dozens of features light up.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

One trait, two implementing types:

```rust
trait Describe {
    fn describe(&self) -> String;
}

struct Dog {
    name: String,
}

struct Robot {
    id: u32,
}

impl Describe for Dog {
    fn describe(&self) -> String {
        format!("A dog named {}", self.name)
    }
}

impl Describe for Robot {
    fn describe(&self) -> String {
        format!("Unit #{}", self.id)
    }
}

fn main() {
    let rex = Dog { name: String::from("Rex") };
    let r2 = Robot { id: 42 };

    println!("{}", rex.describe());
    println!("{}", r2.describe());
}
```

### Example 2: Practical Application

Implementing the standard `Display` trait so a type works with `println!("{}")` and gets `.to_string()` for free:

```rust
use std::fmt;

struct Temperature {
    celsius: f64,
}

impl fmt::Display for Temperature {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:.1}°C ({:.1}°F)", self.celsius, self.celsius * 9.0 / 5.0 + 32.0)
    }
}

fn main() {
    let t = Temperature { celsius: 21.5 };

    println!("Current: {}", t);

    // to_string() comes free with Display
    let s = t.to_string();
    println!("As string: {}", s);
}
```

::: details Output
Example 1:
```
A dog named Rex
Unit #42
```

Example 2:
```
Current: 21.5°C (70.7°F)
As string: 21.5°C (70.7°F)
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `impl Trait for Type` provides bodies for the trait's required methods; many types can implement one trait  
✅ Implementing standard traits (`Display`, `PartialEq`, `Ord`) plugs your types into `println!`, `==`, `.sort()`, and more  
✅ The orphan rule: at least one of the trait or the type must be local to your crate  
✅ Implementing `Display` also gives you `.to_string()` automatically via a blanket implementation of `ToString`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Implementing `Display` but writing `fn fmt(&self) -> String`, the signature must be exactly `fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result`, and you write into `f` with `write!`
- Violating the orphan rule, e.g. `impl fmt::Display for Vec&lt;i32&gt;`, both are foreign, so wrap the foreign type in your own newtype struct instead
- Leaving a required method unimplemented, the compiler error "not all trait items implemented" tells you exactly which method is missing; you cannot partially implement a trait
:::

## ✅ Quick Challenge

Create a `Money` struct with `dollars: u32` and `cents: u32`. Implement `Display` so it prints like `$12.05` (cents always two digits).

```rust
// Starter code
struct Money {
    dollars: u32,
    cents: u32,
}

fn main() {
    let price = Money { dollars: 12, cents: 5 };
    // Implement Display, then:
    // println!("{}", price);
    println!("{} dollars, {} cents", price.dollars, price.cents);
}
```

<details>
<summary>💡 Hint</summary>

Use the `{:02}` format specifier to zero-pad the cents to two digits inside `write!`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::fmt;

struct Money {
    dollars: u32,
    cents: u32,
}

impl fmt::Display for Money {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "${}.{:02}", self.dollars, self.cents)
    }
}

fn main() {
    let price = Money { dollars: 12, cents: 5 };
    println!("{}", price); // $12.05
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Implementing a Trait on a Type](https://doc.rust-lang.org/book/ch10-02-traits.html#implementing-a-trait-on-a-type)
- [Rust by Example - Display](https://doc.rust-lang.org/rust-by-example/hello/print/print_display.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-09/day-60">← Day 60: Trait Definitions</a>
  <a href="/week-09/day-62">Day 62: Trait Bounds →</a>
</div>
