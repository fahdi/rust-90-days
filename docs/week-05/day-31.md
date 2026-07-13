---
title: "Day 31 - Associated Functions"
description: "Learn about associated functions in Rust"
---

# Day 31: Associated Functions

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 5</span>
</div>

## 🎯 Today's Goal

Understand the difference between associated functions and methods, and write your own constructor-style functions like `String::new()` and `Vec::new()` for your own types.

## 📚 The Concept (3 min)

Yesterday you wrote methods, functions inside an `impl` block that take `&self` and operate on a specific instance. Today we meet their sibling: **associated functions**. These also live in an `impl` block, but they do *not* take `self` at all. They belong to the *type*, not to any particular instance.

You've been using associated functions since Day 1 without realizing it: `String::from("hello")`, `String::new()`, `Vec::new()`. Notice the syntax, the double colon `::` after the type name. That's the giveaway. Methods are called with a dot on an instance (`book.describe()`); associated functions are called with `::` on the type itself (`Book::new(...)`).

Here's an analogy. Think of a car factory versus a car. "Build me a new sedan" is a request you make to the *factory*, there's no car yet to talk to. "Turn on the headlights" is a request you make to a *specific car*. Associated functions are the factory operations; methods are the car operations. That's why the most common use for associated functions is **constructors**, functions conventionally named `new` that assemble and return a fresh instance of the type.

Rust has no special constructor keyword like other languages (`__init__` in Python, constructors in Java/C++). Instead, `new` is just a convention: an ordinary associated function that returns `Self`. Because it's ordinary, you can have as many constructors as you like, with any names you like, `Rectangle::square(5.0)`, `Config::default_dev()`, `Duration::from_secs(30)`. This is more flexible than single-constructor languages, and the names document *how* the value is being built.

::: tip Key Insight
If a function in an `impl` block takes `self` (in any form), it's a method and you call it with `.` on an instance. If it doesn't take `self`, it's an associated function and you call it with `Type::function()`. Constructors named `new` are the classic example, but `new` is just a convention, not a keyword.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
struct Book {
    title: String,
    pages: u32,
}

impl Book {
    // Associated function: no `self`, called on the type itself
    fn new(title: &str, pages: u32) -> Book {
        Book {
            title: String::from(title),
            pages,
        }
    }

    // Method: takes `&self`, called on an instance
    fn describe(&self) -> String {
        format!("'{}' has {} pages", self.title, self.pages)
    }
}

fn main() {
    // Associated functions use :: syntax on the type
    let book = Book::new("The Rust Book", 560);

    // Methods use . syntax on the instance
    println!("{}", book.describe());
}
```

### Example 2: Practical Application

Multiple constructors, each encoding a different way to build the same type:

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    // General-purpose constructor
    fn new(width: f64, height: f64) -> Rectangle {
        Rectangle { width, height }
    }

    // Specialized constructor: a square only needs one value
    fn square(side: f64) -> Rectangle {
        Rectangle {
            width: side,
            height: side,
        }
    }

    // Constructor with built-in logic: standard 16:9 screen from a width
    fn widescreen(width: f64) -> Rectangle {
        Rectangle {
            width,
            height: width * 9.0 / 16.0,
        }
    }

    fn area(&self) -> f64 {
        self.width * self.height
    }
}

fn main() {
    let banner = Rectangle::new(10.0, 4.0);
    let avatar = Rectangle::square(5.0);
    let screen = Rectangle::widescreen(1920.0);

    println!("Banner area: {}", banner.area());
    println!("Avatar area: {}", avatar.area());
    println!("Screen: {} x {}", screen.width, screen.height);
}
```

::: details Output
```
Banner area: 40
Avatar area: 25
Screen: 1920 x 1080
```
:::

Tip: you can write the return type as `Self` instead of repeating the struct name, `fn new(width: f64, height: f64) -> Self`. Inside an `impl` block, `Self` is an alias for the type being implemented, so the code keeps working if you rename the struct.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Associated functions live in an `impl` block but take no `self`, they belong to the type, not an instance  
✅ Call them with `::` on the type (`Book::new(...)`), not with `.` on a value  
✅ `new` is a naming convention for constructors, not a keyword, you can define several constructors with descriptive names like `square` or `widescreen`  
✅ `Self` inside an `impl` block is an alias for the type, so `fn new(...) -> Self` avoids repeating the struct name

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Calling an associated function with dot syntax.** `book.new("...", 100)` does NOT compile, `new` takes no `self`, so there's no instance for the dot to attach to. Use `Book::new("...", 100)`. (The reverse error is just as common: `Book::describe()` fails because `describe` needs an instance.)
- **Expecting `new` to be automatic.** Coming from Java or Python, learners assume every struct has a built-in constructor. It doesn't, if you don't write `fn new`, `Book::new(...)` is a compile error. You either write the constructor yourself or build the struct with literal syntax: `Book { title, pages }`.
- **Forgetting the return value.** An associated constructor must actually return the instance. Writing `Book { ... };` with a trailing semicolon as the last line makes the function return `()` instead of `Book`, and the compiler complains about mismatched types. Leave the semicolon off so the struct literal is the return expression.
:::

## ✅ Quick Challenge

Give `Circle` two associated functions: `new(radius: f64)` for an arbitrary circle, and `unit()` which returns a circle with radius `1.0`. Then uncomment the code in `main` and confirm the areas print correctly.

```rust
// Starter code
struct Circle {
    radius: f64,
}

impl Circle {
    // TODO: add an associated function `new(radius: f64) -> Circle`

    // TODO: add an associated function `unit() -> Circle` (radius 1.0)

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn main() {
    // Uncomment once your associated functions exist:
    // let c = Circle::new(3.0);
    // let u = Circle::unit();
    // println!("Area of c: {:.2}", c.area());
    // println!("Area of u: {:.2}", u.area());
    let _ = Circle { radius: 1.0 }.area(); // keeps the compiler happy for now
}
```

<details>
<summary>💡 Hint</summary>

Neither function takes `self`. Each one just builds and returns a `Circle` struct literal, and remember, no semicolon after the final expression. `unit()` can even reuse `new`: `Circle::new(1.0)`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Circle {
    radius: f64,
}

impl Circle {
    fn new(radius: f64) -> Circle {
        Circle { radius }
    }

    fn unit() -> Circle {
        Circle { radius: 1.0 }
    }

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn main() {
    let c = Circle::new(3.0);
    let u = Circle::unit();
    println!("Area of c: {:.2}", c.area());
    println!("Area of u: {:.2}", u.area());
}
```

Output:

```
Area of c: 28.27
Area of u: 3.14
```

</details>

## 📖 Additional Resources

- [The Rust Book - Method Syntax (Associated Functions)](https://doc.rust-lang.org/book/ch05-03-method-syntax.html#associated-functions)
- [Rust by Example - Associated functions & Methods](https://doc.rust-lang.org/rust-by-example/fn/methods.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-05/day-30">← Day 30: Struct Methods</a>
  <a href="/week-05/day-32">Day 32: Tuple Structs →</a>
</div>
